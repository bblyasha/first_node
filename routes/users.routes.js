const express = require("express")
const router = express.Router()
const Sentry = require("@sentry/node")
const { query, body, param, validationResult } = require('express-validator');
const UsersControllers = require('../controllers/user.controllers')
const fs = require("fs")
const UsersService = require("../services/users.services")


function validationErrors (req,res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
}

function validateUserUpdate(req, res, next) {
    const validationRules = [
        param('id').isInt().withMessage('Параметр "id" должен быть целым числом'),
        body('name').optional().isLength({ min: 2 }),
        body('isMan').optional().isBoolean().withMessage('Поле "isMan" должно быть булевым значением'),
        body('age').optional().isLength({ min: 1, max: 2 }).isNumeric()
    ];

    validationErrors(req,res)

    next();
}

router.get('/', (req,res) => {
    try {
        const users = UsersControllers.getUsers()
        res.send(users)
    } catch(err) {
        Sentry.captureException(err)
    }
})



router.post('/create', [
    body('name').not().isEmpty().withMessage('Поле "name" обязательно').isLength({min:2}),
    body('isMan').not().isEmpty().withMessage('Поле "isMan" обязательно')
    .isBoolean().withMessage('Поле "isMan" должно быть булевым значением'),
    body('age').not().isEmpty().withMessage('Поле "age" обязательно')
    .isLength({ min: 1, max: 2 }).isNumeric()
    ],
    (req,res) => {
        validationErrors(req,res)
    try {
        const newUser = req.body
        UsersControllers.addUser(newUser)
        res.send(newUser)
    } catch (err) {
        Sentry.captureException(err)
    }
})

router.put('/usersById/:id', validateUserUpdate, 
    (req,res) => {
    try {
        const userData = req.body
        const userId = req.params.id
        const userToUpdate = UsersControllers.updateUser(userId)
        if (!userToUpdate) {
            res.sendStatus(404)
        }
        Object.assign(userToUpdate, userData) 
        const users = UsersControllers.getUsers()
        const indexToReplace = users.findIndex(user => user.id == userId)
        users[indexToReplace] = userToUpdate
        UsersService.saveUsers(users)
        res.send(userToUpdate)
    } catch (err) {
        Sentry.captureException(err)
    }
})

router.patch('/usersById/:id', validateUserUpdate, 
    (req,res) => {
     try {
        const updatedField = req.body
        const userId = req.params.id
        const user = UsersControllers.updateUser(userId)
        if (!user) {
        res.sendStatus(404)
        }
        Object.assign(user,updatedField)
        const users = UsersControllers.getUsers()
        const indexToReplace = users.findIndex(user => user.id == userId)
        users[indexToReplace] = user
        UsersService.saveUsers(users)
        res.send(user)
    } catch (err) {
        Sentry.captureException(err)
    }
})

router.delete('/delete/:id', param('id').isInt().withMessage('Параметр id должен быть целым числом'),
    (req,res) => {
        validationErrors(req,res)
    try {
        const userId = req.params.id
        const i = UsersControllers.deleteUser(userId)
        
        if(i == -1) {
        res.send(false)
        }
        const result = UsersControllers.getUsers()
        result.splice(i,1)
        UsersService.saveUsers(result)
        res.send(true)
    } catch(err) {
        Sentry.captureException(err)
    }
})

router.get('/usersByGender/:gender', param('gender').isString().isLength({ min: 1, max: 1 }).withMessage('Параметр gender должен быть строкой длиной 1 символ'),
    (req, res) => {
        validationErrors(req,res)
    try {
        const userByGender = UsersControllers.getUserByGender(req.params.gender)
        UsersService.saveFilteredUsers(userByGender)
        res.send(userByGender)
    } catch (err) {
        Sentry.captureException(err)
    }
})

router.get('/filtredUsers', query('age').isNumeric().withMessage('Параметр "age" должен быть числом'),
    (req, res) => {
        validationErrors(req,res)
    try {
        const filtredUsers = UsersControllers.getUsersByAge(req.query)
        UsersService.saveFilteredUsers(filtredUsers)
        res.send(filtredUsers)
    } catch(err) {
        Sentry.captureException(err)
    }
})

module.exports = router
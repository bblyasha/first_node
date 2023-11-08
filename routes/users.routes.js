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

/**
 * @swagger
 * /api/users:
 *  get:
 *      summary: Get all users
 *      tags:
 *        - Users
 *      description: Returns users array
 *      responses:
 *        200:
 *          description: Successful response
 */



router.get('/', (req,res) => {
    try {
        const users = UsersControllers.getUsers()
        res.send(users)
    } catch(err) {
        Sentry.captureException(err)
    }
})

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags:
 *        - Users
 *     description: Creating a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"id": 1, "name": "Rikki", "age": 7, "isMan": true}
 *     responses:
 *       200:
 *         description: User has been successfully created.
 *       400:
 *         description: Bad request.
 */


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

/**
 * @swagger
 * /api/users/usersById/{userId}:
 *   put:
 *     summary: Update user
 *     tags:
 *        - Users
 *     description: Update user data.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *     request:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: string
 *     responses:
 *       200:
 *         description: User data has been successfully updated.
 */


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

/**
 * @swagger
 * /api/users/usersById/{userId}:
 *   patch:
 *     summary: Partial user update
 *     tags:
 *        - Users
 *     description: Updates part of the user's data by ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       200:
 *         description: User data has been successfully updated.
 */

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

/**
 * @swagger
 * /api/users/delete/{userId}:
 *   delete:
 *     summary: Delete user
 *     tags:
 *        - Users
 *     description: Deletes user by ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *     responses:
 *       200:
 *         description: User has been successfully deleted.
 *       400:
 *         description: Bad request.
 */


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
/**
 * @swagger
 * /api/users/usersByGender/{gender}:
 *   get:
 *     summary: Get users by gender
 *     tags:
 *        - Users
 *     description: Returns a list of users who meet the specified gender.
 *     parameters:
 *       - in: path
 *         name: gender
 *         description: Gender by which users can be obtained.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful request.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: No users with the specified gender were found.
 */


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

/**
 * @swagger
 * /api/users/filteredUsers:
 *   get:
 *     summary: Get users by age
 *     tags:
 *        - Users
 *     description: Returns a list of users who meet the specified age.
 *     parameters:
 *       - in: query
 *         name: min
 *         description: Minimum age of users (inclusive).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: max
 *         description: Maximum age of users (inclusive).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful request.
 *       404:
 *         description: No users with the specified age were found.
 */


router.get('/filteredUsers', [
    query('min').isNumeric().withMessage('Параметр minAge должен быть числом'),
    query('max').isNumeric().withMessage('Параметр maxAge должен быть числом'),
    ],
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
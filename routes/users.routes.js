const express = require("express")
const router = express.Router()
const Sentry = require("@sentry/node")
const UsersControllers = require('../controllers/user.controllers')
const fs = require("fs")
const UsersService = require("../services/users.services")
const { createValidation, deleteValidation, getByGenderValidation, getFilteredValidation, 
    validateUserUpdate, validationErrors } = require('../validationHelper.js')


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
 *             example: {"id": 1, "name": "Rikki", "isMan": true, "age": 7}
 *     responses:
 *       200:
 *         description: User has been successfully created.
 *       400:
 *         description: Bad request.
 */


router.post('/create', createValidation,
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"name": "Rikki", "isMan": true}
 *     responses:
 *       200:
 *         description: User data has been successfully updated.
 *       400:
 *         description: Bad request.
 */


router.put('/usersById/:id', validateUserUpdate, 
    (req,res) => {
    try {
        const userData = req.body
        const userId = req.params.id
        const userToUpdate = UsersControllers.updateUser(userId,userData)
        if (!userToUpdate) {
            res.sendStatus(404)
        }
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
 *             example: {"name": "Rikki", "isMan": true}
 *     responses:
 *       200:
 *         description: User data has been successfully updated.
 *       400:
 *         description: Bad request.
 */

router.patch('/usersById/:id', validateUserUpdate, 
    (req,res) => {
     try {
        const userData = req.body
        const userId = req.params.id
        const userToUpdate = UsersControllers.updateUser(userId,userData)
        if (!userToUpdate) {
            res.sendStatus(404)
        }
        res.send(userToUpdate)
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


router.delete('/delete/:id', deleteValidation,
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


router.get('/usersByGender/:gender', getByGenderValidation,
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
 *         name: minAge
 *         description: Minimum age of users (inclusive).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         description: Maximum age of users (inclusive).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful request.
 *       404:
 *         description: No users with the specified age were found.
 */


router.get('/filteredUsers', getFilteredValidation,
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
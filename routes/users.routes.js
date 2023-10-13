const express = require("express")
const router = express.Router()
const UsersControllers = require('../controllers/user.controllers')
const fs = require("fs")
const UsersService = require("../services/users.services")

router.get('/', (req,res) => {
    try {
        const users = UsersControllers.getUsers()
        res.send(users)
    } catch(err) {
        console.log(err)
    }
})

router.post('/create', (req,res) => {
    try {
        const newUser = req.body
        UsersControllers.addUser(newUser)
        res.send(newUser)
    } catch (err) {
        console.log(err)
    }
})

router.put('/usersById/:id', (req,res) => {
    try {
        //const users = UsersControllers.getUsers()
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
        console.log(err)
    }
})

router.patch('/usersById/:id', (req,res) => {
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
        console.log(err)
    }
})

router.delete('/delete/:id', (req,res) => {
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
        console.log(err)
    }
})

router.get('/usersByGender/:gender', (req, res) => {
    try {
        const userByGender = UsersControllers.getUserByGender(req.params.gender)
        UsersService.saveUsers(userByGender)
        res.send(userByGender)
    } catch (err) {
        console.log(err)
    }
})

router.get('/filtredUsers', (req, res) => {
    try {
        const filtredUsers = UsersControllers.getUsersByAge(req.query)
        UsersService.saveUsers(filtredUsers)
        res.send(filtredUsers)
    } catch(err) {
        console.log(err)
    }
})

module.exports = router
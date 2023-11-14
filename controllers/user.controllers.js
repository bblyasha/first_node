const { use } = require("../routes")
const UsersService = require("../services/users.services")


class UsersControllers {
    getUsers() {
        return UsersService.getUsers()
    }
    addUser(user) {
        const users = this.getUsers()
        users.push(user)
        UsersService.saveUsers(users)
    }
    updateUser(userId, userData) {
        const users = this.getUsers()
        const userToUpdate = users.find(item => item.id == userId)
        if (!userToUpdate) {
            return null
        }
        Object.assign(userToUpdate,userData)
        const indexToReplace = users.findIndex(user => user.id == userId)
        users[indexToReplace] = userToUpdate
        UsersService.saveUsers(users)
        return userToUpdate
    }
    deleteUser(userId) {
        const users = this.getUsers()
        return users.findIndex(item => item.id == userId)
    }
    getUserByGender(gender) {
        const users = this.getUsers()
        if (gender == 'M') {
            return users.filter(item => item.isMan)
        } 
        if (gender == 'F') {
            return users.filter(item => !item.isMan)
        } 
    }
    getUsersByAge(obj){
        const users = this.getUsers()
        const {minAge,maxAge} = obj
        return users.filter(item => item.age >= minAge && item.age <=maxAge)
    }
}

module.exports = new UsersControllers()
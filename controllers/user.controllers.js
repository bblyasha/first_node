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
    updateUser(userId) {
        const users = this.getUsers()
        return users.find(item => item.id == userId)
    }
    deleteUser(userId) {
        const users = this.getUsers()
        return users.findIndex(item => item.id == userId)
    }
    getUserByGender(gender) {
        const users = this.getUsers()
        if (gender == 'M') {
            return users.filter(item => item.isMan)
        } else {
            return users.filter(item => !item.isMan)
        } 
    }
    getUsersByAge(obj){
        const users = this.getUsers()
        const {min,max} = obj
        return users.filter(item => item.age >= min && item.age <=max)
    }
}

module.exports = new UsersControllers()
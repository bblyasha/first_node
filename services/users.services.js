const fs = require('fs')
class UsersService {
    getUsers() {
        const data = fs.readFileSync("data.json", "utf8")
        return JSON.parse(data)
    }
    saveUsers(data) {
        fs.writeFileSync('data.json', JSON.stringify(data), 'utf8')
    }
    saveFilteredUsers(data) {
        fs.writeFileSync('filteredUsers.json', JSON.stringify(data), 'utf8')
    }
}

module.exports = new UsersService
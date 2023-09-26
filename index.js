let express = require('express')
const { use } = require('express/lib/application')
const res = require('express/lib/response')
let app = express()
app.use(express.json())
const PORT = 3000

const users = [{id:1, name:"Pasha", isMan: true, age:26},
               {id:2, name:"Natalya", isMan: false, age:20},
               {id:4, name:"Liza", isMan: false, age:16},
               {id:5, name:"Motya", isMan: true, age:30},
               {id:6, name:"Alex", isMan: true, age:50}
]

app.get('/', (req,res) => {
    res.send(users)
})

app.post('/create', (req,res) => {
    users.push(req.body)
    res.send(req.body)
})

app.put('/user/:id', (req,res) => {
    const userDataToUpdate = req.body
    const  userToUpdate = users.find(item => item.id == req.params.id)
    console.log(userToUpdate)
    if (!userToUpdate) {
        res.sendStatus(404)
    }
    Object.assign(userToUpdate, userDataToUpdate)
    res.send(userToUpdate)
})

app.patch('/user/:id', (req,res) => {
    const updatedField = req.body
    console.log(updatedField)
    const user = users.find(item => item.id == req.params.id)
    if (!user) {
        res.sendStatus(404)
    }
    Object.assign(user,updatedField)
    res.send(user)
})

app.delete('/delete/:id', (req,res) => {
    const i = users.findIndex(item => item.id == req.params.id)
    if(i == -1) {
        res.send(false)
    }
    const result = users.splice(i,1)
    res.send(true)
})

app.get('/users/:gender', (req, res) => {
    if (req.params.gender == 'M') {
        res.send(users.filter(item => item.isMan == true))
    } else {
        res.send(users.filter(item => item.isMan == false))
    } 
})

app.get('/filtredUsers', (req, res) => {
    const minAge = req.query.min
    const maxAge = req.query.max
    const filtredUsers = users.filter(item => item.age >= minAge && item.age <=maxAge)
    res.send(filtredUsers)
})
app.listen(PORT,() => {
    console.log(`example app listenig on ${PORT}`)
})



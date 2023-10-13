let express = require('express')
require('dotenv').config()
const { use } = require('express/lib/application')
const res = require('express/lib/response')
let app = express()
app.use(express.json())
const PORT = process.env.PORT
const fs = require("fs")


const routes = require("./routes/index")
app.use('/api', routes)


app.listen(PORT,() => {
    console.log(`example app listenig on ${PORT}`)
})



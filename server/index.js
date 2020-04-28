require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const {notFound,errors} = require('./controllers')
const routes = require('./routes')
const db = require('./models')

require('./db/mongoose')

app.get('/',(req,res,next)=>{
    res.json({
        data:' root api is workin\' ',
    }).status(200)
})

// morgan middleware
app.use(morgan('dev'))
//CORS middleware if I will use front-end for that
if(process.env.NODE_ENV !== 'production'){
    app.use(cors({
        origin:`http://127.0.0.1:3000` // front end port goes here
    }))
}
//All bodyParser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

//Routes middleware
app.use('/api/auth',routes.auth)

//Error Handling middleware
app.use(notFound)
app.use(errors)

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log('server is up n running \n')
})

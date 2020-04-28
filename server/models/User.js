const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('../models')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        max:32
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    salt:String,
    resetPassLink:{
        data:String,
        default:''
    },
    role:{
        type:String,
        default:'subscriber'
    }
},{timestamps:true})

// for more security purpose either you can put directly hashed pass in schema and make a virtual field password or you can explicitly erase plain pass to be store in schema 
//Hashing password before save
userSchema.pre('save',async function(next){
    const user = this
    try {
        if(!user.isModified('password')){
            return next()
        }
        const hashed_password = await bcrypt.hash(user.password,10)
        user.password = hashed_password
        next()        
    } catch (error) {
        return next({
            status:400,
            message:error.message
        })
    }
})

//Generating token
userSchema.methods.generateToken = function(){
    try {
        const user = this
        const {
            _id,
            name,
            email
        } = user

        let payload = {
            _id,
            name,
            email
        }

        const token = jwt.sign(payload,process.env.SECRET_KEY,{
            algorithm:"HS512",
            expiresIn:3600*24*7 //1 week
        })

        return token

    } catch (error) {
        return new Error('No token generated')
    }
}
userSchema.methods.generateTokenForLink = function(){
    try {
        const user = this
        const {
            _id,
            name,
            email,
            password
        } = user

        let payload = {
            _id,
            name,
            email,
            password
        }

        const token = jwt.sign(payload,process.env.SECRET_KEY,{
            algorithm:"HS512",
            expiresIn:3600*24*7 //1 week
        })

        return token

    } catch (error) {
        return new Error('No token generated')
    }
}
//Finding user by email and password, a custom query for login
userSchema.statics.findByCredentials = async function({email,password},next){
    try{
        const user = await db.User.findOne({email})

        if(!user){
            throw new Error('User not Found')
        }

        const isValidPassword = await bcrypt.compare(password,user.password)

        if(!isValidPassword){
            throw new Error('Password is incorrect')
        }

        return user

    }catch(error){
        next({
            status:400,
            message:error.message
        })
    }
}

module.exports = mongoose.model('User',userSchema)
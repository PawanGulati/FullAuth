const db = require('../models')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.signIn = async (req,res,next)=>{
    try {
        const user = await db.User.findByCredentials(req.body,next)

        if(!user){
            throw new Error('Credentials not matching')
        }

        const {name, _id} = user

        const token = await user.generateToken()

        res.status(200).json({
            _id,
            name,
            token,
        })

        next()

    } catch (error) {
        next({
            status:400,
            message:error.message
        })
    }
}

exports.signUp = async (req,res,next)=>{
    try {
        const user = await new db.User(req.body)
        
        const {_id,name,email} = user

        const userExists = await db.User.findOne({email})
        if(userExists) throw new Error('Email Already Exists!!')

        const token = await user.generateTokenForLink()

        const msg = {
            to: email, // process.env.EMAIL_TO,
            from: process.env.EMAIL_FROM,
            subject: 'Account verification link',
            html: `
                <h2>Full Auth welcomes you to our community.</h2> <br/> <h2>Please verify yourself</h2>
                <p>Please verify yourself by clicking on following link</p>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This link contain sensitive information don\'t share</p>
            `,
        }

        sgMail.send(msg).then(async (send)=>{
            // await user.save()

            res.status(200).json({
                _id,
                name,
                token,
                message:'Email has been sent'
            })

            next()
        }).catch((error)=>{
            next({
                status:401,
                message:error.message
            })
        })

    } catch (error) {
        if(error.code === 11000) next({
            status:400,
            message:'Email Already taken'
        })
        next({
            status:400,
            message:error.message
        })
    }
}

//Working on SignUp so it is messed up
exports.accountVerify = async (req,res,next)=>{
    try {
        const {token} = req.body

        if(token){
            const decode = await jwt.verify(token,process.env.SECRET_KEY)
            console.log(decode);
        }else{
            throw new Error('some error ocurred during verification.Try again!')
        }
    } catch (error) {
        throw new Error('Expired Link! SignUp again')
    }
}
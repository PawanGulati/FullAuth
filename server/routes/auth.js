const Router = require('express').Router()

const control = require('../controllers')
const {signUpValidator,signInValidator} = require('../validators/user')
const {runValidation} = require('../validators')

Router.post('/signin',signInValidator,runValidation,control.signIn)

Router.post('/signup',signUpValidator,runValidation,control.signUp)

Router.post('/account-activation',control.accountVerify)

module.exports = Router


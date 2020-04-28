module.exports={
    ...require('./auth')
}

module.exports.notFound = (req,res,next)=>{
    const error = new Error('Not Found')
    error.status=(404)
    next(error)
}

module.exports.errors = (error,req,res,next)=>{
    return res.json({
        success:'fail',
        message:error.message || 'Something went wrong!!'
    }).status(error.status || 500)
}

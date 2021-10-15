const User = require('../users/users-model')


function checkUsernameAndPassword(req, res, next) {
    const { username, password } = req.body 
    if(!username || !password ) {
        res.status(400).json({
            message: 'username and password required'
        })
    } else {
        next()
    }
}

async function checkUsernameFree(req, res, next) {
    try {
        const users = await User.findBy({ username: req.body.username })
        if (!users.length) {
            next()
        } else {
            next({
                status: 422,
                message: "username taken"
            })
        }
    } catch (err) {
        next(err)
    }
}

const checkUsernameExists = async (req, res, next) => {
    try {
        const [user] = await User.findBy({ username: req.body.username })
        if (user) {
            req.user = user
            next()
        } else {
            next({
                status: 401,
                message: "invalid credentials"
            })
        }
    } catch (err) {
        next(err)
    }
}


module.exports = {
    checkUsernameAndPassword,
    checkUsernameFree,
    checkUsernameExists,
}
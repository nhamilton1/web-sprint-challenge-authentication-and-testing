const User = require('../users/users-model')


// async function checkUsernameAndPassword(req, res, next) {
//     try {
//         const users = 
//     } catch (err) {
//         next(err)
//     }
// }

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
                message: "Invalid credentials"
            })
        }
    } catch (err) {
        next(err)
    }
}


module.exports = {
    checkUsernameFree,
    checkUsernameExists,
}
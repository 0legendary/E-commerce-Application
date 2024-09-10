import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import User from '../model/user.js';
dotenv.config();

const authenticateToken =  (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null || token === undefined) return res.status(401)  

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401);
        req.user = user
        const userData = await User.findOne({email: user.email})
        if(userData && userData.isBlocked)  return res.status(401)
        if (req.user.isAdmin) return res.status(401)
        next()
    })
}

const getUser = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null || token === undefined) next()  

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401);
        req.user = user
        if (req.user.isAdmin) return res.status(401)
        next()
    })
}

const authenticateTokenAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (token == null) return res.status(401)   

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401);
        req.user = user
        if (!req.user.isAdmin) return res.status(401)
        next()
    })
}

const CheckAlreadyLogin = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)return next()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return next()
        req.user = user
        next()
    })
}


const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
}

export { authenticateToken, generateAccessToken, authenticateTokenAdmin,CheckAlreadyLogin, getUser }
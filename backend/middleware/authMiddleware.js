import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null || token === undefined) return res.status(401)  

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
    if (token == null) next()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return next()
        req.user = user
        next()
    })
}


const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' })
}

export { authenticateToken, generateAccessToken, authenticateTokenAdmin,CheckAlreadyLogin }
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

const authenticateToken = (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(401); 
        req.user = user
        next()
    })
}

const generateAccessToken = (user) => {
    return  jwt.sign({ username: user }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'})
}



export {authenticateToken, generateAccessToken}
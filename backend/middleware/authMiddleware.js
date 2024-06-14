import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();

const authenticateToken = (req,res,next) => {
    //console.log('trying1');
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401)
    //console.log('trying2');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //console.log('trying3');
        if(err) return res.status(401); 
        req.user = user
        next()
    })
}

const generateAccessToken = (user) => {
    return  jwt.sign({ username: user }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

export {authenticateToken, generateAccessToken}
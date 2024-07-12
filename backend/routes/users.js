import { Router } from 'express';
import { authenticateToken, authenticateTokenAdmin } from '../middleware/authMiddleware.js';
// import { getDB, Collections } from '../config/db.js';

const router = Router();

router.post('/get-user', authenticateToken, async (req, res) => {
  const user = req.user.username
  if(user){
    const db = getDB()
    const userData = await db.collection(Collections.users).findOne({username:user},{ projection: { password: 0 } })
    if(userData){
        res.status(200).json(userData)
    }else{
        res.status(201)
    }
  }
});


export default router;


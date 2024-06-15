import { Router } from 'express';
import { getDB, Collections } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/get-users', authenticateToken, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.users).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})


router.post('/update-user', authenticateToken, async (req, res) => {
    const { _id, username, email, newPassword } = req.body
    const db = getDB()

    const user = await db.collection(Collections.users).findOne({ _id: ObjectId.createFromHexString(_id) })
    if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = {
            username,
            email,
            ...(newPassword !== '' && { password: hashedPassword })
        }
        const update = await db.collection(Collections.users).updateOne(
            { _id : ObjectId.createFromHexString(_id) },
            {$set : updateUser}
        )
        if(update.modifiedCount > 0){
            res.status(200).json({status: true})
        }else{
            res.status(404).json({status: false})
        }
    }
})
export default router;

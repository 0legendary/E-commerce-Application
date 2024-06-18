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
    const userId = ObjectId.createFromHexString(_id);
    const user = await db.collection(Collections.users).findOne({ _id: userId })
    if (user) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = {
            username,
            email,
            ...(newPassword !== '' && { password: hashedPassword })
        }
        const update = await db.collection(Collections.users).updateOne(
            { _id: userId },
            { $set: updateUser }
        )
        if (update.modifiedCount > 0) {
            res.status(200).json({ status: true })
        } else {
            res.status(404).json({ status: false })
        }
    }
})

router.delete('/delete-user', authenticateToken, async (req, res) => {
    const { status, _id } = req.body
    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);
    if (status) {
        const deletion = await db.collection(Collections.users).deleteOne({ _id: userId })
        if (deletion.deletedCount > 0) {
            res.status(200).json({ status: true })
        } else {
            res.status(404).json({ status: false })
        }
    } else {
        const user = await db.collection(Collections.users).findOne({ _id: userId })
        if (user) {
            const deletion = await db.collection(Collections.users).deleteOne({ _id: userId })
            if (deletion.deletedCount > 0) {
                const insertion = await db.collection(Collections.trashUsers).insertOne({ username: user.username, email: user.email, password: user.password, createdAt: user.createdAt });
                if (insertion.insertedId) {
                    res.status(200).json({ status: true })
                }
            } else {
                res.status(404).json({ status: false })
            }
        }
    }
})

router.get('/trashed-users', authenticateToken, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.trashUsers).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

router.post('/delete-users-trash', authenticateToken, async (req, res) => {
    
    const  _id  = req.body.data

    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);

    const user = await db.collection(Collections.trashUsers).findOne({ _id: userId })
    if (user) {
        const deletion = await db.collection(Collections.trashUsers).deleteOne({ _id: userId })
        if (deletion.deletedCount > 0) {
            const insertion = await db.collection(Collections.users).insertOne({ username: user.username, email: user.email, password: user.password, createdAt: user.createdAt });
            if (insertion.insertedId) {
                res.status(200).json({ status: true })
            }
        } else {
            res.status(404).json({ status: false })
        }
    }
})


router.post('/delete-trashed-user', authenticateToken, async (req, res) => {
    const  _id  = req.body.data
    if (!_id) return res.status(404).json({ status: false })
    const db = getDB()
    const userId = ObjectId.createFromHexString(_id);
        const deletion = await db.collection(Collections.trashUsers).deleteOne({ _id: userId })
        if (deletion.deletedCount > 0) {
            res.status(200).json({ status: true })
        } else {
            res.status(404).json({ status: false })
        }
})

export default router;


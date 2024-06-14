import { Router } from 'express';
import { getDB, Collections } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();

router.get('/get-users', authenticateToken, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.users).find().toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

export default router;

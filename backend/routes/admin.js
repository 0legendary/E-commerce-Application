import { Router } from 'express';
import { authenticateTokenAdmin } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import Image from '../model/image.js';
import Product from '../model/product.js';

const router = Router();

router.get('/get-users', authenticateTokenAdmin, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.users).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

router.post('/uploadImage', authenticateTokenAdmin, async (req, res) => {
    const { base64 } = req.body;
    try {
        const newImage = new Image({ image: base64 });
        const savedImage = await newImage.save();
        res.status(201).json({ imageId: savedImage._id });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
});


router.post('/addProduct', authenticateTokenAdmin, async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
        });
        console.log(newProduct.name);

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading files' });
    }
})


router.post('/update-user', authenticateTokenAdmin, async (req, res) => {
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

router.delete('/delete-user', authenticateTokenAdmin, async (req, res) => {
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

router.get('/trashed-users', authenticateTokenAdmin, async (req, res) => {
    const db = getDB()
    try {
        const users = await db.collection(Collections.trashUsers).find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
})

router.post('/delete-users-trash', authenticateTokenAdmin, async (req, res) => {

    const _id = req.body.data

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


router.post('/delete-trashed-user', authenticateTokenAdmin, async (req, res) => {
    const _id = req.body.data
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


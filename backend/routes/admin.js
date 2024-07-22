import { Router } from 'express';
import { authenticateTokenAdmin } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import Image from '../model/image.js';
import Product from '../model/product.js';
import TrashedProduct from '../model/trashedProduct.js';
import User from '../model/user.js'

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


router.post('/deleteImage', authenticateTokenAdmin, async (req, res) => {
    const { _id, product_id } = req.body;
    try {
        const deletedImage = await Image.findByIdAndDelete(_id);

        if (!deletedImage) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const product = await Product.findById(product_id);
        const updatedAdditionalImages = product.additionalImages.filter(image => image !== _id);
        product.additionalImages = updatedAdditionalImages;

        await product.save();

        res.status(200).json({ status: true, message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting image', message: error.message });
    }
});

router.post('/addProduct', authenticateTokenAdmin, async (req, res) => {
    try {
        const newProduct = new Product({
            ...req.body,
        });
        console.log(newProduct);
        await newProduct.save();
        res.status(201).json({ status: true, product: newProduct });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
})

const getBase64Image = async (products) => {
    return await Promise.all(products.map(async product => {
        // Find the main image
        const mainImage = await Image.findById(product.mainImage);

        // Find additional images
        const additionalImages = await Promise.all(
            product.additionalImages.map(async id => {
                const image = await Image.findById(id);
                return image ? image.image : null;
            })
        );

        // Filter out any null values from additional images
        const filteredAdditionalImages = additionalImages.filter(image => image !== null);
        return {
            ...product,
            mainImage: mainImage ? mainImage.image : null,
            additionalImages: filteredAdditionalImages
        };
    }));
}

const getOneBase64Image = async (product) => {

    const mainImageDoc = await Image.findById(product.mainImage);
    const additionalImagesDocs = await Promise.all(
        product.additionalImages.map(async id => await Image.findById(id))
    );

    const productObj = product.toObject();

    return {
        ...productObj,
        mainImage: [{ _id: product.mainImage, url: mainImageDoc.image }],
        additionalImages: additionalImagesDocs.map(imageDoc => ({
            _id: imageDoc._id,
            url: imageDoc.image
        }))
    };
}





router.get('/getProducts', authenticateTokenAdmin, async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        //console.log(products);
        const populatedProducts = await getBase64Image(products)
        //console.log(populatedProducts);
        res.status(201).json({ status: true, products: populatedProducts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});


router.get('/edit/getProduct/:id', authenticateTokenAdmin, async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        const populatedProducts = await getOneBase64Image(product)
        if (populatedProducts) {
            res.status(200).json({ status: true, product: populatedProducts });
        } else {
            res.status(404).json({ status: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching product' });
    }
});

router.put('/updateProduct', authenticateTokenAdmin, async (req, res) => {
    const updatedProductData = req.body;

    try {
        // Fetch the product by its ID
        const product = await Product.findById(updatedProductData._id);

        if (product) {
            // Update the product fields with the new data
            for (const key in updatedProductData) {
                if (updatedProductData.hasOwnProperty(key) && key !== '_id') {
                    product[key] = updatedProductData[key];
                }
            }

            await product.save();

            res.status(200).json({ status: true });
        } else {
            res.status(404).json({ status: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error updating product', error: error.message });
    }
});




router.post('/moveToTrash', authenticateTokenAdmin, async (req, res) => {
    const { product_id } = req.body;
    console.log(product_id);
    try {
        // Find the product by ID
        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }
        // Create a new document in the trashedProducts collection
        const trashedProduct = new TrashedProduct(product.toObject());
        await trashedProduct.save();

        // Delete the product from the Product collection
        await Product.findByIdAndDelete(product_id);

        res.status(200).json({ status: true, message: 'Product moved to trash successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to move product to trash', error: error.message });
    }
});


router.post('/deletePermenent', authenticateTokenAdmin, async (req, res) => {
    const { product_id } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        // Extract image IDs
        const { mainImage, additionalImages } = product;
        const imageIds = [mainImage, ...additionalImages];

        await Product.findByIdAndDelete(product_id);

        await Image.deleteMany({ _id: { $in: imageIds } });

        res.status(200).json({ status: true, message: 'Product and associated images deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete product and images', error: error.message });
    }
});



router.get('/getAllUsers', authenticateTokenAdmin, async (req, res) => {
    try {
        const users = await User.find({})
        res.status(201).json({ status: true, users: users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});


router.post('/toggleBlockUser', authenticateTokenAdmin, async (req, res) => {
    const { id, isBlocked } = req.body;
    try {
        const user = await User.findById(id);
        if (user) {
            user.isBlocked = isBlocked;
            await user.save();
            res.json({ status: true });
        } else {
            res.json({ status: false, message: 'User not found' });
        }
    } catch (error) {
        res.json({ status: false, message: 'Error updating user status', error });
    }
});


















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


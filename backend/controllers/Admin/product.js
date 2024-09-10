import Image from "../../model/image.js";
import Product from "../../model/product.js";
import TrashedProduct from "../../model/trashedProduct.js";
import { createResponse } from "../../utils/responseHelper.js";

export const addNewProduct = async (req, res) => {
    let newProductData = req.body
    try {
        let savedImage = null;
        if (newProductData.images && newProductData.images.length > 0) {
            const newImage = new Image({ images: newProductData.images });
            savedImage = await newImage.save();
            newProductData.images = savedImage._id;
        }

        const newProduct = new Product({
            ...newProductData,
        });
        await newProduct.save();
        res.status(201).json(createResponse(true, 'Product created successfully', { newProduct }));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error uploading files', null, error.message));
    }
}

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).lean().populate('images')
        res.status(201).json(createResponse(true, 'Product fetched successfully', { products }));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error uploading files', null, error.message));
    }
}

export const editProducts = async (req, res) => {
    const productId = req.params.product_id;
    try {
        const product = await Product.findById(productId).populate('images')
        if (product) {
            res.status(200).json(createResponse(true, 'Product found', {
                product,
            }));
        } else {
            res.status(404).json(createResponse(false, 'Product not found'));
        }
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error fetching product', null, error.message));
    }
}


export const updateProducts = async (req, res) => {
    const { updatedProductData, filesID } = req.body;

    try {
        let product = await Product.findById(updatedProductData._id);

        if (updatedProductData.images && updatedProductData.images.length > 0) {
            if (filesID) {
                const updatedImage = await Image.findByIdAndUpdate(
                    { _id: filesID },
                    { images: updatedProductData.images },
                    { new: true }
                );
                if (updatedImage) {
                    product.images = updatedImage._id;
                } else {
                    return res.status(404).json(createResponse(false, 'Image not found'));
                }
            } else {
                const newImage = new Image({ images: updatedProductData.images });
                const savedImage = await newImage.save();
                product.images = savedImage._id;
            }
        } else {
            product.images = null;
        }


        if (product) {
            for (const key in updatedProductData) {
                if (updatedProductData.hasOwnProperty(key) && key !== '_id' && key !== 'images') {
                    product[key] = updatedProductData[key];
                }
            }
            await product.save();

            return res.status(200).json(createResponse(true, 'Product updated successfully'));
        } else {
            return res.status(404).json(createResponse(false, 'Product not found'));
        }
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Error updating product', null, error.message));
    }
}

export const moveToTrashProduct = async (req, res) => {
    const { product_id } = req.body;
    try {
        // Find the product by ID
        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json(createResponse(false, 'Product not found'));
        }
        // Create a new document in the trashedProducts collection
        const trashedProduct = new TrashedProduct(product.toObject());
        await trashedProduct.save();

        // Delete the product from the Product collection
        await Product.findByIdAndDelete(product_id);

        return res.status(200).json(createResponse(true, 'Product moved to trash successfully'));
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Failed to move product to trash', null, error.message));
    }
}

export const deletePermenantly = async (req, res) => {
    const { product_id } = req.body;

    try {

        // Find the product by ID
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json(createResponse(false, 'Product not found'));
        }
        await Product.findByIdAndDelete(product_id);
        await Image.findByIdAndDelete(product.images);

        return res.status(200).json(createResponse(true, 'Product and associated images deleted successfully'));
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Failed to delete product and images', null, error.message));
    }
}


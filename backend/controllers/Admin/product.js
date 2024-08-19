import Image from "../../model/image.js";
import Product from "../../model/product.js";
import TrashedProduct from "../../model/trashedProduct.js";


export const getOneBase64Image = async (product) => {

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

export const addImage = async (req, res) => {
    const { base64 } = req.body;
    try {
        const newImage = new Image({ image: base64 });
        const savedImage = await newImage.save();
        res.status(201).json({ imageId: savedImage._id });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading image' });
    }
}
export const deleteImage = async (req, res) => {
    const { _id, product_id, isMain } = req.body;
    try {
        const deletedImage = await Image.findByIdAndDelete(_id);

        if (!deletedImage) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const product = await Product.findById(product_id);
        if (!isMain) {
            const updatedAdditionalImages = product.additionalImages.filter(image => image !== _id);
            product.additionalImages = updatedAdditionalImages;
            await product.save();
        }

        res.status(200).json({ status: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error deleting image', message: error.message });
    }
}

export const addNewProduct = async (req, res) => {
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
}

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).lean();
        const populatedProducts = await getBase64Image(products)
        res.status(201).json({ status: true, products: populatedProducts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const editProducts = async (req, res) => {
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
}

export const updateProducts = async (req, res) => {
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
}

export const moveToTrashProduct = async (req, res) => {
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
}

export const deletePermenantly  = async (req, res) => {
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
}


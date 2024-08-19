import Category from "../../model/category.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
        res.status(201).json({ status: true, categories: categories });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const createNewCategory = async (req, res) => {
    try {
        const newCategory = new Category({
            ...req.body,
            isBlocked: false
        });
        await newCategory.save();
        res.status(201).json({ status: true, category: newCategory });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
}

export const editCategory = async (req, res) => {
    const { name, description, _id } = req.body;
    try {
        const existingCategory = await Category.findById(_id);
        if (existingCategory) {
            existingCategory.name = name;
            existingCategory.description = description;
            existingCategory.isBlocked = false
            await existingCategory.save();
            res.status(201).json({ status: true, category: existingCategory });
        } else {
            res.status(404).json({ status: false, error: 'Category not found' });
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
}

export const deleteCategory = async (req, res) => {
    const { _id } = req.params;
    console.log(_id);
    try {
        await Category.findByIdAndDelete(_id);
        res.status(201).json({ status: true });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
}

export const toggleCategory = async (req, res) => {
    const { _id } = req.body
    try {
        const category = await Category.findById(_id);
        if (category) {
            category.isBlocked = !category.isBlocked;
            await category.save();
            res.status(200).json({ status: true, category });
        } else {
            res.status(404).json({ status: false, error: 'Category not found' });
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
}
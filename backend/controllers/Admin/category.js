import Category from "../../model/category.js";
import { createResponse } from "../../utils/responseHelper.js";


export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json(createResponse(true, 'Categories fetched successfully', {categories}));
    } catch (error) {
        return res.status(500).json(createResponse(false, 'Error fetching categories', null, error.message));
    }
};

export const createNewCategory = async (req, res) => {
    try {
        const newCategory = new Category({
            ...req.body,
            isBlocked: false
        });
        await newCategory.save();
        return res.status(201).json(createResponse(true, 'Category created successfully', {newCategory}));
    } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json(createResponse(false, 'Error creating category', null, error.message));
    }
};

export const editCategory = async (req, res) => {
    const { name, description, _id } = req.body;
    try {
        const existingCategory = await Category.findById(_id);
        if (existingCategory) {
            existingCategory.name = name;
            existingCategory.description = description;
            existingCategory.isBlocked = false
            await existingCategory.save();
            res.status(201).json(createResponse(201, 'Category updated successfully', {existingCategory}));
        } else {
            res.status(404).json(createResponse(404, 'Category not found'));
        }
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error updating category', null, error.message));

    }
}

export const deleteCategory = async (req, res) => {
    const { category_id } = req.params;
    try {
        const result = await Category.findByIdAndDelete(category_id);
        if (result) {
            res.status(200).json(createResponse(200, 'Category deleted successfully'));
        } else {
            res.status(404).json(createResponse(404, 'Category not found'));
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json(createResponse(500, 'Error deleting category', null, error.message));
    }
};


export const toggleCategory = async (req, res) => {
    const { category_id } = req.body;
    try {
        const category = await Category.findById(category_id);
        if (category) {
            category.isBlocked = !category.isBlocked;
            await category.save();
            res.status(200).json(createResponse(200, 'Category toggled successfully', {category}));
        } else {
            res.status(404).json(createResponse(404, 'Category not found'));
        }
    } catch (error) {
        console.error('Error toggling category:', error);
        res.status(500).json(createResponse(500, 'Error toggling category', null, error.message));
    }
};

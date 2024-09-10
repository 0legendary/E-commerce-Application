import Product from "../../model/product.js";
import Order from "../../model/order.js";
import Category from "../../model/category.js";
import { createResponse } from "../../utils/responseHelper.js";

// Top 5 Selling Categories and Brands based on orders
export const topOrderCategory = async (req, res) => {
    try {
        // Top 5 Selling Categories
        const topCategories = await Order.aggregate([
            { 
                // Unwind the products array in orders
                $unwind: "$products"
            },
            {
                $lookup: {
                    // Join with the Product collection
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                // Unwind the joined product details
                $unwind: "$productInfo" 
            },
            {
                $lookup: {
                    // Join with the Category collection
                    from: "categories", 
                    localField: "productInfo.categoryId",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            {
                // Unwind the joined category details
                $unwind: "$categoryInfo" 
            },
            {
                $group: {
                    // Group by category name
                    _id: "$categoryInfo.name", 
                    totalSold: { $sum: "$products.quantity" } 
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 5 
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalSold: 1
                }
            }
        ]);

        // Top 5 Selling Brands
        const topBrands = await Order.aggregate([
            {
                $unwind: "$products" 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: "$productInfo"
            },
            {
                $group: {
                    _id: "$productInfo.brand",
                    totalSold: { $sum: "$products.quantity" }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    brand: "$_id",
                    totalSold: 1
                }
            }
        ]);

        res.status(200).json(createResponse(true, 'Top categories and brands fetched successfully', { topCategories, topBrands }));

    } catch (error) {
        res.status(500).json(createResponse(false, 'Error fetching data', null, error.message));
    }
};

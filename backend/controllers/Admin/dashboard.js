import Product from "../../model/product.js";


export const topOrderCategory = async (req, res) => {
    try {
        const topCategories = await Product.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ]);

        const topBrands = await Product.aggregate([
            {
                $group: {
                    _id: "$brand",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    brand: "$_id",
                    count: 1
                }
            }
        ]);


        res.status(201).json({ status: true, topCategories, topBrands});
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}
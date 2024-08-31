import Order from "../../model/order.js";

export const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find({})
            .populate({
                path: 'products.productId',
                select: 'images',
                populate: {
                    path: 'images',
                    select: 'image'
                }
            })
            .populate({
                path: 'customerId',
                select: 'name email mobile'
            });

        res.json({ status: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Error fetching user' });
    }
}
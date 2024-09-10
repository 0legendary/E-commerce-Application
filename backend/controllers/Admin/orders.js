import { trusted } from "mongoose";
import Order from "../../model/order.js";
import { createResponse } from "../../utils/responseHelper.js";

export const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find({})
            .populate({
                path: 'products.productId',
                select: 'images',
                populate: {
                    path: 'images',
                    select: 'images'
                }
            })
            .populate({
                path: 'customerId',
                select: 'name email mobile'
            });
        res.json(createResponse(true, 'Orders fetched successfully', {orders}));
    } catch (error) {
        res.status(500).json(createResponse(false, 'Error fetching orders', null, error.message));
    }
}
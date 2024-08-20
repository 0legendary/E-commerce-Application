import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    reviewText: {
        type: String,
        maxlength: 500
    },
    response: {
        type: String,
        maxlength: 500
    },
    imagesId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
    }],
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

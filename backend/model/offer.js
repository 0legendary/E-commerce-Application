import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['product', 'category', 'referral'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    discountAmount: {
        type: Number,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableTo: [mongoose.Schema.Types.ObjectId],
    referralCode: {
        type: String
    },
    rewardPerReferral: {
        type: Number
    }
});


const Offer = mongoose.model('Offer', offerSchema);

export default Offer;

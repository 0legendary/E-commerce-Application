import Category from '../../model/category.js';
import Image from '../../model/image.js';
import Offer from '../../model/offer.js';
import Product from '../../model/product.js';
import {
    deleteFile,
    UploadcareSimpleAuthSchema,
} from '@uploadcare/rest-client';

const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
    secretKey: process.env.UPLOADCARE_SECRET_KEY,
});

export const getOffersAdmin = async (req, res) => {
    try {
        const offers = await Offer.find({})
            .populate({
                path: 'imageID',
                select: 'images'
            }).lean();
        const categories = await Category.find({})
        const products = await Product.find({})
            .populate({
                path: 'images',
                select: 'images'
            }).lean();
        res.status(201).json({ status: true, offers, categories, products });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const createNewOfferAdmin = async (req, res) => {
    const offerData = req.body;

    try {
        const newImage = new Image({ images: offerData.images });
        const savedImage = await newImage.save();

        const offer = new Offer({
            type: offerData.type,
            imageID: savedImage ? savedImage._id : null,
            description: offerData.description,
            discountPercentage: offerData.discountPercentage,
            discountAmount: offerData.discountAmount,
            startDate: offerData.startDate,
            endDate: offerData.endDate,
            applicableTo: offerData.applicableTo,
            referralCode: offerData.referralCode,
            rewardPerReferral: offerData.rewardPerReferral
        });
        await offer.save();

        if (offerData.type === 'product') {
            await Product.updateMany(
                { _id: { $in: offerData.applicableTo } },
                { $push: { offers: offer._id } }
            );
        } else if (offerData.type === 'category') {
            await Category.updateMany(
                { _id: { $in: offerData.applicableTo } },
                { $push: { offers: offer._id } }
            );
        }

        res.status(200).json({ status: true });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error' });
        console.error('Error creating offer:', error);
    }
}

export const editOfferAdmin = async (req, res) => {
    const { editedData, imageID } = req.body;
    let offerData = editedData
    try {
        const offer = await Offer.findById(offerData._id);

        if (!offer) {
            return res.status(404).json({ status: false, message: 'Offer not found' });
        }

        if (offerData.images && imageID) {
            const existingImage = await Image.findById(imageID);
            if (!existingImage) {
                const newImage = new Image({ images: offerData.images });
                const savedImage = await newImage.save();
                offer.imageID = savedImage._id
            }
            existingImage.images = offerData.images;
            await existingImage.save();
            offer.imageID = existingImage._id;
        } else {
            const newImage = new Image({ images: offerData.images });
            const savedImage = await newImage.save();
            offer.imageID = savedImage._id
        }


        // Update applicableTo
        if (offerData.type !== offer.type) {
            if (offer.type === 'product') {
                await Product.updateMany(
                    { _id: { $in: offer.applicableTo } },
                    { $pull: { offers: offer._id } }
                );
            } else if (offer.type === 'category') {
                await Category.updateMany(
                    { _id: { $in: offer.applicableTo } },
                    { $pull: { offers: offer._id } }
                );
            }

            if (offerData.type === 'product') {
                await Product.updateMany(
                    { _id: { $in: offerData.applicableTo } },
                    { $push: { offers: offer._id } }
                );
            } else if (offerData.type === 'category') {
                await Category.updateMany(
                    { _id: { $in: offerData.applicableTo } },
                    { $push: { offers: offer._id } }
                );
            }
        } else {
            // If the type remains the same, only update applicableTo
            const addedApplicableTo = offerData.applicableTo.filter(id => !offer.applicableTo.includes(id));
            const removedApplicableTo = offer.applicableTo.filter(id => !offerData.applicableTo.includes(id));

            if (addedApplicableTo.length > 0) {
                if (offer.type === 'product') {
                    await Product.updateMany(
                        { _id: { $in: addedApplicableTo } },
                        { $push: { offers: offer._id } }
                    );
                } else if (offer.type === 'category') {
                    await Category.updateMany(
                        { _id: { $in: addedApplicableTo } },
                        { $push: { offers: offer._id } }
                    );
                }
            }

            if (removedApplicableTo.length > 0) {
                if (offer.type === 'product') {
                    await Product.updateMany(
                        { _id: { $in: removedApplicableTo } },
                        { $pull: { offers: offer._id } }
                    );
                } else if (offer.type === 'category') {
                    await Category.updateMany(
                        { _id: { $in: removedApplicableTo } },
                        { $pull: { offers: offer._id } }
                    );
                }
            }
        }

        // Update offer details
        offer.type = offerData.type;
        offer.description = offerData.description;
        offer.discountPercentage = offerData.discountPercentage;
        offer.discountAmount = offerData.discountAmount;
        offer.startDate = offerData.startDate;
        offer.endDate = offerData.endDate;
        offer.applicableTo = offerData.applicableTo;
        offer.referralCode = offerData.referralCode;
        offer.rewardPerReferral = offerData.rewardPerReferral;
        await offer.save();


        res.status(200).json({ status: true });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error' });
        console.error('Error while editing offer:', error);
    }
}

export const toggleOffersAdmin = async (req, res) => {
    const { offer_id } = req.body
    try {
        const offer = await Offer.findById(offer_id);
        if (!offer) {
            return res.status(404).json({ status: false, message: 'Offer not found' });
        }
        offer.isActive = !offer.isActive;
        await offer.save();

        res.status(201).json({ status: true });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}

export const deleteOffer = async (req, res) => {
    const { offer_id } = req.body;
    try {
        const offer = await Offer.findById(offer_id);

        if (!offer) {
            return res.status(404).json({ status: false, message: 'Offer not found' });
        }

        if (offer.images && offer.images.length > 0) {
            const deleteImagePromises = offer.images.map(image =>
                deleteFile({ uuid: image.uuid }, { authSchema: uploadcareSimpleAuthSchema })
            );
            await Promise.all(deleteImagePromises);
        }

        await Offer.findByIdAndDelete(offer_id);

        res.status(200).json({ status: true });
    } catch (error) {
        console.error('Error deleting the offer:', error);
        res.status(500).json({ status: false, message: 'Error deleting the offer' });
    }
};
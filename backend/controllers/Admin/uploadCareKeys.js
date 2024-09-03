
export const getKeys = async (req, res) => {
    try {
        res.status(200).json({ status: true, uploadCareSecretKey: process.env.UPLOADCARE_SECRET_KEY,  uploadCarePublicKey: process.env.UPLOADCARE_PUBLIC_KEY });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching product' });
    }
}

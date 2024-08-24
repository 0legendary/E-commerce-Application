import React, { useState } from 'react';
import './ReviewForm.css';  
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UploadFIles from '../../UploadFiles/UploadFIles';


function ReviewForm({ productId, orderId, customerId, onSubmitReview }) {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [files, setFiles] = useState([]); 
    
    
    const handleStarClick = (star) => {
        setRating(star);
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        if (text.length <= 500) {
            setReviewText(text);
        } else {
            toast.error("Review text cannot exceed 500 characters.", {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating.", {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
            return;
        }

        if (!reviewText) {
            toast.error("Review text cannot be empty.", {
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
            return;
        }
        onSubmitReview({
            orderId,
            productId,
            customerId,
            rating,
            reviewText,
            reviewImages: files,
        });
    };

    return (
        <div>
            <div className="review-form-container mt-4 bg-dark">
                <ToastContainer />
                <h4 className="mb-4">Leave a Review</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                        <label>Rating:</label>
                        <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={star}
                                    className={`bi bi-star${star <= rating ? '-fill' : ''}`}
                                    onClick={() => handleStarClick(star)}
                                ></i>
                            ))}
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="reviewText">Review:</label>
                        <textarea
                            id="reviewText"
                            className="form-control"
                            rows="4"
                            value={reviewText}
                            onChange={handleTextChange}
                            placeholder="Write your review here..."
                            maxLength="500"
                        ></textarea>
                        <small className="form-text text-muted">
                            {reviewText.length}/500 characters
                        </small>
                    </div>

                    <div className="form-group mb-4">
                        <label>Photos</label>
                        <UploadFIles setFiles={setFiles} files={files}/>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReviewForm;
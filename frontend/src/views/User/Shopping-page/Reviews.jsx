import React from 'react';

function Reviews({ reviews }) {
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(review => review.rating === star).length,
        percentage: ((reviews.filter(review => review.rating === star).length / totalReviews) * 100).toFixed(1),
    }));

    return (
        <div className="container m-5 pt-5">
            <div className="d-flex align-items-center justify-content-center my-3 ">
                <div className="average-rating me-3" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    <pre className='mb-0'>{!isNaN(averageRating) ? averageRating : 0} <i className="bi bi-star-fill"></i></pre>
                </div>
                <div className="progress w-75" style={{ height: '30px' }}>
                    {ratingDistribution.map(({ star, percentage }) => (
                        <div
                            key={star}
                            className={`progress-bar bg-${star === 5 ? 'success' : star === 4 ? 'primary' : star === 3 ? 'info' : star === 2 ? 'warning' : 'danger'}`}
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            <span>{percentage > 5 ? `${star}★` : ''}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="reviews-list">
                {reviews.map((review) => (
                    <div className="d-flex review-infor border-bottom m-5 py-3 align-items-center border" key={review._id}>
                        <div className="review-text flex-grow-1 mx-5">
                            {[...Array(5)].map((_, index) => (
                                <i
                                    key={index}
                                    className={`bi bi-star-fill ${index < review.rating ? 'text-warning' : 'text-white'}`}
                                    style={{ fontSize: '1.2rem' }}
                                ></i>
                            ))}

                            <h5>{review.reviewText}</h5>
                        </div>

                        <div className="review-image mx-5">
                            {review.imagesId && review.imagesId.length > 0 ? (
                                review.imagesId.map((image) => (
                                    <img
                                        key={image._id}
                                        src={image.images[0].cdnUrl}
                                        className="img-thumbnail"
                                        alt="Product Review"
                                        style={{ width: 'auto', height: '100px' }}
                                    />
                                ))
                            ) : (
                                <img
                                    src="https://www.caspianpolicy.org/no-image.png"
                                    alt="Not available"
                                    className="img-thumbnail"
                                    style={{ width: '100px', height: '100px' }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Reviews

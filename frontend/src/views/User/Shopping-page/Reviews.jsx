import React from 'react';

function Reviews({ reviews }) {
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(review => review.rating === star).length
    }));
    return (
        <div className="container m-5">
            <div className='mt-5' style={{ marginLeft: '10rem' }}>
                <h3>Ratings & Reviews</h3>

            </div>
            <div className="d-flex align-items-center my-3">
                <div className="average-rating me-3 d-flex" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    <pre>{!isNaN(averageRating) ? averageRating : 0} <i className="bi bi-star-fill"></i></pre>
                </div>
                <div className="progress-container w-100 ml-3">
                    {ratingDistribution.map(({ star, count }) => (
                        <div className="d-flex align-items-center mb-1" key={star}>
                            <pre><span className="mr-2" style={{ width: '30px' }}>{star} <i className="bi bi-star-fill"></i> </span></pre>
                            <div className="progress w-25 mb-3">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${(count / totalReviews) * 100}%` }}
                                    aria-valuenow={count}
                                    aria-valuemin="0"
                                    aria-valuemax={totalReviews}
                                ></div>
                            </div>
                            <pre> {count > 0 && <span className="ml-2">{count}</span>}</pre>
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

import { useEffect, useState } from "react";
import { api } from "../api.js";

function ReviewForm({ pickupId }) {
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const checkReview = async () => {
            try {
                const data = await api(`/reviews/pickup/${pickupId}`);

                if (active) {
                    setSubmitted(Boolean(data.submitted));
                }
            } catch (error) {
                console.error(
                    "Review status check failed:",
                    error
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        checkReview();

        return () => {
            active = false;
        };
    }, [pickupId]);

    const submitReview = async () => {
        if (!rating) {
            alert("Please select a rating.");
            return;
        }

        try {
            await api("/reviews", {
                method: "POST",
                body: JSON.stringify({
                    pickupId,
                    rating: Number(rating),
                    comment
                })
            });

            setSubmitted(true);
            setRating("");
            setComment("");
        } catch (error) {
            if (
                error.message
                    ?.toLowerCase()
                    .includes("already reviewed") ||
                error.message
                    ?.toLowerCase()
                    .includes("duplicate")
            ) {
                setSubmitted(true);
            }

            alert(error.message);
        }
    };

    if (loading) {
        return null;
    }

    if (submitted) {
        return (
            <div className="review-box review-submitted">
                <div className="review-success-icon">
                    ✓
                </div>

                <div className="review-submitted-content">
                    <h4>Review Submitted</h4>

                    <p>
                        Thank you for rating the collector!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="review-box">
            <div className="review-header">
                <div className="review-icon">
                    ⭐
                </div>

                <div>
                    <span className="review-eyebrow">
                        YOUR FEEDBACK
                    </span>

                    <h4>Rate Collector</h4>

                    <p>
                        Share your experience with this pickup.
                    </p>
                </div>
            </div>

            <div className="review-form">
                <div className="review-field">
                    <label htmlFor={`rating-${pickupId}`}>
                        Rating
                    </label>

                    <select
                        id={`rating-${pickupId}`}
                        value={rating}
                        onChange={(e) =>
                            setRating(e.target.value)
                        }
                    >
                        <option value="">
                            Select rating
                        </option>

                        <option value="5">
                            ⭐⭐⭐⭐⭐ Excellent
                        </option>

                        <option value="4">
                            ⭐⭐⭐⭐ Good
                        </option>

                        <option value="3">
                            ⭐⭐⭐ Average
                        </option>

                        <option value="2">
                            ⭐⭐ Poor
                        </option>

                        <option value="1">
                            ⭐ Bad
                        </option>
                    </select>
                </div>

                <div className="review-field">
                    <label htmlFor={`comment-${pickupId}`}>
                        Comment
                    </label>

                    <textarea
                        id={`comment-${pickupId}`}
                        placeholder="Write a review..."
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                        rows="4"
                    />
                </div>

                <button
                    type="button"
                    className="review-submit-button"
                    onClick={submitReview}
                >
                    ⭐ Submit Review
                </button>
            </div>
        </div>
    );
}

export default ReviewForm;
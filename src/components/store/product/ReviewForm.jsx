import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useSubmitReview } from "../../../hooks/store/useProductDetail";

const MAX_COMMENT = 1000; // matches the express-validator rule on the route

/**
 * Review submission.
 *
 * Two things the UI must be honest about, or people will think it broke:
 *   1. Reviews save with status "pending" and stay invisible until an admin
 *      approves them. Say so on success, otherwise the missing review reads as
 *      a failure and they post again.
 *   2. One review per user per product is enforced server-side with a 400.
 *      Surface that message rather than a generic error.
 */
export default function ReviewForm({ productId }) {
    const { isAuthenticated } = useAuth();
    const submitReview = useSubmitReview(productId);

    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");

    if (!isAuthenticated) {
        return (
            <div className="border border-line bg-paper-dim px-5 py-4">
                <p className="text-sm text-ink-soft">
                    <Link
                        to="/login"
                        className="text-ink underline underline-offset-4 hover:text-brand"
                    >
                        Sign in
                    </Link>{" "}
                    to write a review.
                </p>
            </div>
        );
    }

    if (submitReview.isSuccess) {
        return (
            <div className="border-l-2 border-grass bg-paper-dim px-5 py-4">
                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-grass">
                    Review received
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">
                    Thank you. Your review will appear once our team has checked it.
                </p>
            </div>
        );
    }

    const serverMessage = submitReview.error?.response?.data?.message;
    const displayRating = hovered || rating;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (rating < 1) return;
                submitReview.mutate({ rating, comment: comment.trim() || undefined });
            }}
            className="border border-line px-5 py-5"
        >
            <h3 className="font-display text-base font-semibold text-ink">Write a review</h3>

            <div className="mt-4">
                <span className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                    Your rating
                </span>
                <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHovered(value)}
                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                            aria-pressed={rating === value}
                            className="p-0.5"
                        >
                            <Star
                                size={22}
                                className={
                                    value <= displayRating
                                        ? "fill-marigold text-marigold"
                                        : "fill-ink/8 text-ink/20"
                                }
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <label
                    htmlFor="review-comment"
                    className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45"
                >
                    Your review
                </label>
                <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    maxLength={MAX_COMMENT}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think of it?"
                    className="mt-2 w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm
                               text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
                />
                <p className="mt-1 text-right font-label text-[11px] tabular-nums text-ink/35">
                    {comment.length} / {MAX_COMMENT}
                </p>
            </div>

            {serverMessage && (
                <p className="mt-2 text-sm text-coral">{serverMessage}</p>
            )}

            <button
                type="submit"
                disabled={rating < 1 || submitReview.isPending}
                className="mt-4 border border-ink bg-ink px-6 py-3 font-label text-[11px]
                           uppercase tracking-[0.18em] text-paper transition-colors
                           hover:bg-transparent hover:text-ink
                           disabled:cursor-not-allowed disabled:border-ink/12
                           disabled:bg-ink/8 disabled:text-ink/35 disabled:hover:text-ink/35"
            >
                {submitReview.isPending ? "Sending" : "Submit review"}
            </button>
        </form>
    );
}

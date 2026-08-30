import { useState } from "react";
import { Star } from "lucide-react";
import ReviewForm from "./ReviewForm";
import CatalogPagination from "../catalog/CatalogPagination";
import { useProductReviews } from "../../../hooks/store/useProductDetail";

const Stars = ({ value, size = 13 }) => (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
            <Star
                key={i}
                size={size}
                className={i <= Math.round(value) ? "fill-marigold text-marigold" : "fill-ink/8 text-ink/20"}
            />
        ))}
    </span>
);

/**
 * Rating distribution.
 *
 * The API's ratingStats is sparse (ratings with no reviews are simply absent),
 * so the hook expands it to a full 1..5 map first. Rows are drawn 5 down to 1
 * because that is the order people read a distribution in.
 */
const Histogram = ({ histogram, total }) => (
    <div className="space-y-1.5">
        {[5, 4, 3, 2, 1].map((score) => {
            const count = histogram[score] ?? 0;
            const percent = total > 0 ? (count / total) * 100 : 0;
            return (
                <div key={score} className="flex items-center gap-3">
                    <span className="w-3 font-label text-[11px] tabular-nums text-ink/50">
                        {score}
                    </span>
                    <Star size={11} className="fill-marigold text-marigold" />
                    <span className="h-1.5 flex-1 bg-ink/8">
                        <span
                            className="block h-full bg-marigold"
                            style={{ width: `${percent}%` }}
                        />
                    </span>
                    <span className="w-8 text-right font-label text-[11px] tabular-nums text-ink/45">
                        {count}
                    </span>
                </div>
            );
        })}
    </div>
);

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export default function ReviewsSection({ productId, fallbackRating = 0, fallbackCount = 0 }) {
    const [page, setPage] = useState(1);
    const { reviews, totalPages, currentPage, averageRating, totalReviews, histogram, isLoading } =
        useProductReviews(productId, { page, limit: 5 });

    // Before the reviews request resolves, fall back to the denormalised
    // averageRating/numReviews already on the product so the summary does not
    // flash zeros.
    const rating = totalReviews > 0 ? averageRating : fallbackRating;
    const count = totalReviews > 0 ? totalReviews : fallbackCount;

    return (
        <section id="reviews" className="border-t border-line pt-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Reviews
            </h2>

            <div className="mt-8 grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
                <div>
                    {count > 0 ? (
                        <>
                            <div className="flex items-baseline gap-3">
                                <span className="font-display text-4xl font-semibold tabular-nums text-ink">
                                    {rating.toFixed(1)}
                                </span>
                                <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                    out of 5
                                </span>
                            </div>
                            <div className="mt-2">
                                <Stars value={rating} size={15} />
                            </div>
                            <p className="mt-1.5 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                {count} {count === 1 ? "review" : "reviews"}
                            </p>

                            <div className="mt-6">
                                <Histogram histogram={histogram} total={totalReviews} />
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-ink-soft">
                            No reviews yet. Be the first to write one.
                        </p>
                    )}

                    <div className="mt-8">
                        <ReviewForm productId={productId} />
                    </div>
                </div>

                <div>
                    {isLoading ? (
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse border-b border-line pb-6">
                                    <div className="h-3 w-24 bg-paper-dim" />
                                    <div className="mt-3 h-3 w-full bg-paper-dim" />
                                    <div className="mt-2 h-3 w-2/3 bg-paper-dim" />
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-ink-soft">
                            Nothing here yet. Reviews appear once our team has checked them.
                        </p>
                    ) : (
                        <>
                            <ul className="space-y-7">
                                {reviews.map((review) => (
                                    <li key={review._id} className="border-b border-line pb-7">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Stars value={review.rating} />
                                            <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/40">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>

                                        <p className="mt-2 font-label text-[11px] uppercase tracking-[0.16em] text-ink/60">
                                            {review.user?.name || "Verified buyer"}
                                        </p>

                                        {review.comment && (
                                            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                                                {review.comment}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <CatalogPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

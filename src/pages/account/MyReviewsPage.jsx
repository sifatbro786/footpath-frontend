import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import Seo from "../../components/common/Seo";
import { Skeleton } from "../../components/common/Skeleton";
import { useMyReviews } from "../../hooks/store/useAccount";
import { getPrimaryImage, upscaleCloudinary } from "../../lib/store/productMapper";

/**
 * /account/reviews
 *
 * Shows every review the shopper has written, INCLUDING pending ones, which the
 * public product page deliberately hides. That is the point: someone who wrote
 * a review and cannot find it anywhere assumes it failed and writes it again
 * (the server then rejects the second with "You have already reviewed this
 * product", which reads as a bug). Showing the pending state here closes that
 * loop.
 */
const STATUS_COPY = {
    pending: { label: "Awaiting approval", className: "text-marigold" },
    approved: { label: "Published", className: "text-grass" },
    rejected: { label: "Not published", className: "text-coral" },
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function MyReviewsPage() {
    const { reviews, isLoading, isError } = useMyReviews();

    return (
        <>
            <Seo title="Your reviews | Elmate Stationery" noIndex />

            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Reviews</h2>

            {isLoading ? (
                <div className="mt-6 space-y-3">
                    {[0, 1].map((i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>
            ) : isError ? (
                <p className="mt-6 text-sm text-ink-soft">
                    We could not load your reviews. Please refresh the page.
                </p>
            ) : reviews.length === 0 ? (
                <div className="mt-6 border border-line px-5 py-10 text-center">
                    <p className="font-display text-lg text-ink">No reviews yet</p>
                    <p className="mt-2 text-sm text-ink-soft">
                        Once you have received an order, tell us how it went.
                    </p>
                    <Link
                        to="/account/orders"
                        className="mt-6 inline-block border border-ink/20 px-5 py-2.5 font-label
                                   text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink"
                    >
                        See your orders
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 divide-y divide-line border-y border-line">
                    {reviews.map((review) => {
                        const status = STATUS_COPY[review.status] ?? STATUS_COPY.pending;
                        const image = getPrimaryImage(review.product);

                        return (
                            <li key={review._id} className="flex gap-4 py-5">
                                {review.product?.slug && (
                                    <Link
                                        to={`/products/${review.product.slug}`}
                                        className="shrink-0"
                                    >
                                        <img
                                            src={upscaleCloudinary(image.url, 160, 160)}
                                            alt=""
                                            loading="lazy"
                                            className="h-16 w-16 border border-line object-cover"
                                        />
                                    </Link>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <Link
                                            to={`/products/${review.product?.slug ?? ""}`}
                                            className="text-[14px] font-medium text-ink transition-colors hover:text-brand"
                                        >
                                            {review.product?.name ?? "Product"}
                                        </Link>
                                        <span
                                            className={`font-label text-[11px] uppercase tracking-[0.14em] ${status.className}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={
                                                        i <= review.rating
                                                            ? "fill-marigold text-marigold"
                                                            : "fill-ink/8 text-ink/20"
                                                    }
                                                />
                                            ))}
                                        </span>
                                        <span className="font-label text-[11px] tabular-nums text-ink/40">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>

                                    {review.comment && (
                                        <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

// src/components/store/home/Testimonials.jsx
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "../ui/Eyebrow";
import { Skeleton } from "../../common/Skeleton";
import { useFeaturedReviews } from "../../../hooks/store/useProductDetail";

/**
 * Customer quotes, from GET /api/reviews/featured (Phase 4).
 *
 * That endpoint was added for this section: every other public review route is
 * scoped to a single product, and the site-wide list sat behind an admin route.
 * It returns approved reviews of 4 stars and up whose comment is long enough to
 * read as a quote, exposing only the reviewer's first name and the product.
 *
 * The taped-card treatment is kept, but rotation and tape colour are now
 * derived from the index rather than authored per review, since the content is
 * dynamic. Hidden entirely when there is nothing worth quoting: three empty
 * cards say more about a young shop than no section at all.
 */

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1"];
const TAPES = ["bg-grass/70", "bg-marigold/80", "bg-coral/60"];

/** "Ayesha Rahman" becomes "Ayesha R." so a full name never lands on the homepage. */
const shortName = (name) => {
    if (!name) return "Verified buyer";
    const [first, ...rest] = name.trim().split(/\s+/);
    return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

export default function Testimonials() {
    const { reviews, isLoading, isError } = useFeaturedReviews(3);

    if (isError) return null;
    if (!isLoading && reviews.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <div className="mb-10">
                <Eyebrow>From the desk drawer</Eyebrow>
                <h2 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    What shoppers are saying
                </h2>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-3 sm:gap-5">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-52 w-full" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-3 sm:gap-5">
                    {reviews.map((review, i) => (
                        <figure
                            key={review._id}
                            className={`relative border border-line bg-paper p-6 transition-transform duration-200 hover:rotate-0 ${
                                TILTS[i % TILTS.length]
                            }`}
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 ${
                                    TAPES[i % TAPES.length]
                                }`}
                            />

                            <div className="flex gap-0.5" aria-label={`${review.rating} out of 5`}>
                                {Array.from({ length: 5 }).map((_, star) => (
                                    <Star
                                        key={star}
                                        size={15}
                                        className={
                                            star < review.rating
                                                ? "fill-marigold text-marigold"
                                                : "fill-ink/8 text-ink/20"
                                        }
                                    />
                                ))}
                            </div>

                            <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                                &ldquo;{review.comment}&rdquo;
                            </blockquote>

                            <figcaption className="mt-5 border-t border-dashed border-line pt-3">
                                <p className="text-sm font-semibold text-ink">
                                    {shortName(review.user?.name)}
                                </p>
                                {review.product?.slug && (
                                    <Link
                                        to={`/products/${review.product.slug}`}
                                        className="font-label text-[11px] uppercase tracking-wide text-ink/45 transition-colors hover:text-ink"
                                    >
                                        on {review.product.name}
                                    </Link>
                                )}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            )}
        </section>
    );
}

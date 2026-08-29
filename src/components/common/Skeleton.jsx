/**
 * Loading placeholders.
 *
 * Shaped to match what replaces them — a skeleton that doesn't match its real
 * content causes a layout jump on load, which is worse than a spinner. These
 * mirror ProductCard and ProductRow so swapping loading -> loaded is visually
 * stable.
 *
 * `animate-pulse` is respected by prefers-reduced-motion at the Tailwind level.
 */

export const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse rounded bg-paper-dim ${className}`} aria-hidden="true" />
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
            />
        ))}
    </div>
);

/** Mirrors ProductCard: square image, title, price row. */
export const SkeletonProductCard = () => (
    <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
    </div>
);

/** Mirrors ProductRow's shelf layout. */
export const SkeletonProductRow = ({ count = 4 }) => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonProductCard key={i} />
        ))}
    </div>
);

/**
 * Route-level fallback for React.lazy. Deliberately minimal — a full skeleton
 * of an unknown page would be a guess, and this only shows for the moment a
 * chunk is in flight.
 */
export const PageLoader = () => (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
);

export default Skeleton;

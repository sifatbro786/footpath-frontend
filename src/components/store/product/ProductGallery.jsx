import { useEffect, useRef, useState } from "react";

/**
 * Product gallery.
 *
 * Desktop: thumbnail rail on the left, main image right, hover to zoom.
 * Mobile: a scroll-snap strip with dot indicators, which is the gesture people
 * already expect and costs no carousel library.
 *
 * Zoom is a background-position transform on hover rather than a lightbox.
 * A lightbox needs focus trapping, an escape route and a second set of images;
 * on a stationery product the useful question is "what does the paper texture
 * look like", which magnification answers directly.
 *
 * Props:
 *   images       [{ url, alt, group }]
 *   activeGroup  image group name of the selected variant. When it changes the
 *                gallery jumps to that group's first image, so picking Blue
 *                shows the blue photographs.
 */
export default function ProductGallery({ images = [], activeGroup = null }) {
    const [index, setIndex] = useState(0);
    const [zooming, setZooming] = useState(false);
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    const stripRef = useRef(null);

    // Follow the selected variant's image group.
    useEffect(() => {
        if (!activeGroup) return;
        const target = images.findIndex((image) => image.group === activeGroup);
        if (target >= 0) setIndex(target);
    }, [activeGroup, images]);

    // Keep the mobile strip in step when the index changes from elsewhere.
    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        const child = strip.children[index];
        if (child) strip.scrollTo({ left: child.offsetLeft - strip.offsetLeft, behavior: "smooth" });
    }, [index]);

    if (!images.length) return null;

    const active = images[Math.min(index, images.length - 1)];

    const onMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setOrigin({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    return (
        <div className="lg:flex lg:gap-5">
            {/* Thumbnails, desktop only */}
            {images.length > 1 && (
                <div className="hidden w-16 shrink-0 flex-col gap-2.5 lg:flex">
                    {images.map((image, i) => (
                        <button
                            key={`${image.url}-${i}`}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`View image ${i + 1}`}
                            aria-current={i === index}
                            className={`aspect-square overflow-hidden border transition-colors ${
                                i === index
                                    ? "border-ink"
                                    : "border-ink/12 hover:border-ink/40"
                            }`}
                        >
                            <img
                                src={image.url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main image, desktop */}
            <div
                className="relative hidden aspect-square flex-1 overflow-hidden border border-ink/12 bg-paper paper-grid lg:block"
                onMouseEnter={() => setZooming(true)}
                onMouseLeave={() => setZooming(false)}
                onMouseMove={onMouseMove}
            >
                <img
                    src={active.url}
                    alt={active.alt}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out"
                    style={
                        zooming
                            ? {
                                  transform: "scale(2)",
                                  transformOrigin: `${origin.x}% ${origin.y}%`,
                              }
                            : undefined
                    }
                />
                {!zooming && (
                    <span className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2.5 py-1 font-label text-[10px] uppercase tracking-[0.16em] text-ink/50">
                        Hover to zoom
                    </span>
                )}
            </div>

            {/* Mobile: snap strip */}
            <div className="lg:hidden">
                <div
                    ref={stripRef}
                    className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                    onScroll={(e) => {
                        const strip = e.currentTarget;
                        const width = strip.clientWidth || 1;
                        setIndex(Math.round(strip.scrollLeft / width));
                    }}
                >
                    {images.map((image, i) => (
                        <div
                            key={`${image.url}-${i}`}
                            className="aspect-square w-full shrink-0 snap-center border border-ink/12 bg-paper paper-grid"
                        >
                            <img
                                src={image.url}
                                alt={i === 0 ? image.alt : ""}
                                loading={i === 0 ? "eager" : "lazy"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {images.length > 1 && (
                    <div className="mt-3 flex justify-center gap-1.5">
                        {images.map((image, i) => (
                            <span
                                key={`${image.url}-dot-${i}`}
                                aria-hidden="true"
                                className={`h-1 w-6 transition-colors ${
                                    i === index ? "bg-ink" : "bg-ink/15"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

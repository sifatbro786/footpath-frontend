// src/components/store/home/ShopByCategory.jsx
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// Self-contained. Swap `categories` for GET /categories later — keep name/slug/image/count.
const categories = [
    {
        name: "Pens & Writing",
        slug: "pens-writing",
        count: 142,
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900&q=80",
        // feature tile — tall
        span: "col-span-2 row-span-2 min-h-[280px] sm:min-h-[420px]",
    },
    {
        name: "Notebooks",
        slug: "notebooks",
        count: 98,
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=80",
        span: "col-span-2 min-h-[200px]",
    },
    {
        name: "Art Supplies",
        slug: "art-supplies",
        count: 76,
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=80",
        span: "col-span-1 min-h-[200px]",
    },
    {
        name: "Ink & Refills",
        slug: "ink-refills",
        count: 54,
        image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=700&q=80",
        span: "col-span-1 min-h-[200px]",
    },
    {
        name: "Desk Accessories",
        slug: "desk-accessories",
        count: 61,
        image: "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=900&q=80",
        span: "col-span-2 min-h-[200px]",
    },
];

export default function ShopByCategory() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            {/* Editorial header — asymmetric, not centered */}
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <span className="font-label text-xs uppercase tracking-[0.2em] text-grass">
                        Aisles
                    </span>
                    <h2 className="mt-2 max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                        Find your section of the shop
                    </h2>
                </div>
                <Link
                    to="/shop"
                    className="hidden shrink-0 items-center gap-1.5 border-b-2 border-grass pb-1 font-label text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-grass sm:inline-flex"
                >
                    All categories
                    <ArrowUpRight size={14} />
                </Link>
            </div>

            <div className="grid auto-rows-1fr grid-cols-2 gap-3 md:grid-cols-4">
                {categories.map((cat) => (
                    <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        className={`group relative overflow-hidden rounded-xl border border-line ${cat.span}`}
                    >
                        <img
                            src={cat.image}
                            alt={cat.name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                        />
                        {/* ink wash from the bottom so type stays legible */}
                        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />

                        {/* count chip — top left, mono, drafting */}
                        <span className="absolute left-3 top-3 rounded-md bg-paper/90 px-2 py-0.5 font-label text-[11px] tracking-wide text-ink">
                            {cat.count} items
                        </span>

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                            <h3 className="font-display text-lg font-semibold leading-tight text-paper sm:text-xl">
                                {cat.name}
                            </h3>
                            <span className="grid h-9 w-9 shrink-0 translate-y-1 place-items-center rounded-full bg-grass text-paper opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                                <ArrowUpRight size={18} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

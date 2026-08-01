// src/components/store/home/NewArrivals.jsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const taka = (n) => `৳${Number(n).toLocaleString("en-BD")}`;

// Swap for GET /products?sortBy=publishDate&sortOrder=desc later.
const products = [
    {
        id: "na1",
        name: "Lamy Safari Fountain Pen — Charcoal",
        slug: "lamy-safari-fountain-pen-charcoal",
        price: 2650,
        added: "02 Aug",
        image: "https://images.unsplash.com/photo-1546695259-ad30ff3fd643?w=600&q=80",
    },
    {
        id: "na2",
        name: "Moleskine Classic Notebook — Ruled",
        slug: "moleskine-classic-notebook-ruled",
        price: 1490,
        added: "01 Aug",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
    },
    {
        id: "na3",
        name: "Tombow Dual Brush Pen Set — 10",
        slug: "tombow-dual-brush-pen-set-10",
        price: 1980,
        added: "31 Jul",
        image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80",
    },
    {
        id: "na4",
        name: "Blackwing 602 Pencils — Box of 12",
        slug: "blackwing-602-pencils-box-12",
        price: 2200,
        added: "30 Jul",
        image: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?w=600&q=80",
    },
];

export default function NewArrivals() {
    return (
        <section className="border-y border-line bg-paper-dim/40">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <span className="font-label tabular-nums text-xs uppercase tracking-[0.2em] text-grass">
                            Just landed
                        </span>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            New on the shelf
                        </h2>
                    </div>
                    <Link
                        to="/shop?sort=newest"
                        className="group inline-flex shrink-0 items-center gap-1.5 font-label text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-grass"
                    >
                        See all
                        <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {products.map((p) => (
                        <Link key={p.id} to={`/products/${p.slug}`} className="group block">
                            <div className="relative overflow-hidden rounded-xl border border-line bg-paper paper-grid">
                                {/* washi-tape "NEW" — hand-placed, slightly rotated */}
                                <span className="absolute -left-6 top-3 z-10 -rotate-45 bg-marigold px-8 py-0.5 text-center font-label text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm">
                                    New
                                </span>
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    loading="lazy"
                                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="mt-3 flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
                                    {p.name}
                                </h3>
                                <span className="shrink-0 font-label text-[10px] uppercase tracking-wide text-muted">
                                    {p.added}
                                </span>
                            </div>
                            <p className="mt-1 font-label text-base font-semibold text-ink">
                                {taka(p.price)}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

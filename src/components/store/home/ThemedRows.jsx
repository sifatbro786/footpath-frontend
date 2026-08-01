// src/components/store/home/ThemedRows.jsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const taka = (n) => `৳${Number(n).toLocaleString("en-BD")}`;

// Config-driven: each row is a themed shelf. This is the static stand-in for
// the DynamicSection backend — swap `rows` for its response, keep this shape.
const rows = [
    {
        eyebrow: "Under ৳500",
        title: "Little treats for the desk",
        href: "/shop?max=500",
        products: [
            {
                id: "t1",
                name: "Sticky Note Cubes",
                slug: "sticky-note-cubes",
                price: 220,
                image: "https://images.unsplash.com/photo-1600693481883-5e2d0e0a1b2e?w=500&q=80",
            },
            {
                id: "t2",
                name: "Washi Tape Trio",
                slug: "washi-tape-trio",
                price: 340,
                image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&q=80",
            },
            {
                id: "t3",
                name: "Gel Pen 5-pack",
                slug: "gel-pen-5-pack",
                price: 450,
                image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80",
            },
            {
                id: "t4",
                name: "Mini Highlighters",
                slug: "mini-highlighters",
                price: 380,
                image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&q=80",
            },
            {
                id: "t5",
                name: "Paper Clips Jar",
                slug: "paper-clips-jar",
                price: 180,
                image: "https://images.unsplash.com/photo-1568205612837-017257d2310a?w=500&q=80",
            },
        ],
    },
    {
        eyebrow: "Studio picks",
        title: "For the illustrators",
        href: "/shop?tag=studio",
        products: [
            {
                id: "s1",
                name: "Copic Marker Set",
                slug: "copic-marker-set",
                price: 5400,
                image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80",
            },
            {
                id: "s2",
                name: "Sketchbook A4",
                slug: "sketchbook-a4",
                price: 1250,
                image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80",
            },
            {
                id: "s3",
                name: "Kneaded Eraser",
                slug: "kneaded-eraser",
                price: 160,
                image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500&q=80",
            },
            {
                id: "s4",
                name: "Ink Wash Brushes",
                slug: "ink-wash-brushes",
                price: 890,
                image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80",
            },
            {
                id: "s5",
                name: "Watercolor Pan Set",
                slug: "watercolor-pan-set",
                price: 2100,
                image: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=500&q=80",
            },
        ],
    },
];

export default function ThemedRows() {
    return (
        <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:py-20">
            {rows.map((row) => (
                <section key={row.title}>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div className="flex items-baseline gap-3">
                            {/* accent tick before the title */}
                            <span className="hidden h-6 w-1 rounded-full bg-grass sm:block" />
                            <div>
                                <span className="font-label text-xs uppercase tracking-[0.2em] text-muted">
                                    {row.eyebrow}
                                </span>
                                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                                    {row.title}
                                </h2>
                            </div>
                        </div>
                        <Link
                            to={row.href}
                            className="group inline-flex shrink-0 items-center gap-1.5 font-label text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-grass"
                        >
                            Shop
                            <ArrowRight
                                size={14}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>

                    {/* horizontal shelf */}
                    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1">
                        {row.products.map((p) => (
                            <Link
                                key={p.id}
                                to={`/products/${p.slug}`}
                                className="group w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]"
                            >
                                <div className="overflow-hidden rounded-xl border border-line bg-paper paper-grid">
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        loading="lazy"
                                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="mt-2.5 line-clamp-1 text-sm font-medium text-ink">
                                    {p.name}
                                </h3>
                                <p className="mt-0.5 font-label text-sm font-semibold text-ink">
                                    {taka(p.price)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

// src/components/store/home/SeoContent.jsx
import { Link } from "react-router-dom";

export default function SeoContent() {
    return (
        <section className="border-t border-line bg-paper-dim/40">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
                {/* Prose */}
                <div>
                    <span className="font-label text-xs uppercase tracking-[0.2em] text-grass">
                        Elmate Stationery
                    </span>
                    <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                        A stationery shop for people who still love paper
                    </h2>

                    <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
                        <p>
                            {/* drop cap — a small analog flourish */}
                            <span className="float-left mr-2 mt-1 font-display text-5xl font-bold leading-none text-ink">
                                E
                            </span>
                            lmate is Bangladesh's home for genuine writing and art supplies — from
                            everyday gel pens and refill notebooks to fountain pens, bottled inks
                            and professional art kits. Every item is sourced through brand
                            distributors, so what lands on your desk is the real thing, never a
                            look-alike.
                        </p>
                        <p>
                            We stock the names collectors ask for — Rotring, Lamy, Leuchtturm1917,
                            Pilot, Faber-Castell and more — alongside affordable staples for
                            students and offices. With next-day delivery inside Dhaka, cash on
                            delivery nationwide, and an easy 7-day return window, restocking your
                            desk has never been simpler.
                        </p>
                        <p>
                            Whether you're journaling, sketching, planning your week or hunting for
                            the perfect gift, our shelves are organised to help you find it fast.
                            Browse by{" "}
                            <Link
                                to="/category/pens-writing"
                                className="font-medium text-grass underline decoration-line underline-offset-4 hover:decoration-grass"
                            >
                                writing
                            </Link>
                            ,{" "}
                            <Link
                                to="/category/notebooks"
                                className="font-medium text-grass underline decoration-line underline-offset-4 hover:decoration-grass"
                            >
                                notebooks
                            </Link>{" "}
                            or{" "}
                            <Link
                                to="/category/art-supplies"
                                className="font-medium text-grass underline decoration-line underline-offset-4 hover:decoration-grass"
                            >
                                art supplies
                            </Link>{" "}
                            and see why writers keep coming back.
                        </p>
                    </div>
                </div>

                {/* Ruled margin note — like a page torn from a notebook */}
                <aside className="relative rounded-lg border border-line bg-paper p-6 bg-[repeating-linear-gradient(transparent,transparent_31px,rgba(34,181,115,0.14)_32px)]">
                    <span className="absolute left-6 top-0 h-full w-px bg-coral/40" />
                    <p className="font-label text-[11px] uppercase tracking-[0.2em] text-grass">
                        Why Elmate
                    </p>
                    <ul className="mt-4 space-y-3 pl-3 text-sm text-ink-soft">
                        <li>· 100% authentic, distributor-sourced stock</li>
                        <li>· Next-day delivery inside Dhaka</li>
                        <li>· Cash on delivery, nationwide</li>
                        <li>· 7-day easy returns</li>
                        <li>· Real brands: Lamy, Rotring, Pilot & more</li>
                    </ul>
                </aside>
            </div>
        </section>
    );
}

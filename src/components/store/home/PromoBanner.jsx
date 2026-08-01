// src/components/store/home/PromoBanner.jsx
import { Link } from "react-router-dom";

export default function PromoBanner() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-paper paper-grid">
                <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:gap-6 lg:p-16">
                    {/* Left — type-led */}
                    <div className="relative z-10">
                        <span className="inline-block -rotate-2 rounded bg-coral px-2.5 py-1 font-label text-[11px] font-bold uppercase tracking-widest text-paper">
                            Back to class
                        </span>

                        <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                            Restock your desk, {/* highlighter swipe on the key phrase */}
                            <span className="relative inline-block">
                                <span className="absolute -inset-x-1 bottom-1 z-0 h-[42%] -rotate-1 bg-marigold" />
                                <span className="relative">save 20%</span>
                            </span>
                        </h2>

                        <p className="mt-4 max-w-md text-ink-soft">
                            One week only. Notebooks, pens and art kits — everything you need for
                            the term ahead, marked down across the board.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link
                                to="/shop?campaign=back-to-class"
                                className="inline-flex items-center justify-center rounded-lg bg-grass px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-grass/90"
                            >
                                Shop the sale
                            </Link>
                            <span className="font-label text-xs uppercase tracking-wide text-muted">
                                Ends Aug 09
                            </span>
                        </div>
                    </div>

                    {/* Right — taped polaroid collage */}
                    <div className="relative hidden h-72 lg:block">
                        <figure className="absolute left-8 top-2 w-56 rotate-[-5deg] rounded-sm bg-white p-2.5 shadow-[0_12px_30px_-10px_rgba(22,21,50,0.4)]">
                            {/* washi tape */}
                            <span className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2 bg-grass/70" />
                            <img
                                src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80"
                                alt="Notebook flatlay"
                                className="h-44 w-full object-cover"
                            />
                            <figcaption className="pt-2 text-center font-label text-[10px] uppercase tracking-widest text-muted">
                                notebooks
                            </figcaption>
                        </figure>

                        <figure className="absolute right-6 top-16 w-52 rotate-6 rounded-sm bg-white p-2.5 shadow-[0_12px_30px_-10px_rgba(22,21,50,0.4)]">
                            <span className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-3 bg-marigold/80" />
                            <img
                                src="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80"
                                alt="Pens flatlay"
                                className="h-40 w-full object-cover"
                            />
                            <figcaption className="pt-2 text-center font-label text-[10px] uppercase tracking-widest text-muted">
                                writing
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </section>
    );
}

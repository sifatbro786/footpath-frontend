// src/components/store/home/PopularBrands.jsx

const brands = [
    "Rotring",
    "Leuchtturm1917",
    "Pilot",
    "Faber-Castell",
    "Midori",
    "Kaweco",
    "Lamy",
    "Moleskine",
    "Tombow",
    "Blackwing",
];

export default function PopularBrands() {
    // duplicate the list so the marquee loops seamlessly
    const loop = [...brands, ...brands];

    return (
        <section className="border-y border-line bg-paper py-10">
            <p className="mb-6 text-center font-label text-xs uppercase tracking-[0.28em] text-muted">
                Brands worth writing with
            </p>

            <div className="group relative overflow-hidden">
                {/* edge fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-paper to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-paper to-transparent" />

                <div className="brand-marquee flex w-max items-center gap-12 px-6">
                    {loop.map((brand, i) => (
                        <span
                            key={`${brand}-${i}`}
                            className="whitespace-nowrap font-display text-xl font-semibold text-ink/35 transition-colors hover:text-grass sm:text-2xl"
                        >
                            {brand}
                        </span>
                    ))}
                </div>
            </div>

            {/* scoped animation — pauses on hover, off for reduced-motion */}
            <style>{`
                .brand-marquee { animation: brand-scroll 32s linear infinite; }
                .group:hover .brand-marquee { animation-play-state: paused; }
                @keyframes brand-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .brand-marquee { animation: none; flex-wrap: wrap; justify-content: center; }
                }
            `}</style>
        </section>
    );
}

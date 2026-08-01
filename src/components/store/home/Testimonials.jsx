// src/components/store/home/Testimonials.jsx
import { Star } from "lucide-react";

const reviews = [
    {
        id: "r1",
        quote: "The fountain pen arrived in a day and wrote like a dream out of the box. Packaging was proper too — nothing rattling around.",
        name: "Ayesha R.",
        meta: "Dhaka · verified buyer",
        rating: 5,
        tilt: "-rotate-2",
        tape: "bg-grass/70",
    },
    {
        id: "r2",
        quote: "Finally a shop that stocks real Leuchtturm notebooks locally. No more paying triple on import sites.",
        name: "Tanvir H.",
        meta: "Chattogram · verified buyer",
        rating: 5,
        tilt: "rotate-1",
        tape: "bg-marigold/80",
    },
    {
        id: "r3",
        quote: "Ordered a full art kit for my daughter. Cash on delivery, all authentic, and she hasn't put the markers down since.",
        name: "Nusrat J.",
        meta: "Sylhet · verified buyer",
        rating: 4,
        tilt: "-rotate-1",
        tape: "bg-coral/60",
    },
];

export default function Testimonials() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <div className="mb-10 text-center">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-grass">
                    From the desk drawer
                </span>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    What shoppers are saying
                </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 sm:gap-5">
                {reviews.map((r) => (
                    <figure
                        key={r.id}
                        className={`relative rounded-md border border-line bg-paper p-6 shadow-[0_10px_30px_-16px_rgba(22,21,50,0.35)] transition-transform duration-200 hover:rotate-0 hover:shadow-[0_14px_36px_-14px_rgba(22,21,50,0.4)] ${r.tilt}`}
                    >
                        {/* tape strip pinning the card */}
                        <span
                            className={`absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 ${r.tape}`}
                        />

                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={15}
                                    className={
                                        i < r.rating ? "fill-marigold text-marigold" : "text-line"
                                    }
                                />
                            ))}
                        </div>

                        <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                            “{r.quote}”
                        </blockquote>

                        <figcaption className="mt-5 border-t border-dashed border-line pt-3">
                            <p className="text-sm font-semibold text-ink">{r.name}</p>
                            <p className="font-label text-[11px] uppercase tracking-wide text-muted">
                                {r.meta}
                            </p>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}

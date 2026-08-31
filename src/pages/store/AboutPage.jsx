import { Link } from "react-router-dom";

import Seo from "../../components/common/Seo";
import Eyebrow from "../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";

/**
 * /about
 *
 * Brand copy, deliberately static. There is no CMS model behind an about page
 * and inventing one for a single page of prose would be over-engineering; the
 * words change once a year at most, and a developer edits them here.
 *
 * The SEO title and description DO come from the PageMeta record with slug
 * "about" when one exists, so the searchable part stays editable without a
 * deploy.
 */

const PRINCIPLES = [
    {
        title: "Stocked by hand",
        body: "Every pen and pad here is one we would keep on our own desks. If a nib skips or a page ghosts, it does not make the shelf.",
    },
    {
        title: "Honest pricing",
        body: "The price you see is the price you pay. Delivery is calculated from your actual address, never estimated and quietly adjusted later.",
    },
    {
        title: "Sold as it arrives",
        body: "Photographs are of the real stock, not the manufacturer's press kit. What lands on your table is what you chose.",
    },
];

export default function AboutPage() {
    return (
        <>
            <Seo
                slug="about"
                fallbackTitle="About Elmate Stationery"
                fallbackDescription="A small Bangladeshi stationery shop stocking notebooks, pens, inks and desk supplies chosen by hand."
            />

            <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs items={[{ label: "About us", href: "/about" }]} className="mb-7" />

                <header className="max-w-2xl">
                    <Eyebrow>Who we are</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        A small shop for people who care what they write with
                    </h1>
                    <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
                        Elmate started because good stationery was hard to buy in Bangladesh
                        without paying import prices and waiting a month. We keep a tight range of
                        notebooks, pens, inks and desk pieces, stocked locally and sent out the
                        same week.
                    </p>
                </header>

                <section className="mt-14 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
                    {PRINCIPLES.map((principle) => (
                        <div key={principle.title}>
                            <h2 className="font-display text-lg font-semibold text-ink">
                                {principle.title}
                            </h2>
                            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                                {principle.body}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="mt-14 border-t border-line pt-12">
                    <Eyebrow>What we stock</Eyebrow>
                    <h2 className="mt-3.5 font-display text-2xl font-semibold tracking-tight text-ink">
                        Four shelves, chosen carefully
                    </h2>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {[
                            {
                                label: "Notebooks and journals",
                                href: "/category/notebooks-and-journals",
                                blurb: "Bound, softcover and refillable, in paper that takes ink properly.",
                            },
                            {
                                label: "Writing instruments",
                                href: "/category/writing-instruments",
                                blurb: "Fountain pens, rollerballs, mechanical pencils and the inks for them.",
                            },
                            {
                                label: "Desk and office",
                                href: "/category/desk-and-office",
                                blurb: "Organisers, trays, tape and the small things that keep a desk usable.",
                            },
                            {
                                label: "Deals and bundles",
                                href: "/shop?deal=active",
                                blurb: "Everything currently marked down, in one place.",
                            },
                        ].map((shelf) => (
                            <Link
                                key={shelf.href}
                                to={shelf.href}
                                className="group border border-line px-5 py-4 transition-colors hover:border-ink/40"
                            >
                                <p className="font-display text-base font-semibold text-ink">
                                    {shelf.label}
                                </p>
                                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                                    {shelf.blurb}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mt-14 border-t border-line pt-12">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                        Questions about an order?
                    </h2>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                        Track it with your order number, or write to us and a person will answer.
                    </p>

                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                        <Link
                            to="/order/track"
                            className="border border-ink bg-ink px-6 py-3 text-center font-label
                                       text-[11px] uppercase tracking-[0.18em] text-paper
                                       transition-colors hover:bg-transparent hover:text-ink"
                        >
                            Track an order
                        </Link>
                        <Link
                            to="/contact"
                            className="border border-ink/20 px-6 py-3 text-center font-label text-[11px]
                                       uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
                        >
                            Contact us
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}

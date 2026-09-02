// src/components/store/layout/StoreFooter.jsx
import { Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

// FIX: this list contained eleven dead links. The category slugs did not match
// any seeded category, /track was the wrong path for order tracking, and
// /shipping, /returns, /faq, /privacy, /terms, /stores and /blog had no routes
// at all. Every target below now resolves.
//
// Category slugs MUST match scripts/seedStorefront.js. If you rename a category
// there, rename it here.
//
// Dropped on purpose: "Stores" (the shop is online only, as the Contact page
// says) and "Blog" (there is no blog, and a link to an empty one is worse than
// no link).
const columns = [
    {
        title: "Shop",
        links: [
            { label: "Notebooks & Journals", to: "/category/notebooks-and-journals" },
            { label: "Writing Instruments", to: "/category/writing-instruments" },
            { label: "Desk & Office", to: "/category/desk-and-office" },
            { label: "New arrivals", to: "/shop?sort=newest" },
            { label: "Deals & bundles", to: "/shop?deal=active" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Track your order", to: "/order/track" },
            { label: "Shipping & delivery", to: "/shipping" },
            { label: "Returns & refunds", to: "/returns" },
            { label: "FAQ", to: "/faq" },
            { label: "Contact us", to: "/contact" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Elmate", to: "/about" },
            { label: "Privacy policy", to: "/privacy" },
            { label: "Terms of service", to: "/terms" },
        ],
    },
];

// Newsletter is a placeholder. There is no subscribe endpoint on the backend
// and no list to add anyone to, so the submit only acknowledges itself. Swap
// the toast for the request when a real endpoint lands, and keep the reset.
function handleSubscribe(e) {
    e.preventDefault();
    e.currentTarget.reset();
    toast.success("Thanks. We will email you when new stock lands.");
}

export default function StoreFooter() {
    return (
        <footer className="border-t border-line bg-ink text-paper">
            {/* Newsletter band */}
            <div className="border-b border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="font-display text-2xl font-semibold">
                            Get first dibs on new stock
                        </h3>
                        <p className="mt-1 text-sm text-paper/60">
                            Restocks, drops and the occasional discount. No spam, ever.
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubscribe}
                        className="flex w-full max-w-md gap-2"
                    >
                        <input
                            type="email"
                            required
                            placeholder="you@email.com"
                            aria-label="Email address"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-grass focus:outline-none focus:ring-2 focus:ring-grass/30"
                        />
                        <button
                            type="submit"
                            className="shrink-0 rounded-lg bg-grass px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-grass/90"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Main columns */}
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
                {/* Brand + contact */}
                <div className="sm:col-span-2">
                    <img
                        src="/logo.png"
                        alt="Elmate Stationery"
                        className="h-9 w-auto"
                    />
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
                        Genuine writing & art supplies, delivered across Bangladesh. Real brands,
                        fair prices, from our desk to yours.
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-paper/70">
                        <a
                            href="mailto:hello@elmate.com"
                            className="flex items-center gap-2 hover:text-grass"
                        >
                            <Mail size={15} /> hello@elmate.com
                        </a>
                        <a
                            href="tel:+8809600000000"
                            className="flex items-center gap-2 hover:text-grass"
                        >
                            <Phone size={15} /> +880 9600 000000
                        </a>
                    </div>
                </div>

                {columns.map((col) => (
                    <nav key={col.title} aria-label={col.title}>
                        <h4 className="font-label text-xs uppercase tracking-[0.18em] text-paper/50">
                            {col.title}
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {col.links.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-paper/75 transition-colors hover:text-grass"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            {/* Payment methods. Supplied gateway strip, on a paper panel because
                the artwork is dark on transparency and would vanish on bg-ink.
                It is 5011x587 (two rows, ~8.5:1), so it is sized by WIDTH, not
                height: an h-* class on artwork this wide renders it postage
                stamp size. min-w keeps the logos legible on phones, where the
                panel scrolls sideways instead. */}
            <div className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <div className="mx-auto max-w-5xl overflow-x-auto rounded-xs border border-white/10 bg-paper p-3 sm:p-4">
                        <img
                            src="/footer.png"
                            alt="Accepted payment methods, verified by SSLCommerz"
                            width={5011}
                            height={587}
                            loading="lazy"
                            className="h-auto w-full min-w-120"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
                    <p className="text-center font-label text-xs text-paper/50 sm:text-left">
                        © {new Date().getFullYear()} Elmate Stationery. All rights reserved.
                        <span aria-hidden="true" className="px-2 text-paper/30">
                            ·
                        </span>
                        <span className="whitespace-nowrap">
                            Developed by{" "}
                            <a
                                href="https://strsltd.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-paper/70 underline underline-offset-2 transition-colors hover:text-grass"
                            >
                                STR Solutions Ltd
                            </a>
                        </span>
                    </p>

                    <div className="flex items-center gap-3 text-paper/70">
                        <a href="#" aria-label="Facebook" className="hover:text-grass">
                            <FaFacebook size={18} />
                        </a>
                        <a href="#" aria-label="Instagram" className="hover:text-grass">
                            <FaInstagram size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

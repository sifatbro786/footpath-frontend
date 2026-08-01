// src/components/store/layout/StoreFooter.jsx
import { Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const columns = [
    {
        title: "Shop",
        links: [
            { label: "Pens & Writing", to: "/category/pens-writing" },
            { label: "Notebooks", to: "/category/notebooks" },
            { label: "Art Supplies", to: "/category/art-supplies" },
            { label: "Ink & Refills", to: "/category/ink-refills" },
            { label: "New Arrivals", to: "/shop?sort=newest" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Track your order", to: "/track" },
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
            { label: "Stores", to: "/stores" },
            { label: "Blog", to: "/blog" },
            { label: "Privacy policy", to: "/privacy" },
            { label: "Terms of service", to: "/terms" },
        ],
    },
];

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
                        onSubmit={(e) => e.preventDefault()}
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

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
                    <p className="font-label text-xs text-paper/50">
                        © {new Date().getFullYear()} Elmate Stationery. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        {/* payment methods — text chips keep it dependency-free */}
                        <div className="flex items-center gap-1.5">
                            {["bKash", "Nagad", "Visa", "COD"].map((m) => (
                                <span
                                    key={m}
                                    className="rounded border border-white/15 px-2 py-1 font-label text-[10px] uppercase tracking-wide text-paper/60"
                                >
                                    {m}
                                </span>
                            ))}
                        </div>

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
            </div>
        </footer>
    );
}

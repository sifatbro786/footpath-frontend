// src/components/store/home/TrustStrip.jsx
import { Truck, RotateCcw, ShieldCheck, Banknote } from "lucide-react";
import { trustItems } from "../../../data/store/trustItems";

// Explicit map — keeps the icon set tree-shakeable and avoids dynamic imports.
const ICONS = { Truck, RotateCcw, ShieldCheck, Banknote };

export default function TrustStrip() {
    return (
        <section aria-label="Store guarantees" className="border-y border-ink/10 bg-paper">
            <div className="mx-auto max-w-7xl px-4">
                <ul className="grid grid-cols-2 divide-ink/10 lg:grid-cols-4 lg:divide-x">
                    {trustItems.map((item, i) => {
                        const Icon = ICONS[item.icon];
                        return (
                            <li
                                key={item.title}
                                className={[
                                    "flex items-center gap-3 px-2 py-4 sm:px-4 lg:py-5",
                                    // hairline separators without doubling on wrap
                                    i % 2 === 0 ? "border-r border-ink/10 lg:border-r-0" : "",
                                    i < 2 ? "border-b border-ink/10 lg:border-b-0" : "",
                                ].join(" ")}
                            >
                                {Icon && (
                                    <Icon
                                        size={22}
                                        strokeWidth={1.6}
                                        className="shrink-0 text-grass"
                                    />
                                )}
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-ink">
                                        {item.title}
                                    </p>
                                    <p className="truncate text-xs text-ink/55">{item.note}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

import { useEffect, useState } from "react";
import { formatPrice } from "../../../lib/store/productMapper";

/**
 * Countdown to a campaign's end.
 *
 * Ticks every second only while more than an hour remains is tempting, but the
 * last minutes are exactly when the timer matters, so it ticks every second
 * throughout and stops itself at zero.
 */
function useCountdown(endsAt) {
    const [remaining, setRemaining] = useState(() =>
        endsAt ? Math.max(0, endsAt.getTime() - Date.now()) : 0,
    );

    useEffect(() => {
        if (!endsAt) return;
        const tick = () => setRemaining(Math.max(0, endsAt.getTime() - Date.now()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    if (!endsAt || remaining <= 0) return null;

    const totalSeconds = Math.floor(remaining / 1000);
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Price, savings, campaign banner and stock signal.
 *
 * Props:
 *   pricing   { price, basePrice, stock, isOnSale, isFrom } from resolvePricing
 *   campaign  { name, endsAt } or null
 *   lowStockAlert  threshold below which stock is called out
 *   requiresSelection  true when variants exist but none is fully chosen yet
 */
export default function PriceBlock({ pricing, campaign, lowStockAlert = 5, requiresSelection }) {
    const countdown = useCountdown(campaign?.endsAt);
    const saved = Math.max(0, pricing.basePrice - pricing.price);
    const savedPercent = pricing.basePrice > 0 ? Math.round((saved / pricing.basePrice) * 100) : 0;

    return (
        <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {pricing.isFrom && (
                    <span className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                        From
                    </span>
                )}
                <span className="font-display text-3xl font-semibold tabular-nums text-ink">
                    {formatPrice(pricing.price)}
                </span>

                {pricing.isOnSale && saved > 0 && (
                    <>
                        <span className="font-label text-base tabular-nums text-ink/35 line-through">
                            {formatPrice(pricing.basePrice)}
                        </span>
                        <span className="font-label text-[11px] uppercase tracking-[0.14em] text-coral">
                            Save {formatPrice(saved)}
                            {savedPercent > 0 ? ` (${savedPercent}%)` : ""}
                        </span>
                    </>
                )}
            </div>

            {campaign && (
                <div className="mt-4 border-l-2 border-marigold bg-paper-dim px-4 py-3">
                    <p className="font-label text-[11px] uppercase tracking-[0.18em] text-ink">
                        {campaign.name}
                    </p>
                    {countdown ? (
                        <p className="mt-1.5 font-label text-sm tabular-nums text-ink-soft">
                            Ends in{" "}
                            <span className="text-ink">
                                {countdown.days > 0 && `${countdown.days}d `}
                                {pad(countdown.hours)}:{pad(countdown.minutes)}:
                                {pad(countdown.seconds)}
                            </span>
                        </p>
                    ) : (
                        <p className="mt-1.5 text-sm text-ink-soft">Offer price applied.</p>
                    )}
                </div>
            )}

            <div className="mt-4">
                {requiresSelection ? (
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                        Choose your options
                    </p>
                ) : pricing.stock <= 0 ? (
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-coral">
                        Out of stock
                    </p>
                ) : pricing.stock <= lowStockAlert ? (
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-coral">
                        Only {pricing.stock} left
                    </p>
                ) : (
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-grass">
                        In stock
                    </p>
                )}
            </div>
        </div>
    );
}

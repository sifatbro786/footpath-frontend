import { formatPrice } from "../../../lib/store/productMapper";

/**
 * Progress toward free delivery.
 *
 * The threshold comes from GET /api/checkout/shipping-rates, which reports the
 * LOWEST freeShippingThreshold across active zones. That caveat is deliberate:
 * before an address exists we cannot know which zone applies, and promising the
 * easiest threshold and then charging is worse than promising nothing. So the
 * copy says "from" rather than stating it as a guarantee.
 *
 * Renders nothing when no threshold is configured, rather than a bar that can
 * never fill.
 */
export default function FreeShippingBar({ subtotal, threshold }) {
    if (!threshold || threshold <= 0) return null;

    const remaining = Math.max(0, threshold - subtotal);
    const percent = Math.min(100, (subtotal / threshold) * 100);
    const qualified = remaining === 0;

    return (
        <div>
            <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/55">
                {qualified ? (
                    <span className="text-grass">Free delivery unlocked</span>
                ) : (
                    <>
                        Spend {formatPrice(remaining)} more for free delivery
                    </>
                )}
            </p>

            <div className="mt-2 h-1 w-full bg-ink/10">
                <div
                    className={`h-full transition-[width] duration-300 ${
                        qualified ? "bg-grass" : "bg-marigold"
                    }`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {!qualified && (
                <p className="mt-1.5 font-label text-[10px] uppercase tracking-[0.12em] text-ink/30">
                    Threshold varies by delivery area
                </p>
            )}
        </div>
    );
}

import { formatPrice, upscaleCloudinary, handleImageError } from "../../../lib/store/productMapper";
import CouponBox from "../cart/CouponBox";

/**
 * Checkout summary.
 *
 * Every money figure below comes from /checkout/calculate, which runs the same
 * pricingService logic createOrder will run. Nothing is added up on the client.
 * That is the whole point: a total computed here would eventually disagree with
 * what the order charges, and the shopper would be right to distrust it.
 *
 * Until a district and upazila are chosen the endpoint returns zeroed shipping
 * with a `message`, so the summary shows the subtotal and says delivery is
 * pending rather than implying it is free.
 */
export default function OrderSummary({
    items,
    totals,
    needsAddress,
    isCalculating,
    couponItems,
    userId,
    appliedCode,
    onApplyCoupon,
    onRemoveCoupon,
}) {
    const subtotal =
        totals?.itemsSubtotal ?? items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <div className="border border-line">
            <div className="border-b border-line px-5 py-4">
                <h2 className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/55">
                    Your order
                </h2>
            </div>

            <ul className="divide-y divide-line px-5">
                {items.map((item) => (
                    <li key={item.key} className="flex gap-3.5 py-4">
                        <div className="relative shrink-0">
                            <img
                                src={
                                    upscaleCloudinary(item.image, 160, 160) ||
                                    "/placeholder-product.png"
                                }
                                alt=""
                                loading="lazy"
                                className="h-16 w-16 border border-line object-cover"
                                onError={handleImageError}
                            />
                            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 font-label text-[10px] tabular-nums text-paper">
                                {item.quantity}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium leading-snug text-ink">
                                {item.name}
                            </p>
                            {item.variantLabel && (
                                <p className="mt-0.5 font-label text-[11px] uppercase tracking-[0.12em] text-ink/45">
                                    {item.variantLabel}
                                </p>
                            )}
                        </div>

                        <p className="shrink-0 font-label text-[13px] tabular-nums text-ink">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
                <CouponBox
                    cartItems={couponItems}
                    userId={userId}
                    appliedCode={appliedCode}
                    onApply={onApplyCoupon}
                    onRemove={onRemoveCoupon}
                />
            </div>

            <dl
                className={`space-y-2.5 border-t border-line px-5 py-4 text-sm transition-opacity ${
                    isCalculating ? "opacity-60" : ""
                }`}
            >
                <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="font-label tabular-nums text-ink">{formatPrice(subtotal)}</dd>
                </div>

                {totals?.discountAmount > 0 && (
                    <div className="flex justify-between gap-4">
                        <dt className="text-grass">Discount</dt>
                        <dd className="font-label tabular-nums text-grass">
                            &minus;{formatPrice(totals.discountAmount)}
                        </dd>
                    </div>
                )}

                <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Delivery</dt>
                    <dd className="font-label tabular-nums text-ink">
                        {needsAddress || !totals ? (
                            <span className="text-ink/45">Pending address</span>
                        ) : totals.shippingPrice === 0 ? (
                            <span className="text-grass">Free</span>
                        ) : (
                            formatPrice(totals.shippingPrice)
                        )}
                    </dd>
                </div>

                {totals?.codCharge > 0 && (
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">Cash on delivery fee</dt>
                        <dd className="font-label tabular-nums text-ink">
                            {formatPrice(totals.codCharge)}
                        </dd>
                    </div>
                )}

                {totals?.taxPrice > 0 && (
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">VAT</dt>
                        <dd className="font-label tabular-nums text-ink">
                            {formatPrice(totals.taxPrice)}
                        </dd>
                    </div>
                )}
            </dl>

            <div className="border-t border-line px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/55">
                        Total
                    </span>
                    <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                        {needsAddress || !totals
                            ? formatPrice(subtotal)
                            : formatPrice(totals.finalTotal)}
                    </span>
                </div>

                {totals?.estimatedDelivery && !needsAddress && (
                    <p className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                        Arrives in {totals.estimatedDelivery}
                    </p>
                )}

                {totals?.couponMessage && (
                    <p className="mt-2 text-[13px] text-ink-soft">{totals.couponMessage}</p>
                )}
            </div>
        </div>
    );
}

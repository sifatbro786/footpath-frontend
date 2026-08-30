import { formatPrice } from "../../../lib/store/productMapper";

/**
 * Payment method.
 *
 * There are exactly TWO methods, because Order.paymentMethod is
 * enum: ["COD", "SSLCommerz"]. Anything else fails validation at save time.
 *
 * bKash and Nagad are not separate methods here: SSLCommerz is an aggregator
 * and offers bKash, Nagad, cards and bank transfer inside its own hosted page.
 * Listing them as top level choices would be a lie about what the shopper is
 * about to see, and would produce orders the backend rejects.
 *
 * THE COD SUBTLETY that has to be explained, or it becomes a support ticket:
 * COD is not "pay nothing now". createOrder initialises a gateway payment for
 * delivery plus the COD fee (codOnlinePaymentAmount) and collects the item
 * total on delivery (remainingAmount). Both methods redirect to the gateway.
 */
const METHODS = [
    {
        value: "COD",
        title: "Cash on delivery",
        blurb: "Pay the delivery charge now, the rest when it arrives.",
    },
    {
        value: "SSLCommerz",
        title: "Pay online",
        blurb: "bKash, Nagad, cards and bank transfer through SSLCommerz.",
    },
];

export default function PaymentMethodSelect({ value, onChange, totals }) {
    return (
        <fieldset>
            <legend className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/50">
                Payment
            </legend>

            <div className="mt-3 space-y-2.5">
                {METHODS.map((method) => {
                    const selected = value === method.value;
                    return (
                        <button
                            key={method.value}
                            type="button"
                            onClick={() => onChange(method.value)}
                            aria-pressed={selected}
                            className={`flex w-full items-start gap-3.5 border px-4 py-3.5 text-left transition-colors ${
                                selected
                                    ? "border-ink bg-paper-dim"
                                    : "border-ink/20 hover:border-ink"
                            }`}
                        >
                            <span
                                aria-hidden="true"
                                className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                                    selected ? "border-ink" : "border-ink/30"
                                }`}
                            >
                                {selected && (
                                    <span className="h-2 w-2 rounded-full bg-ink" />
                                )}
                            </span>

                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-ink">
                                    {method.title}
                                </span>
                                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">
                                    {method.blurb}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Spelled out only once a real split exists, so the numbers are the
                server's, never an estimate. */}
            {value === "COD" && totals?.codOnlinePaymentAmount > 0 && (
                <div className="mt-4 border-l-2 border-marigold bg-paper-dim px-4 py-3.5">
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink">
                        How cash on delivery works here
                    </p>
                    <dl className="mt-2.5 space-y-1.5 text-[13px]">
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Pay now, online</dt>
                            <dd className="font-label tabular-nums text-ink">
                                {formatPrice(totals.codOnlinePaymentAmount)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Pay on delivery</dt>
                            <dd className="font-label tabular-nums text-ink">
                                {formatPrice(totals.remainingAmount)}
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-ink/50">
                        The delivery charge is taken online so the courier is covered. The rider
                        collects the rest in cash.
                    </p>
                </div>
            )}
        </fieldset>
    );
}

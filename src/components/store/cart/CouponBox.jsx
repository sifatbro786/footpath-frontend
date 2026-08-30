import { useState } from "react";
import { X } from "lucide-react";
import { useCouponCheck } from "../../../hooks/store/useCheckout";
import { formatPrice } from "../../../lib/store/productMapper";

/**
 * Coupon entry.
 *
 * The check is a PREVIEW only. pricingService recomputes the discount during
 * order creation, so a code that passes here can still be reduced or refused at
 * checkout (usage limits are racy, product eligibility is re-verified against
 * the database). The applied state therefore stores only the CODE; the money
 * shown in the summary always comes from /checkout/calculate, which is the same
 * logic the order will use.
 *
 * Endpoint is POST /api/coupons/apply, not /validate, and it is rate limited to
 * 20 attempts per 15 minutes per IP because an open coupon lookup is a code
 * enumeration oracle.
 */
export default function CouponBox({ cartItems, userId, appliedCode, onApply, onRemove }) {
    const [code, setCode] = useState("");
    const check = useCouponCheck();

    if (appliedCode) {
        return (
            <div className="flex items-center justify-between gap-3 border border-grass/40 bg-grass/5 px-3.5 py-3">
                <div className="min-w-0">
                    <p className="font-label text-[11px] uppercase tracking-[0.16em] text-grass">
                        Code applied
                    </p>
                    <p className="mt-0.5 truncate font-label text-sm text-ink">{appliedCode}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        check.reset();
                        setCode("");
                        onRemove();
                    }}
                    aria-label="Remove coupon"
                    className="shrink-0 p-1 text-ink/35 transition-colors hover:text-coral"
                >
                    <X size={15} />
                </button>
            </div>
        );
    }

    const submit = (e) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        check.mutate(
            { couponCode: trimmed, cartItems, userId },
            {
                onSuccess: (data) => {
                    if (data?.success) onApply(data.couponCode ?? trimmed, data);
                },
            },
        );
    };

    const message = check.isError
        ? (check.error?.response?.data?.message ?? "That code could not be applied.")
        : null;

    return (
        <div>
            <form onSubmit={submit} className="flex gap-2">
                <label htmlFor="coupon-code" className="sr-only">
                    Discount code
                </label>
                <input
                    id="coupon-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Discount code"
                    autoComplete="off"
                    className="min-w-0 flex-1 border border-ink/20 bg-paper px-3.5 py-2.5 text-sm
                               uppercase text-ink placeholder:normal-case placeholder:text-ink/30
                               focus:border-ink focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={!code.trim() || check.isPending}
                    className="shrink-0 border border-ink/25 px-4 font-label text-[11px] uppercase
                               tracking-[0.16em] text-ink transition-colors hover:border-ink
                               disabled:cursor-not-allowed disabled:border-ink/8 disabled:text-ink/25"
                >
                    {check.isPending ? "Checking" : "Apply"}
                </button>
            </form>

            {message && <p className="mt-2 text-sm text-coral">{message}</p>}

            {check.isSuccess && check.data?.discountAmount > 0 && (
                <p className="mt-2 text-sm text-grass">
                    Saves about {formatPrice(check.data.discountAmount)} on eligible items.
                </p>
            )}
        </div>
    );
}

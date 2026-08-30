import { Minus, Plus } from "lucide-react";

/**
 * Quantity stepper plus the two purchase actions.
 *
 * Quantity is clamped to available stock so the shopper cannot ask for eleven
 * of a product with ten left. That is a courtesy, not a control: the server
 * re-checks stock atomically at order time (see updateProductStock's $gte
 * guard), which is what actually prevents overselling.
 */
export default function BuyBox({
    quantity,
    onQuantityChange,
    maxQuantity,
    disabled,
    disabledReason,
    onAddToCart,
    onBuyNow,
}) {
    const canDecrease = quantity > 1;
    const canIncrease = quantity < maxQuantity;

    const stepper =
        "grid h-11 w-11 place-items-center border border-ink/20 text-ink transition-colors " +
        "hover:border-ink disabled:cursor-not-allowed disabled:border-ink/8 disabled:text-ink/25";

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <span className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/45">
                    Quantity
                </span>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => onQuantityChange(quantity - 1)}
                        disabled={!canDecrease || disabled}
                        aria-label="Decrease quantity"
                        className={stepper}
                    >
                        <Minus size={15} />
                    </button>
                    <span
                        aria-live="polite"
                        className="grid h-11 w-14 place-items-center border-y border-ink/20 font-label text-sm tabular-nums text-ink"
                    >
                        {quantity}
                    </span>
                    <button
                        type="button"
                        onClick={() => onQuantityChange(quantity + 1)}
                        disabled={!canIncrease || disabled}
                        aria-label="Increase quantity"
                        className={stepper}
                    >
                        <Plus size={15} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={disabled}
                    className="flex-1 border border-ink bg-ink px-6 py-3.5 font-label text-[11px]
                               uppercase tracking-[0.18em] text-paper transition-colors
                               hover:bg-transparent hover:text-ink
                               disabled:cursor-not-allowed disabled:border-ink/12
                               disabled:bg-ink/8 disabled:text-ink/35 disabled:hover:text-ink/35"
                >
                    Add to bag
                </button>
                <button
                    type="button"
                    onClick={onBuyNow}
                    disabled={disabled}
                    className="flex-1 border border-ink/25 px-6 py-3.5 font-label text-[11px]
                               uppercase tracking-[0.18em] text-ink transition-colors
                               hover:border-ink disabled:cursor-not-allowed
                               disabled:border-ink/8 disabled:text-ink/25"
                >
                    Buy it now
                </button>
            </div>

            {disabled && disabledReason && (
                <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                    {disabledReason}
                </p>
            )}
        </div>
    );
}

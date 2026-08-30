import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, upscaleCloudinary } from "../../../lib/store/productMapper";

/**
 * One cart line. Shared by the drawer and the cart page so quantity rules can
 * never diverge between the two.
 *
 * Props:
 *   compact   drawer density (smaller thumb, no line total column)
 *   onRemove  when provided, the trash control asks the page to confirm rather
 *             than deleting immediately
 */
export default function CartLine({ item, onUpdateQty, onRemove, compact = false }) {
    const max = Number.isFinite(item.stock) && item.stock > 0 ? item.stock : Infinity;
    const atMax = item.quantity >= max;

    const stepper =
        "grid place-items-center border border-ink/20 text-ink transition-colors " +
        "hover:border-ink disabled:cursor-not-allowed disabled:border-ink/8 disabled:text-ink/25";
    const stepperSize = compact ? "h-8 w-8" : "h-9 w-9";

    return (
        <li className="flex gap-4 py-5">
            <Link to={`/products/${item.slug}`} className="shrink-0">
                <img
                    src={upscaleCloudinary(item.image, 200, 200) || "/placeholder-product.png"}
                    alt=""
                    loading="lazy"
                    className={`border border-line object-cover ${
                        compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28"
                    }`}
                />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            to={`/products/${item.slug}`}
                            className="block text-[14px] font-medium leading-snug text-ink transition-colors hover:text-brand"
                        >
                            {item.name}
                        </Link>

                        {item.variantLabel && (
                            <p className="mt-1 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                {item.variantLabel}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemove(item)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 p-1 text-ink/35 transition-colors hover:text-coral"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className={`${stepper} ${stepperSize}`}
                        >
                            <Minus size={13} />
                        </button>
                        <span
                            aria-live="polite"
                            className={`grid place-items-center border-y border-ink/20 font-label text-sm tabular-nums text-ink ${
                                compact ? "h-8 w-11" : "h-9 w-12"
                            }`}
                        >
                            {item.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, item.quantity + 1)}
                            disabled={atMax}
                            aria-label="Increase quantity"
                            className={`${stepper} ${stepperSize}`}
                        >
                            <Plus size={13} />
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="font-label text-sm font-semibold tabular-nums text-ink">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                            <p className="font-label text-[11px] tabular-nums text-ink/40">
                                {formatPrice(item.price)} each
                            </p>
                        )}
                    </div>
                </div>

                {atMax && max !== Infinity && (
                    <p className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-coral">
                        Only {max} available
                    </p>
                )}
            </div>
        </li>
    );
}

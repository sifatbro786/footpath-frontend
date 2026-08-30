import { availableValuesFor, outOfStockValuesFor } from "../../../lib/store/variants";

/**
 * Multi axis variant picker.
 *
 * Three states per value, and the distinction matters:
 *   selectable   at least one buyable variant exists with this value
 *   sold out     the combination exists but has no stock (struck through,
 *                still clickable so people can see what they are missing)
 *   unavailable  no variant exists with this value alongside the other
 *                choices (disabled outright)
 *
 * Availability for one axis ignores that axis's own selection, so changing your
 * mind about Colour never leaves you stuck with an impossible Size.
 *
 * Values are square chips with a 1px border, filled ink when chosen. No pills,
 * no floating cards.
 */
export default function VariantSelector({ variantOptions, variants, selection, onChange }) {
    if (!variantOptions?.length) return null;

    return (
        <div className="space-y-6">
            {variantOptions.map((axis) => {
                const available = availableValuesFor(variants, axis.name, selection);
                const soldOut = outOfStockValuesFor(variants, axis.name, selection);
                const chosen = selection[axis.name];

                return (
                    <fieldset key={axis.name}>
                        <legend className="mb-2.5 flex w-full items-baseline justify-between font-label text-[11px] uppercase tracking-[0.2em] text-ink/45">
                            <span>{axis.name}</span>
                            {chosen && <span className="normal-case tracking-normal text-ink">{chosen}</span>}
                        </legend>

                        <div className="flex flex-wrap gap-2">
                            {axis.values.map((value) => {
                                const isChosen = chosen === value;
                                const isAvailable = available.has(value);
                                const isSoldOut = soldOut.has(value);

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        disabled={!isAvailable}
                                        aria-pressed={isChosen}
                                        onClick={() =>
                                            onChange({
                                                ...selection,
                                                [axis.name]: isChosen ? "" : value,
                                            })
                                        }
                                        className={[
                                            "min-w-11 border px-3.5 py-2 text-sm transition-colors",
                                            isChosen
                                                ? "border-ink bg-ink text-paper"
                                                : "border-ink/20 text-ink hover:border-ink",
                                            !isAvailable
                                                ? "cursor-not-allowed border-ink/8 text-ink/25 hover:border-ink/8"
                                                : "",
                                            isSoldOut && isAvailable && !isChosen
                                                ? "text-ink/40 line-through"
                                                : "",
                                        ].join(" ")}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                );
            })}
        </div>
    );
}

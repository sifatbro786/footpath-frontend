import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS } from "../../../hooks/store/useCatalog";

/**
 * Result count, sort control, and the mobile filter trigger.
 *
 * Sort is a native <select>. A custom dropdown would need focus management,
 * keyboard handling and portalling to earn nothing but a different chevron;
 * the native control is accessible, and on mobile it opens the platform picker,
 * which is genuinely better than any bespoke sheet.
 */
export default function CatalogToolbar({
    total,
    isRefreshing,
    sort,
    onSortChange,
    onOpenFilters,
    activeChips = [],
    onRemoveChip,
    onClearAll,
}) {
    return (
        <div className="border-b border-line pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-label text-xs uppercase tracking-[0.16em] text-ink/50">
                    {isRefreshing ? (
                        <span className="tabular-nums">Updating results</span>
                    ) : (
                        <span className="tabular-nums">
                            {total} {total === 1 ? "product" : "products"}
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2
                                   font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink lg:hidden"
                    >
                        <SlidersHorizontal size={13} />
                        Filters
                    </button>

                    <label className="flex items-center gap-2">
                        <span className="sr-only">Sort products by</span>
                        <select
                            value={sort}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="border border-ink/20 bg-paper py-2 pl-3 pr-8 font-label
                                       text-[11px] uppercase tracking-[0.14em] text-ink
                                       transition-colors hover:border-ink focus:border-ink focus:outline-none"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {activeChips.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={() => onRemoveChip(chip)}
                            className="group inline-flex items-center gap-1.5 border border-ink/15
                                       bg-paper-dim px-2.5 py-1 font-label text-[11px] text-ink-soft
                                       transition-colors hover:border-ink/40 hover:text-ink"
                        >
                            {chip.label}
                            <X size={11} className="text-ink/35 group-hover:text-ink" />
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={onClearAll}
                        className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/45
                                   underline underline-offset-4 transition-colors hover:text-ink"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

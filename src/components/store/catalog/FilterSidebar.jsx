import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { flattenTree } from "../../../lib/store/categoryTree";

/**
 * Catalogue filters.
 *
 * Design: no cards, no rounded panels. Filter groups are separated by hairlines
 * and titled in small caps, the way a printed index is set. Controls are square
 * and 1px bordered so they read as paper stock rather than app chrome.
 *
 * All state lives in the URL (see useCatalogParams); this component only reads
 * `filters` and calls `onChange` with a patch.
 */

const Group = ({ title, children }) => (
    <section className="border-t border-line py-6 first:border-t-0 first:pt-0">
        <h3 className="mb-3.5 font-label text-[11px] uppercase tracking-[0.2em] text-ink/45">
            {title}
        </h3>
        {children}
    </section>
);

const Checkbox = ({ checked, onChange, label, count }) => (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-3.5 w-3.5 shrink-0 appearance-none border border-ink/30 bg-paper
                       transition-colors checked:border-ink checked:bg-ink
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <span className="flex-1">{label}</span>
        {count != null && (
            <span className="font-label text-[11px] tabular-nums text-ink/35">{count}</span>
        )}
    </label>
);

/** Nested category list. Depth is expressed with indentation, not disclosure arrows. */
const CategoryTree = ({ tree, activeId, onSelect }) => {
    const flat = flattenTree(tree);
    if (!flat.length) return null;

    return (
        <ul className="space-y-0.5">
            {flat.map((node) => {
                const isActive = activeId === node._id;
                return (
                    <li key={node._id}>
                        <button
                            type="button"
                            onClick={() => onSelect(isActive ? "" : node._id)}
                            style={{ paddingLeft: `${node.depth * 12}px` }}
                            className={`w-full py-1 text-left text-sm transition-colors ${
                                isActive
                                    ? "font-medium text-ink"
                                    : "text-ink-soft hover:text-ink"
                            }`}
                        >
                            <span
                                className={
                                    isActive
                                        ? "border-b border-marigold pb-0.5"
                                        : "border-b border-transparent pb-0.5"
                                }
                            >
                                {node.name}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};

/**
 * Price inputs.
 *
 * Local state so typing does not fire a request per keystroke; committed on
 * blur or Enter. A range slider was considered and rejected: without a price
 * histogram from the API a slider gives no sense of where products actually
 * sit, and two number fields are more precise on touch.
 */
const PriceRange = ({ minPrice, maxPrice, onChange }) => {
    const [min, setMin] = useState(minPrice);
    const [max, setMax] = useState(maxPrice);

    // Keep in step when the URL changes from elsewhere (chips, clear all, back).
    useEffect(() => setMin(minPrice), [minPrice]);
    useEffect(() => setMax(maxPrice), [maxPrice]);

    const commit = () => {
        // Swap reversed bounds instead of returning nothing.
        const lo = min === "" ? "" : Number(min);
        const hi = max === "" ? "" : Number(max);
        if (lo !== "" && hi !== "" && lo > hi) {
            onChange({ minPrice: hi, maxPrice: lo });
            return;
        }
        onChange({ minPrice: min, maxPrice: max });
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commit();
        }
    };

    const field =
        "w-full border border-ink/20 bg-paper px-2.5 py-2 font-label text-sm tabular-nums text-ink " +
        "placeholder:text-ink/30 focus:border-ink focus:outline-none";

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                inputMode="numeric"
                min="0"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
                placeholder="Min"
                aria-label="Minimum price"
                className={field}
            />
            <span aria-hidden="true" className="font-label text-xs text-ink/30">
                to
            </span>
            <input
                type="number"
                inputMode="numeric"
                min="0"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
                placeholder="Max"
                aria-label="Maximum price"
                className={field}
            />
        </div>
    );
};

const RatingFilter = ({ value, onChange }) => (
    <div className="space-y-0.5">
        {[4, 3, 2].map((score) => {
            const active = value === score;
            return (
                <button
                    key={score}
                    type="button"
                    onClick={() => onChange(active ? 0 : score)}
                    className={`flex w-full items-center gap-2 py-1 text-sm transition-colors ${
                        active ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                >
                    <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={
                                    i < score
                                        ? "fill-marigold text-marigold"
                                        : "fill-ink/10 text-ink/15"
                                }
                            />
                        ))}
                    </span>
                    <span className={active ? "font-medium" : ""}>and above</span>
                </button>
            );
        })}
    </div>
);

export default function FilterSidebar({
    filters,
    onChange,
    categoryTree = [],
    attributes = {},
    lockedCategory = false,
}) {
    const toggleAttribute = (facet, value) => {
        const current = filters.attributes[facet] ?? [];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

        const merged = { ...filters.attributes };
        if (next.length) merged[facet] = next;
        else delete merged[facet];

        onChange({ attributes: merged });
    };

    const attributeEntries = Object.entries(attributes).filter(([, values]) => values?.length);

    return (
        <div className="text-ink">
            {/* On /category/:slug the category is set by the route, so offering
                a category picker here would let the sidebar contradict the URL. */}
            {!lockedCategory && categoryTree.length > 0 && (
                <Group title="Category">
                    <CategoryTree
                        tree={categoryTree}
                        activeId={filters.category}
                        onSelect={(id) => onChange({ category: id })}
                    />
                </Group>
            )}

            <Group title="Price">
                <PriceRange
                    minPrice={filters.minPrice}
                    maxPrice={filters.maxPrice}
                    onChange={onChange}
                />
            </Group>

            <Group title="Availability">
                <Checkbox
                    checked={filters.inStock}
                    onChange={(e) => onChange({ inStock: e.target.checked })}
                    label="In stock only"
                />
                <Checkbox
                    checked={filters.onSale}
                    onChange={(e) => onChange({ onSale: e.target.checked })}
                    label="On offer"
                />
            </Group>

            <Group title="Rating">
                <RatingFilter
                    value={filters.minRating}
                    onChange={(v) => onChange({ minRating: v })}
                />
            </Group>

            {attributeEntries.map(([facet, values]) => (
                <Group key={facet} title={facet}>
                    <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
                        {values.map((value) => (
                            <Checkbox
                                key={value}
                                checked={(filters.attributes[facet] ?? []).includes(value)}
                                onChange={() => toggleAttribute(facet, value)}
                                label={value}
                            />
                        ))}
                    </div>
                </Group>
            ))}
        </div>
    );
}

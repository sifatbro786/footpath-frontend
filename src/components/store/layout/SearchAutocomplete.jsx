import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useProductSuggestions } from "../../../hooks/store/useCatalog";
import { formatPrice, upscaleCloudinary } from "../../../lib/store/productMapper";

/**
 * Header search with a suggestion dropdown.
 *
 * Debounced at 250ms: long enough that a normal typist fires one request per
 * word rather than per keystroke, short enough that the list feels live.
 *
 * Keyboard support is the point of building this rather than using a plain
 * input: arrows move through suggestions, Enter opens the highlighted one or
 * runs a full search, Escape closes. Without that the dropdown is a mouse-only
 * feature and actively gets in the way of anyone typing quickly.
 */
export default function SearchAutocomplete({ onNavigate, autoFocus = false, compact = false }) {
    const navigate = useNavigate();
    const [term, setTerm] = useState("");
    const [debounced, setDebounced] = useState("");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const containerRef = useRef(null);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(term), 250);
        return () => clearTimeout(id);
    }, [term]);

    const { data: suggestions = [], isFetching } = useProductSuggestions(debounced);

    // Close when focus or a click leaves the whole control.
    useEffect(() => {
        const onPointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    // A changed result set invalidates whatever was highlighted.
    useEffect(() => setHighlighted(-1), [suggestions]);

    const goToSearch = (value) => {
        const query = value.trim();
        setOpen(false);
        onNavigate?.();
        navigate(query ? `/search?search=${encodeURIComponent(query)}` : "/shop");
    };

    const goToProduct = (product) => {
        setOpen(false);
        setTerm("");
        onNavigate?.();
        navigate(product.href);
    };

    const onKeyDown = (e) => {
        if (e.key === "Escape") {
            setOpen(false);
            return;
        }
        if (!suggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlighted((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === "Enter" && highlighted >= 0) {
            e.preventDefault();
            goToProduct(suggestions[highlighted]);
        }
    };

    const showDropdown = open && debounced.trim().length >= 2;

    return (
        <div ref={containerRef} className="relative w-full">
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    goToSearch(term);
                }}
            >
                <Search
                    size={compact ? 17 : 18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                />
                <input
                    type="search"
                    value={term}
                    autoFocus={autoFocus}
                    onChange={(e) => {
                        setTerm(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search pens, notebooks, art supplies"
                    aria-label="Search products"
                    aria-expanded={showDropdown}
                    aria-controls="search-suggestions"
                    role="combobox"
                    aria-autocomplete="list"
                    className={`w-full border border-ink/15 bg-paper pl-11 pr-4 text-sm text-ink
                                placeholder:text-ink/35 transition-colors focus:border-ink focus:outline-none ${
                                    compact ? "py-2" : "py-2.5"
                                }`}
                />
            </form>

            {showDropdown && (
                <div
                    id="search-suggestions"
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-96 overflow-y-auto
                               border border-ink/15 bg-paper"
                >
                    {isFetching && suggestions.length === 0 ? (
                        <p className="px-4 py-3.5 font-label text-xs uppercase tracking-[0.14em] text-ink/40">
                            Searching
                        </p>
                    ) : suggestions.length === 0 ? (
                        <p className="px-4 py-3.5 text-sm text-ink-soft">
                            No matches. Press Enter to search the full catalogue.
                        </p>
                    ) : (
                        <>
                            <ul className="divide-y divide-line">
                                {suggestions.map((product, i) => (
                                    <li key={product.id}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={i === highlighted}
                                            onMouseEnter={() => setHighlighted(i)}
                                            onClick={() => goToProduct(product)}
                                            className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                                                i === highlighted ? "bg-paper-dim" : ""
                                            }`}
                                        >
                                            <img
                                                src={upscaleCloudinary(product.image, 120, 120)}
                                                alt=""
                                                loading="lazy"
                                                className="h-11 w-11 shrink-0 border border-line object-cover"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13.5px] text-ink">
                                                    {product.name}
                                                </span>
                                                <span className="font-label text-xs tabular-nums text-ink/50">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                onClick={() => goToSearch(term)}
                                className="w-full border-t border-line px-4 py-3 text-left font-label
                                           text-[11px] uppercase tracking-[0.16em] text-ink/60
                                           transition-colors hover:bg-paper-dim hover:text-ink"
                            >
                                See all results for {debounced.trim()}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

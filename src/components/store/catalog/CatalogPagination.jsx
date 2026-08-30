import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Numbered pagination.
 *
 * Chosen over infinite scroll deliberately: a catalogue needs crawlable,
 * linkable pages, and infinite scroll makes the footer unreachable and the
 * back button unreliable.
 *
 * Window logic keeps first and last always visible with an ellipsis, so the
 * control never reflows width as you move through pages.
 */
const buildPageList = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("gap-start");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push("gap-end");
    pages.push(total);

    return pages;
};

export default function CatalogPagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;

    const pages = buildPageList(currentPage, totalPages);

    const arrow =
        "grid h-9 w-9 place-items-center border border-ink/15 text-ink transition-colors " +
        "hover:border-ink disabled:cursor-not-allowed disabled:border-ink/8 disabled:text-ink/25";

    return (
        <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className={arrow}
            >
                <ChevronLeft size={16} />
            </button>

            {pages.map((page) =>
                typeof page === "string" ? (
                    <span
                        key={page}
                        aria-hidden="true"
                        className="px-1 font-label text-xs text-ink/30"
                    >
                        &hellip;
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`h-9 min-w-9 px-2 font-label text-xs tabular-nums transition-colors ${
                            page === currentPage
                                ? "border border-ink bg-ink text-paper"
                                : "border border-ink/15 text-ink hover:border-ink"
                        }`}
                    >
                        {page}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className={arrow}
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}

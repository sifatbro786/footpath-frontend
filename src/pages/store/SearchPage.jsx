import { useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo";
import CatalogView from "../../components/store/catalog/CatalogView";
import Eyebrow from "../../components/store/ui/Eyebrow";

/**
 * /search?search=<term>
 *
 * The param is named `search` rather than `q` so it matches getProducts and the
 * rest of the catalogue URL vocabulary. A search is just the catalogue with a
 * text filter, so it runs through the same view and keeps every other filter
 * available on top of the results.
 *
 * Server side the term goes to `filter.$text = { $search: term }` against the
 * Product text index (name, description, brand), and the controller adds a
 * textScore tiebreak to the sort.
 */
export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const term = (searchParams.get("search") || "").trim();

    if (!term) {
        return (
            <>
                <Seo title="Search | Elmate Stationery" noIndex />
                <div className="mx-auto max-w-2xl px-4 py-24 text-center">
                    <Eyebrow className="justify-center">Search</Eyebrow>
                    <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                        What are you looking for?
                    </h1>
                    <p className="mt-3 text-[15px] text-ink-soft">
                        Try a brand, a product name, or something as loose as &ldquo;grid
                        notebook&rdquo;.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Search result pages should never be indexed: they create endless
                thin, near duplicate URLs that dilute the catalogue's ranking. */}
            <Seo title={`Search: ${term} | Elmate Stationery`} noIndex />

            <CatalogView
                eyebrow="Search results"
                title={`Results for ${term}`}
                breadcrumbs={[{ label: "Search", href: `/search?search=${encodeURIComponent(term)}` }]}
                emptyMessage={`We could not find anything for ${term}.`}
            />
        </>
    );
}

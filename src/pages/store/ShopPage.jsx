import Seo from "../../components/common/Seo";
import CatalogView from "../../components/store/catalog/CatalogView";

/**
 * /shop — the whole catalogue, unscoped.
 *
 * Filters, sort and paging all live in the query string, so /shop?onSale=true
 * or /shop?sort=price_asc are first class, linkable entry points.
 */
export default function ShopPage() {
    return (
        <>
            <Seo
                slug="shop"
                fallbackTitle="Shop All Stationery | Elmate"
                fallbackDescription="Browse every pen, notebook, ink and desk supply we stock. Filter by category, price and availability."
            />

            <CatalogView
                eyebrow="Everything in store"
                title="The whole shop"
                description="Every notebook, pen and pot of ink we carry, in one place. Narrow it down however you like."
                breadcrumbs={[{ label: "Shop", href: "/shop" }]}
            />
        </>
    );
}

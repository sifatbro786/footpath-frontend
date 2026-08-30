import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo";
import CatalogView from "../../components/store/catalog/CatalogView";
import NotFoundPage from "../client/NotFoundPage";
import { PageLoader } from "../../components/common/Skeleton";
import { useCategoryBySlug } from "../../hooks/store/useCatalog";

/**
 * /category/:slug
 *
 * The slug is resolved against the cached category tree rather than a lookup
 * endpoint, which also yields the ancestor trail for breadcrumbs in the same
 * pass (see lib/store/categoryTree.js for why).
 *
 * An unknown slug renders the real 404 page. Showing an empty catalogue instead
 * would tell both the shopper and Googlebot that the category exists but is
 * bare, which is worse than admitting it is gone.
 */
export default function CategoryPage() {
    const { slug } = useParams();
    const { category, breadcrumbs, isLoading, notFound } = useCategoryBySlug(slug);

    if (isLoading) return <PageLoader />;
    if (notFound) return <NotFoundPage />;

    return (
        <>
            <Seo
                slug={`category/${slug}`}
                title={category ? `${category.name} | Elmate Stationery` : undefined}
                description={
                    category?.description ||
                    `Shop our ${category?.name ?? "full"} range. Delivered across Bangladesh.`
                }
                fallbackTitle="Shop by category | Elmate"
            />

            <CatalogView
                eyebrow="Category"
                title={category?.name ?? "Category"}
                description={category?.description}
                breadcrumbs={breadcrumbs}
                categoryId={category?._id ?? null}
                emptyMessage="Nothing in this aisle matches those filters."
            />
        </>
    );
}

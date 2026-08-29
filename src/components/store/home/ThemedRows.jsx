// src/components/store/home/ThemedRows.jsx
import SectionHeader from "../ui/SectionHeader";
import ProductRow from "../ui/ProductRow";
import SectionState from "../ui/SectionState";
import { SkeletonProductRow } from "../../common/Skeleton";
import { useHomepageSections } from "../../../hooks/store/useStorefront";

/**
 * Admin-configured themed shelves — GET /api/products/homepage-sections
 * (Phase 2).
 *
 * Each row is a DynamicSection managed at /admin/sections. The controller
 * returns the section config AND its matching products in one response, so this
 * needs a single request rather than one call per section — no N+1.
 * (/api/products/dynamic-section/:id exists for refetching one section in
 * isolation; the homepage does not need it.)
 *
 * Sections carry optional backgroundColor / textColor set by the admin. They're
 * applied as inline styles because they're arbitrary user values — Tailwind
 * can't generate classes for colours it never sees at build time.
 *
 * Sections with no matching products are filtered out in useHomepageSections,
 * so a mis-configured attribute filter leaves a gap rather than an empty shelf.
 */

const SectionsSkeleton = () => (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-paper-dim" />
        <SkeletonProductRow count={4} />
    </div>
);

export default function ThemedRows() {
    const { sections, isLoading, isError } = useHomepageSections();

    if (isLoading) return <SectionsSkeleton />;
    if (isError || sections.length === 0) return null;

    return (
        <>
            {sections.map((section) => {
                const styled = Boolean(section.backgroundColor || section.textColor);

                return (
                    <section
                        key={section._id}
                        style={
                            styled
                                ? {
                                      backgroundColor: section.backgroundColor || undefined,
                                      color: section.textColor || undefined,
                                  }
                                : undefined
                        }
                    >
                        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
                            <SectionHeader
                                eyebrow={
                                    // The attribute pair is what defines the
                                    // shelf ("Theme: Studio"), so it doubles as
                                    // a meaningful eyebrow when one exists.
                                    section.attributeValue
                                        ? `${section.attributeKey}: ${section.attributeValue}`
                                        : "Collection"
                                }
                                title={section.title}
                                description={section.description}
                                actionLabel="View all"
                                actionHref={
                                    section.attributeKey && section.attributeValue
                                        ? `/shop?${encodeURIComponent(
                                              section.attributeKey,
                                          )}=${encodeURIComponent(section.attributeValue)}`
                                        : "/shop"
                                }
                            />

                            <div className="mt-8">
                                <SectionState
                                    isEmpty={!section.products?.length}
                                    skeleton={<SkeletonProductRow count={4} />}
                                >
                                    <ProductRow products={section.products} layout="shelf4" />
                                </SectionState>
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    );
}

import { useQuery } from "@tanstack/react-query";
import { pageMetaApi } from "../../api/pageMetaApi";

/**
 * Per-page document metadata.
 *
 * React 19 hoists <title>, <meta> and <link rel="canonical"> to <head> when
 * they're rendered anywhere in the tree, so no react-helmet dependency is
 * needed. That hoisting is why this component can simply return the tags.
 *
 * Content resolution, in priority order:
 *   1. props passed by the page          (product name, category name — dynamic)
 *   2. admin-managed PageMeta for `slug` (editable without a deploy)
 *   3. the `fallback*` props             (never ship an untitled page)
 *
 * Admin manages these at /admin/page-meta. A missing record 404s, which is a
 * normal outcome, not an error — hence retry: false and a silent fall through.
 *
 * PageMeta fields (models/PageMeta.js):
 *   pageSlug, metaTitle, metaDescription, metaKeywords, canonicalUrl, isActive
 */
const Seo = ({
    slug,
    title,
    description,
    keywords,
    canonical,
    image,
    fallbackTitle = "Elmate Stationery",
    fallbackDescription = "Pens, notebooks, inks and desk supplies — delivered across Bangladesh.",
    noIndex = false,
}) => {
    const { data } = useQuery({
        queryKey: ["page-meta", slug],
        queryFn: () => pageMetaApi.getBySlug(slug).then((r) => r.data?.data),
        enabled: Boolean(slug),
        staleTime: 30 * 60 * 1000, // SEO copy changes rarely; cache hard
        retry: false, // a 404 means "no record configured", not a failure
    });

    const resolvedTitle = title || data?.metaTitle || fallbackTitle;
    const resolvedDescription = description || data?.metaDescription || fallbackDescription;
    const resolvedKeywords = keywords || data?.metaKeywords;
    const resolvedCanonical =
        canonical ||
        data?.canonicalUrl ||
        (typeof window !== "undefined" ? window.location.origin + window.location.pathname : null);

    return (
        <>
            <title>{resolvedTitle}</title>
            <meta name="description" content={resolvedDescription} />
            {resolvedKeywords && <meta name="keywords" content={resolvedKeywords} />}
            {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph — what shows when someone shares the link */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={resolvedTitle} />
            <meta property="og:description" content={resolvedDescription} />
            {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
            <meta name="twitter:title" content={resolvedTitle} />
            <meta name="twitter:description" content={resolvedDescription} />
            {image && <meta name="twitter:image" content={image} />}
        </>
    );
};

export default Seo;

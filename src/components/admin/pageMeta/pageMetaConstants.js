// src/components/admin/pageMeta/pageMetaConstants.js
//
// SINGLE SOURCE OF TRUTH for PageMeta vocabulary + SEO length guidance.
// Mirrors models/PageMeta.js (all of metaTitle/metaDescription/metaKeywords/
// canonicalUrl are `required: true`; isActive boolean; pageSlug auto-derived).

export const STATUS_META = {
    active: { label: "Active", badge: "bg-green-100 text-green-700" },
    inactive: { label: "Inactive", badge: "bg-gray-100 text-gray-600" },
};
export const statusMeta = (isActive) => (isActive ? STATUS_META.active : STATUS_META.inactive);

// Recommended SEO character budgets (soft limits — backend enforces none).
// Used to drive the counter colour in the form so an author knows when a title
// or description will get truncated in search results.
export const SEO_LIMITS = {
    metaTitle: { ideal: 60, max: 65 },
    metaDescription: { ideal: 160, max: 165 },
};

// Returns a tailwind text-colour class describing how a length sits against its
// budget: gray (fine) -> amber (approaching) -> red (over).
export const lengthTone = (len, field) => {
    const { ideal, max } = SEO_LIMITS[field] ?? {};
    if (!ideal) return "text-gray-400";
    if (len > max) return "text-red-500";
    if (len > ideal) return "text-amber-500";
    return "text-gray-400";
};

// Mirror of the model's slug derivation (pre-save / pre-findOneAndUpdate hooks)
// so the form can show a live, accurate slug preview before saving.
export const deriveSlug = (pageName = "") =>
    pageName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

export const EMPTY_PAGE_META = {
    pageName: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    isActive: true,
};

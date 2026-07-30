// src/components/admin/navbar/navbarConstants.js
//
// SINGLE SOURCE OF TRUTH for navbar item-type + icon vocabulary.
// Mirrors NavbarConfig.js: item.type enum ["category","custom","link"];
// config booleans cartIcon / searchIcon / userIcon / wishlistIcon.

export const ITEM_TYPES = [
    {
        value: "category",
        label: "Category",
        hint: "Links to a category page — the path is auto-generated from the category slug.",
    },
    {
        value: "link",
        label: "Internal link",
        hint: "A path inside your store, e.g. /about, /best-deal.",
    },
    {
        value: "custom",
        label: "Custom URL",
        hint: "Any URL, including external — e.g. https://blog.example.com.",
    },
];

export const typeLabel = (value) => ITEM_TYPES.find((t) => t.value === value)?.label ?? value;

export const ICON_SETTINGS = [
    { key: "cartIcon", label: "Shopping cart" },
    { key: "searchIcon", label: "Search" },
    { key: "userIcon", label: "User account" },
    { key: "wishlistIcon", label: "Wishlist" },
];

// Client-side stable key — decoupled from the server _id, which churns on every
// save (the controller regenerates "item-…" ids). Used purely for React keys and
// local edit tracking.
export const makeKey = () => `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Resolve the link target the storefront will use, for display + preview.
// `categories` is the flat list from navbarApi.getCategories (has slug).
export const resolveTarget = (item, categories = []) => {
    if (item.type === "category") {
        const id = item.category?._id || item.category;
        const slug = item.category?.slug || categories.find((c) => c._id === id)?.slug;
        return slug ? `/category/${slug}` : "— no category selected —";
    }
    if (item.type === "custom") return item.customUrl?.trim() || "— no URL —";
    return item.path?.trim() || "— no path —";
};

// Normalise a config item (as returned by the API) into the local editing shape.
export const toLocalItem = (item) => ({
    _key: makeKey(),
    _id: item._id, // preserved on save; harmless if the backend regenerates it
    name: item.name ?? "",
    type: item.type ?? "link",
    category: item.category?._id || item.category || "",
    customUrl: item.customUrl ?? "",
    path: item.path ?? "",
    isActive: item.isActive ?? true,
});

export const emptyDraft = () => ({
    _key: makeKey(),
    name: "",
    type: "link",
    category: "",
    customUrl: "",
    path: "",
    isActive: true,
});

// Per-item validation. Returns an error string or "" when valid.
export const validateItem = (item) => {
    if (!item.name?.trim()) return "Item name is required.";
    if (item.type === "category" && !(item.category?._id || item.category))
        return `Select a category for "${item.name}".`;
    if (item.type === "link" && !item.path?.trim()) return `Enter a path for "${item.name}".`;
    if (item.type === "custom" && !item.customUrl?.trim()) return `Enter a URL for "${item.name}".`;
    return "";
};

// Build the exact item payload the backend expects, per type. Note category items
// send path:"" so the controller regenerates it from the (possibly changed) slug —
// otherwise a stale path would stick (see backend audit #2).
export const toPayloadItem = (item, index) => {
    const base = { name: item.name.trim(), type: item.type, order: index, isActive: item.isActive };
    if (item._id) base._id = item._id;
    if (item.type === "category") {
        base.category = item.category?._id || item.category || null;
        base.path = "";
    } else if (item.type === "custom") {
        base.customUrl = item.customUrl.trim();
    } else {
        base.path = item.path.trim();
    }
    return base;
};

// src/components/admin/sections/sectionConstants.js
//
// SINGLE SOURCE OF TRUTH for dynamic-section vocabulary.
// Mirrors models/DynamicSection.js enums.

// sortBy enum on the schema. Labels are what the admin sees.
export const SORT_BY_OPTIONS = [
    { value: "createdAt", label: "Newest" },
    { value: "price", label: "Price" },
    { value: "name", label: "Name" },
    { value: "averageRating", label: "Rating" },
    { value: "discountPercentage", label: "Discount" },
    { value: "stock", label: "Stock" },
];

export const SORT_ORDER_OPTIONS = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
];

// productLimit is min 1 / max 20 on the schema.
export const PRODUCT_LIMIT_CHOICES = [4, 8, 12, 16, 20];

export const sortByLabel = (value) =>
    SORT_BY_OPTIONS.find((o) => o.value === value)?.label || value;

// e.g. "CreatedAt (Desc)" style summary for the list table.
export const sortSummary = (sortBy, sortOrder) =>
    `${sortByLabel(sortBy)} (${sortOrder === "asc" ? "Asc" : "Desc"})`;

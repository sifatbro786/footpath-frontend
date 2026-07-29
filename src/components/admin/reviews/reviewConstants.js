// src/components/admin/reviews/reviewConstants.js
//
// SINGLE SOURCE OF TRUTH for review status vocabulary.
// Mirrors models/Review.js status enum: pending | approved | rejected

export const STATUSES = [
    { value: "pending", label: "Pending", badge: "bg-amber-100 text-amber-700" },
    { value: "approved", label: "Approved", badge: "bg-green-100 text-green-700" },
    { value: "rejected", label: "Rejected", badge: "bg-red-100 text-red-700" },
];

export const statusMeta = (value) => STATUSES.find((s) => s.value === value) || STATUSES[0];

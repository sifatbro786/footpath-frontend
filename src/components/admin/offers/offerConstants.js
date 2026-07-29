// src/components/admin/offers/offerConstants.js
//
// SINGLE SOURCE OF TRUTH for OfferPopup vocabulary.
// Mirrors models/OfferPopup.js:
//   displayFrequency enum -> once | daily | always
//   isActive (boolean)    -> active | inactive (UI-facing labels)

// displayFrequency is stored on the backend but ENFORCED on the storefront
// (via localStorage/cookie). These labels describe that intended behaviour.
export const DISPLAY_FREQUENCIES = [
    {
        value: "once",
        label: "Show Once",
        hint: "Displayed a single time per visitor, ever.",
    },
    {
        value: "daily",
        label: "Once Daily",
        hint: "Displayed at most once per visitor per day.",
    },
    {
        value: "always",
        label: "Every Visit",
        hint: "Displayed on every page load / session.",
    },
];

export const frequencyMeta = (value) =>
    DISPLAY_FREQUENCIES.find((f) => f.value === value) || DISPLAY_FREQUENCIES[0];

// Derived active/inactive badge vocabulary (isActive boolean -> UI).
export const STATUS_META = {
    active: { label: "Active", badge: "bg-green-100 text-green-700" },
    inactive: { label: "Inactive", badge: "bg-gray-100 text-gray-600" },
};

export const statusMeta = (isActive) => (isActive ? STATUS_META.active : STATUS_META.inactive);

// A schedule can also be "expired" (endDate in the past) or "scheduled"
// (startDate in the future) even while isActive === true. This is purely a
// derived, display-only signal — the backend's getActiveOffers already filters
// these out of the public feed, so we surface it here for admin clarity.
export const scheduleState = (offer, now = new Date()) => {
    if (!offer) return null;
    const start = offer.startDate ? new Date(offer.startDate) : null;
    const end = offer.endDate ? new Date(offer.endDate) : null;
    if (start && start > now) return { label: "Scheduled", badge: "bg-blue-100 text-blue-700" };
    if (end && end < now) return { label: "Expired", badge: "bg-red-100 text-red-700" };
    return null; // running / open-ended -> no extra chip
};

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
export const MAX_IMAGE_MB = 5; // mirrors uploadController limits.fileSize (5 * 1024 * 1024)

export const EMPTY_OFFER = {
    title: "",
    description: "",
    thumbnailImage: "",
    buttonText: "Shop Now",
    buttonLink: "",
    displayFrequency: "once",
    priority: 0,
    startDate: "", // yyyy-mm-dd (date input); backend defaults to Date.now if blank on create
    endDate: "",
    isActive: true,
};

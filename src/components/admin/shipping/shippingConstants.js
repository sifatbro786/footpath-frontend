// src/components/admin/shipping/shippingConstants.js
//
// SINGLE SOURCE OF TRUTH for shipping vocabulary. The backend uses TWO different
// zone enums that a mapper bridges — do not hardcode these strings anywhere else.
//
//   Upazila.shippingZone (4 values, District & Upazila management)
//     dhaka_city → dhaka_inside | dhaka_sub → dhaka_sub
//     dhaka_outside → outside_dhaka | other_district → outside_dhaka
//   ShippingRate.locationType (3 values, Shipping Rates)
//     dhaka_inside | dhaka_sub | outside_dhaka
//
// Labels shown in the UI intentionally differ from the DB enum (e.g. the
// "Dhaka Inside" option writes the enum value "dhaka_city").

export const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

// ── Upazila-level shipping zones (matches ShippingConfig.upazilaSchema enum) ──
export const SHIPPING_ZONES = [
    { value: "dhaka_city", label: "Dhaka Inside" },
    { value: "dhaka_sub", label: "Dhaka Sub" },
    { value: "dhaka_outside", label: "Dhaka Out" },
    { value: "other_district", label: "Other District" },
];

export const ZONE_LABEL = Object.fromEntries(SHIPPING_ZONES.map((z) => [z.value, z.label]));

export const ZONE_BADGE = {
    dhaka_city: "bg-blue-50 text-blue-700",
    dhaka_sub: "bg-purple-50 text-purple-700",
    dhaka_outside: "bg-amber-50 text-amber-700",
    other_district: "bg-gray-100 text-gray-600",
};

// ── Rate-level location types (matches ShippingConfig.shippingRateSchema enum) ──
export const LOCATION_TYPES = [
    { value: "dhaka_inside", label: "Dhaka Inside", accent: "blue" },
    { value: "dhaka_sub", label: "Dhaka Sub", accent: "purple" },
    { value: "outside_dhaka", label: "Outside Dhaka", accent: "amber" },
];

export const LOCATION_LABEL = Object.fromEntries(LOCATION_TYPES.map((l) => [l.value, l.label]));

export const DELIVERY_TYPES = ["Home Delivery", "Courier"];

// Mirrors pricingService.isHomeDeliveryOnly — dhaka_inside & dhaka_sub can't use Courier.
export const isHomeDeliveryOnly = (locationType) =>
    locationType === "dhaka_inside" || locationType === "dhaka_sub";

// The exact, legal (locationType × deliveryType) rate slots. Rendered as the
// full set so admins can create missing ones, not just edit existing rows.
export const RATE_SLOTS = [
    { locationType: "dhaka_inside", deliveryType: "Home Delivery" },
    { locationType: "dhaka_sub", deliveryType: "Home Delivery" },
    { locationType: "outside_dhaka", deliveryType: "Courier" },
    { locationType: "outside_dhaka", deliveryType: "Home Delivery" },
];

export const COD_CHARGE_TYPES = [
    { value: "fixed", label: "Fixed Amount (\u09F3)" },
    { value: "percentage", label: "Percentage (%)" },
];

export const rateKey = (locationType, deliveryType) => `${locationType}|${deliveryType}`;

export const ACCENT_CARD = {
    blue: "border-blue-100 bg-blue-50/40",
    purple: "border-purple-100 bg-purple-50/40",
    amber: "border-amber-100 bg-amber-50/40",
};

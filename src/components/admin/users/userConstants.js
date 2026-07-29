// src/components/admin/users/userConstants.js
//
// SINGLE SOURCE OF TRUTH for staff role & account status vocabulary.
// Mirrors models/User.js enums — keep in sync if the schema changes.
//   role:   user | admin | executive
//   status: active | suspended | inactive

export const ROLES = [
    { value: "user", label: "User", badge: "bg-gray-100 text-gray-600" },
    { value: "admin", label: "Admin", badge: "bg-blue-100 text-blue-700" },
    { value: "executive", label: "Executive", badge: "bg-purple-100 text-purple-700" },
];

export const STATUSES = [
    { value: "active", label: "Active", badge: "bg-green-100 text-green-700" },
    { value: "suspended", label: "Suspended", badge: "bg-red-100 text-red-700" },
    { value: "inactive", label: "Inactive", badge: "bg-gray-100 text-gray-500" },
];

export const roleMeta = (value) => ROLES.find((r) => r.value === value) || ROLES[0];
export const statusMeta = (value) => STATUSES.find((s) => s.value === value) || STATUSES[0];

// Backend (adminController.createUser / updateUserRole) rejects granting
// "executive" unless the acting account is itself an executive — mirror that
// here so non-executives never even see the option.
export const assignableRoles = (actingUserRole) =>
    actingUserRole === "executive" ? ROLES : ROLES.filter((r) => r.value !== "executive");

export const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "?";

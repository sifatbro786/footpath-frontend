// Fallback navigation.
//
// The live header nav comes from GET /api/navbar/config (see useNavbarLinks).
// This list is only used for the first paint before that request resolves, and
// as a safety net if it fails. A header with no navigation is a worse failure
// than a briefly stale one.
//
// Every entry points at a route that actually exists, so the fallback can never
// send someone to a 404. Keep it that way when editing.
export const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
];

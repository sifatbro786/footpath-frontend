import axiosInstance from "./axiosInstance";

// Navbar config is a singleton the backend resolves via findOne({ isActive: true }).
//
// Contract notes (verified against navbarController.js):
//   • getConfig  -> public GET /navbar/config. Creates + returns a DEFAULT config
//                   if none exists (side effect). items[].category is populated
//                   to { _id, name, slug } on category-type items.
//   • getCategories -> public GET /navbar/categories. Flat list with `level` for
//                   indentation: [{ _id, name, slug, level, path }].
//   • updateConfig -> PUT /admin/navbar/config. FULL replace of `items` — always
//                   send the complete list, not a delta. Body:
//                   { logo:{url,public_id}, logoUrl, items, cartIcon, searchIcon,
//                     userIcon, wishlistIcon }.
export const navbarApi = {
    getConfig: () => axiosInstance.get("/navbar/config"),
    getCategories: () => axiosInstance.get("/navbar/categories"),
    updateConfig: (payload) => axiosInstance.put("/admin/navbar/config", payload),
};

export default navbarApi;

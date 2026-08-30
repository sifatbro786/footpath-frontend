import axiosInstance from "./axiosInstance";

/**
 * A+ Content, mounted at /api/admin/aplus-content (protect + adminOnly).
 *
 * Verified against controllers/aplusContentController.js.
 *
 * One document per product (productId is unique), holding an ordered array of
 * sections. Six section types, each using a different subset of its fields:
 *   text | features        content (HTML string)
 *   imageGallery           images [{ url, alt, caption }]
 *   video                  videos [{ url, title, thumbnail }]
 *   specifications         specifications [{ key, value }]
 *   comparison             comparisonData [{ feature, ourProduct, competitor }]
 *
 * The save endpoint is an UPSERT keyed on productId: POST creates on first
 * write and updates thereafter, so there is no separate update route and no
 * document id to track.
 */
export const aplusApi = {
    // -> { success, aplusContents, pagination: { total, page, limit, pages } }
    // Note `pages`, not `totalPages`.
    list: (params) => axiosInstance.get("/admin/aplus-content/dashboard", { params }),

    // Upsert. Body: { productId, title, sections, isActive }
    // `sections` may be sent as an array; the controller also tolerates a JSON
    // string, but there is no reason to stringify it.
    save: ({ productId, title, sections, isActive = true }) =>
        axiosInstance.post("/admin/aplus-content", { productId, title, sections, isActive }),

    // Keyed by PRODUCT id, not by the A+ document id.
    toggle: (productId) => axiosInstance.put(`/admin/aplus-content/toggle/${productId}`),
    remove: (productId) => axiosInstance.delete(`/admin/aplus-content/${productId}`),

    // Public read, used to seed the editor with what already exists.
    // -> { success, data } or 404 when the product has no A+ content yet.
    getByProductId: (productId) => axiosInstance.get(`/aplus-content/product/${productId}`),

    // Dedicated A+ image upload -> uploads/ then returns a URL.
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return axiosInstance.post("/admin/aplus-content/upload/image", formData, {
            headers: { "Content-Type": undefined },
        });
    },
};

export default aplusApi;

// src/api/categoryApi.js
import axiosInstance from "./axiosInstance";

/**
 * Backend contract (verified against controllers/categoryController.js):
 *  - Public:  GET  /categories/tree   -> { success, count, data: <nested> }
 *             GET  /categories/:id     -> { success, data }  (parent + children populated)
 *  - Admin:   POST /admin/categories        (multipart, file field = "image")
 *             PUT  /admin/categories/:id     (multipart, file field = "image")
 *             DELETE /admin/categories/:id
 *             DELETE /admin/categories/:id/image
 *
 * Error responses use the `error` key (NOT `message`).
 * `parentCategory` is an ObjectId — must be OMITTED when empty ("" throws a CastError).
 * `metaKeywords` is a String[] — appended as repeated form fields.
 */

// Build multipart FormData from a plain values object.
// Only appends parentCategory / image when actually provided.
const buildCategoryFormData = (values) => {
    const fd = new FormData();

    fd.append("name", values.name ?? "");
    // description / meta* are always sent so they can be cleared on update
    fd.append("description", values.description ?? "");
    fd.append("isActive", String(values.isActive ?? true));
    fd.append("metaTitle", values.metaTitle ?? "");
    fd.append("metaDescription", values.metaDescription ?? "");

    // ObjectId — never send an empty string
    if (values.parentCategory) {
        fd.append("parentCategory", values.parentCategory);
    }

    // String[] — repeated field name; multer/busboy collects them into an array,
    // and Mongoose wraps a single value into a one-element array automatically.
    (values.metaKeywords || []).forEach((kw) => {
        const trimmed = String(kw).trim();
        if (trimmed) fd.append("metaKeywords", trimmed);
    });

    // Only a freshly-selected File goes as the image; existing URLs stay untouched.
    if (values.imageFile instanceof File) {
        fd.append("image", values.imageFile);
    }

    return fd;
};

// Passing Content-Type: undefined removes the instance's default JSON header,
// letting the browser set the correct multipart boundary for FormData.
const multipartConfig = { headers: { "Content-Type": undefined } };

const categoryApi = {
    // Full nested tree for the admin list (includes inactive + content fields).
    getTree: async ({ maxDepth = 4 } = {}) => {
        const res = await axiosInstance.get("/categories/tree", {
            params: { includeInactive: true, includeContent: true, maxDepth },
        });
        return { data: res.data.data || [], count: res.data.count ?? 0 };
    },

    // Full single record — used to seed the edit form (parent + children populated).
    getOne: async (id) => {
        const res = await axiosInstance.get(`/categories/${id}`);
        return res.data.data;
    },

    create: async (values) => {
        const res = await axiosInstance.post(
            "/admin/categories",
            buildCategoryFormData(values),
            multipartConfig,
        );
        return res.data.data;
    },

    update: async (id, values) => {
        const res = await axiosInstance.put(
            `/admin/categories/${id}`,
            buildCategoryFormData(values),
            multipartConfig,
        );
        return res.data.data;
    },

    remove: async (id) => {
        const res = await axiosInstance.delete(`/admin/categories/${id}`);
        return res.data;
    },

    removeImage: async (id) => {
        const res = await axiosInstance.delete(`/admin/categories/${id}/image`);
        return res.data.data;
    },
};

// Extract a human-readable error from the backend's `error` key.
export const getCategoryError = (err, fallback = "Something went wrong") =>
    err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;

export { buildCategoryFormData };
export default categoryApi;

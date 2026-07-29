import axiosInstance from "./axiosInstance";

// routes/admin/uploadAdminRoutes.js (mounted at /api/admin/upload, protect+admin)
export const uploadApi = {
    // field name "image" — returns { success, imageUrl, filename, file }
    uploadSingle: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return axiosInstance.post("/admin/upload/single", formData);
    },
    // field name "images", max 10 — returns { success, files: [{url, filename, ...}], count }
    uploadMultiple: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        return axiosInstance.post("/admin/upload/multiple", formData);
    },
};

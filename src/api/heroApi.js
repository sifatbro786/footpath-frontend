import axiosInstance from "./axiosInstance";

/**
 * Hero endpoints. There are TWO unrelated models behind these, which is easy to
 * confuse — verified against controllers/heroController.js and
 * controllers/heroContentController.js:
 *
 * 1. HeroItem  ->  GET /api/hero-items
 *    Full slide objects: title, subtitle, buttonText, mediaType, mediaUrl,
 *    deviceType ("desktop" | "mobile" | "both"), order, duration.
 *    Response: { success, message, data: [...], count }
 *    This is the one that drives the hero slider.
 *
 *    ⚠️ The HeroItem model has `buttonText` but NO `buttonLink` — there is no
 *    way for an admin to set where a slide's CTA points. The mapper falls back
 *    to /shop. Adding buttonLink to models/Hero.js is a small backend change
 *    worth making.
 *
 * 2. HeroContent  ->  GET /api/hero
 *    The controller throws away title/subtitle/buttonText/buttonLink and
 *    returns ONLY media URLs, grouped by device and media type:
 *      { desktopVideos: [url], desktopImages: [url],
 *        mobileVideos: [url],  mobileImages: [url] }
 *    Note this response is NOT wrapped in { success, data } like the rest of
 *    the API. Because the copy fields are discarded server-side, this is only
 *    usable as a background media set, not as a content block.
 */
export const heroApi = {
    // `device` is optional; omitting it returns every active slide (including
    // deviceType "both"), which is what we want for client-side filtering.
    getItems: (device) =>
        axiosInstance.get("/hero-items", { params: device ? { device } : undefined }),

    getContent: () => axiosInstance.get("/hero"),
};

export default heroApi;

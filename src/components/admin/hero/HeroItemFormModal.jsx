import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Create or edit a hero slide.
 *
 * Field notes, taken from models/Hero.js and the create controller:
 *   title, subtitle, mediaType, mediaUrl are all required server side
 *   buttonText defaults to "Get Started"
 *   duration is seconds and only meaningful for images (video plays to its own
 *   length), which is why the field is hidden for video
 *   deviceType "both" is the default and what most slides want
 *
 * There is NO buttonLink on the model, so a slide's CTA always points at /shop
 * on the storefront. The note in the form says so rather than offering a field
 * that would be silently dropped.
 */

const EMPTY = {
    title: "",
    subtitle: "",
    buttonText: "Get Started",
    mediaType: "image",
    mediaUrl: "",
    deviceType: "both",
    duration: 5,
    isActive: true,
};

const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
const label = "block text-sm font-medium text-gray-700";

export default function HeroItemFormModal({ open, initial, onClose, onSubmit, saving }) {
    const [values, setValues] = useState(EMPTY);

    useEffect(() => {
        setValues(initial ? { ...EMPTY, ...initial } : EMPTY);
    }, [initial, open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const set = (patch) => setValues((prev) => ({ ...prev, ...patch }));

    const submit = (e) => {
        e.preventDefault();
        if (!values.title.trim() || !values.subtitle.trim() || !values.mediaUrl.trim()) {
            toast.error("Title, subtitle and media URL are required.");
            return;
        }
        onSubmit({
            ...values,
            title: values.title.trim(),
            subtitle: values.subtitle.trim(),
            mediaUrl: values.mediaUrl.trim(),
            duration: Number(values.duration) || 5,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} aria-hidden="true" />

            <form
                onSubmit={submit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="hero-form-title"
                className="relative my-8 w-full max-w-lg rounded-lg border border-gray-200 bg-white"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 id="hero-form-title" className="text-base font-semibold text-gray-900">
                        {initial ? "Edit slide" : "New slide"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-5">
                    <div>
                        <label htmlFor="hero-title" className={label}>
                            Headline
                        </label>
                        <input
                            id="hero-title"
                            className={`mt-1.5 ${field}`}
                            value={values.title}
                            maxLength={100}
                            onChange={(e) => set({ title: e.target.value })}
                            placeholder="The good stuff for your *desk*."
                        />
                        {/* The storefront underlines a phrase wrapped in
                            asterisks. Documented here because nothing else
                            tells an admin the convention exists. */}
                        <p className="mt-1 text-xs text-gray-500">
                            Wrap a phrase in *asterisks* to underline it on the storefront.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="hero-subtitle" className={label}>
                            Supporting line
                        </label>
                        <textarea
                            id="hero-subtitle"
                            rows={2}
                            className={`mt-1.5 ${field}`}
                            value={values.subtitle}
                            maxLength={200}
                            onChange={(e) => set({ subtitle: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="hero-mediaType" className={label}>
                                Media type
                            </label>
                            <select
                                id="hero-mediaType"
                                className={`mt-1.5 ${field}`}
                                value={values.mediaType}
                                onChange={(e) => set({ mediaType: e.target.value })}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="hero-deviceType" className={label}>
                                Show on
                            </label>
                            <select
                                id="hero-deviceType"
                                className={`mt-1.5 ${field}`}
                                value={values.deviceType}
                                onChange={(e) => set({ deviceType: e.target.value })}
                            >
                                <option value="both">All devices</option>
                                <option value="desktop">Desktop only</option>
                                <option value="mobile">Mobile only</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="hero-mediaUrl" className={label}>
                            Media URL
                        </label>
                        <input
                            id="hero-mediaUrl"
                            className={`mt-1.5 ${field}`}
                            value={values.mediaUrl}
                            onChange={(e) => set({ mediaUrl: e.target.value })}
                            placeholder="https://res.cloudinary.com/..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Upload through Products or Offers first, then paste the URL here.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="hero-buttonText" className={label}>
                                Button text
                            </label>
                            <input
                                id="hero-buttonText"
                                className={`mt-1.5 ${field}`}
                                value={values.buttonText}
                                maxLength={30}
                                onChange={(e) => set({ buttonText: e.target.value })}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Always links to the shop. There is no link field on this model yet.
                            </p>
                        </div>

                        {values.mediaType === "image" && (
                            <div>
                                <label htmlFor="hero-duration" className={label}>
                                    Seconds on screen
                                </label>
                                <input
                                    id="hero-duration"
                                    type="number"
                                    min="1"
                                    max="30"
                                    className={`mt-1.5 ${field}`}
                                    value={values.duration}
                                    onChange={(e) => set({ duration: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={values.isActive}
                            onChange={(e) => set({ isActive: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Show this slide on the storefront
                    </label>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saving ? "Saving" : initial ? "Save changes" : "Create slide"}
                    </button>
                </div>
            </form>
        </div>
    );
}

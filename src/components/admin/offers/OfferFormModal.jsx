// src/components/admin/offers/OfferFormModal.jsx
import { useEffect, useRef, useState } from "react";
import { X, Upload, Link2, ImagePlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import offerPopupApi from "../../../api/offerPopupApi";
import {
    DISPLAY_FREQUENCIES,
    EMPTY_OFFER,
    IMAGE_ACCEPT,
    MAX_IMAGE_MB,
    frequencyMeta,
} from "./offerConstants";

// ISO / Date -> yyyy-mm-dd for <input type="date">. Returns "" for empty.
const toDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

// Seed the form from an existing offer row. The admin getAll endpoint returns
// FULL documents (flat schema, nothing trimmed), so seeding from the list row
// is safe here — no separate "fetch full record" round-trip is needed.
const seedFrom = (offer) => {
    if (!offer) return { ...EMPTY_OFFER };
    return {
        title: offer.title ?? "",
        description: offer.description ?? "",
        thumbnailImage: offer.thumbnailImage ?? "",
        buttonText: offer.buttonText ?? "Shop Now",
        buttonLink: offer.buttonLink ?? "",
        displayFrequency: offer.displayFrequency ?? "once",
        priority: offer.priority ?? 0,
        startDate: toDateInput(offer.startDate),
        endDate: toDateInput(offer.endDate),
        isActive: offer.isActive ?? true,
    };
};

const OfferFormModal = ({ open, offer, onClose, onSaved }) => {
    const isEdit = Boolean(offer?._id);
    const [form, setForm] = useState(EMPTY_OFFER);
    const [imgMode, setImgMode] = useState("upload"); // "upload" | "url"
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    // Re-seed whenever the modal opens or the target offer changes.
    useEffect(() => {
        if (open) {
            setForm(seedFrom(offer));
            setImgMode("upload");
            setError("");
        }
    }, [open, offer]);

    if (!open) return null;

    const setField = (key) => (e) => {
        const value =
            e.target.type === "checkbox"
                ? e.target.checked
                : e.target.type === "number"
                  ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  : e.target.value;
        setForm((f) => ({ ...f, [key]: value }));
    };

    const close = () => {
        if (saving || uploading) return;
        onClose();
    };

    const doUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_IMAGE_MB}MB`);
            return;
        }
        setUploading(true);
        try {
            const { data } = await offerPopupApi.uploadImage(file);
            const url = data.imageUrl || data.file?.url;
            if (!url) throw new Error("Upload returned no URL");
            setForm((f) => ({ ...f, thumbnailImage: url }));
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(err.response?.data?.message || "Image upload failed");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) doUpload(file);
    };

    const validate = () => {
        if (!form.title.trim()) return "Offer title is required.";
        if (!form.description.trim()) return "Description is required.";
        if (!form.thumbnailImage.trim()) return "An offer image (upload or URL) is required.";
        if (!form.buttonLink.trim()) return "Button link is required.";
        if (form.priority < 0 || form.priority > 100) return "Priority must be between 0 and 100.";
        if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
            return "End date cannot be earlier than start date.";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setError("");

        // Build payload — omit empty optional dates so the backend applies its
        // own defaults (startDate -> Date.now, endDate -> undefined/open-ended).
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            thumbnailImage: form.thumbnailImage.trim(),
            buttonText: form.buttonText.trim() || "Shop Now",
            buttonLink: form.buttonLink.trim(),
            displayFrequency: form.displayFrequency,
            priority: Number(form.priority) || 0,
            isActive: form.isActive,
        };
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
        else if (isEdit) payload.endDate = null; // allow clearing an end date on edit

        setSaving(true);
        try {
            if (isEdit) {
                await offerPopupApi.update(offer._id, payload);
                toast.success("Offer updated");
            } else {
                await offerPopupApi.create(payload);
                toast.success("Offer created");
            }
            onSaved();
        } catch (err) {
            const apiErrs = err.response?.data?.errors;
            setError(
                (Array.isArray(apiErrs) && apiErrs.join(", ")) ||
                    err.response?.data?.message ||
                    "Failed to save offer",
            );
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
    const tabCls = (active) =>
        `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            active
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEdit ? "Edit Offer" : "Create New Offer"}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {isEdit
                                ? "Update this promotional popup offer."
                                : "Configure a promotional popup shown on the storefront."}
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body (scrollable) */}
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto"
                >
                    <div className="space-y-4 px-6 py-5">
                        {error && (
                            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Offer Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.title}
                                onChange={setField("title")}
                                maxLength={200}
                                placeholder="e.g. Summer Sale — 50% Off!"
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={setField("description")}
                                maxLength={1000}
                                rows={3}
                                placeholder="Describe your offer…"
                                className={`${inputCls} resize-y`}
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">
                                {form.description.length}/1000
                            </p>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                Offer Image <span className="text-red-500">*</span>
                            </label>
                            <div className="mb-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setImgMode("upload")}
                                    className={tabCls(imgMode === "upload")}
                                >
                                    <Upload size={14} />
                                    Upload Image
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImgMode("url")}
                                    className={tabCls(imgMode === "url")}
                                >
                                    <Link2 size={14} />
                                    Image URL
                                </button>
                            </div>

                            {imgMode === "url" ? (
                                <input
                                    value={form.thumbnailImage}
                                    onChange={setField("thumbnailImage")}
                                    placeholder="https://…/offer.png"
                                    className={inputCls}
                                />
                            ) : (
                                <div
                                    onClick={() => !uploading && fileRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center transition ${
                                        dragOver
                                            ? "border-gray-500 bg-gray-50"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        className="hidden"
                                        onChange={(e) => doUpload(e.target.files?.[0])}
                                    />
                                    {uploading ? (
                                        <>
                                            <Loader2
                                                size={26}
                                                className="mb-2 animate-spin text-gray-400"
                                            />
                                            <p className="text-sm text-gray-500">Uploading…</p>
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus size={26} className="mb-2 text-gray-400" />
                                            <p className="text-sm font-medium text-gray-700">
                                                Click to upload{" "}
                                                <span className="text-gray-400">
                                                    or drag and drop
                                                </span>
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                PNG, JPG, GIF or WebP (max. {MAX_IMAGE_MB}MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {form.thumbnailImage && (
                                <div className="mt-3 flex items-center gap-3 rounded-md border border-gray-200 p-2">
                                    <img
                                        src={form.thumbnailImage}
                                        alt="Offer preview"
                                        className="h-14 w-14 shrink-0 rounded object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <p className="min-w-0 flex-1 truncate text-xs text-gray-500">
                                        {form.thumbnailImage}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm((f) => ({ ...f, thumbnailImage: "" }))
                                        }
                                        className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Remove image"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Button text / link */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Button Text
                                </label>
                                <input
                                    value={form.buttonText}
                                    onChange={setField("buttonText")}
                                    maxLength={50}
                                    placeholder="Shop Now"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Button Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.buttonLink}
                                    onChange={setField("buttonLink")}
                                    placeholder="/products or /category/sale"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Frequency / priority */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Display Frequency
                                </label>
                                <select
                                    value={form.displayFrequency}
                                    onChange={setField("displayFrequency")}
                                    className={`${inputCls} bg-white`}
                                >
                                    {DISPLAY_FREQUENCIES.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-400">
                                    {frequencyMeta(form.displayFrequency).hint}
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Priority (0–100)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.priority}
                                    onChange={setField("priority")}
                                    className={inputCls}
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Higher priority shows first.
                                </p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={setField("startDate")}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-800">
                                    End Date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={setField("endDate")}
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Active toggle */}
                        <label className="flex items-center gap-2.5 pt-1">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={setField("isActive")}
                                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                            />
                            <span className="text-sm text-gray-700">
                                Active — eligible to display on the storefront (subject to schedule)
                            </span>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={close}
                            disabled={saving || uploading}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OfferFormModal;

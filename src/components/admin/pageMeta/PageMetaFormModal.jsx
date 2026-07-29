// src/components/admin/pageMeta/PageMetaFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import { X, Search, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import pageMetaApi from "../../../api/pageMetaApi";
import { EMPTY_PAGE_META, SEO_LIMITS, deriveSlug, lengthTone } from "./pageMetaConstants";

const seedFrom = (page) => {
    if (!page) return { ...EMPTY_PAGE_META };
    return {
        pageName: page.pageName ?? "",
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
        metaKeywords: page.metaKeywords ?? "",
        canonicalUrl: page.canonicalUrl ?? "",
        isActive: page.isActive ?? true,
    };
};

const truncate = (str, n) => (str.length > n ? `${str.slice(0, n - 1)}…` : str);

const PageMetaFormModal = ({ open, page, onClose, onSaved }) => {
    const isEdit = Boolean(page?._id);
    const [form, setForm] = useState(EMPTY_PAGE_META);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setForm(seedFrom(page));
            setError("");
        }
    }, [open, page]);

    const slug = useMemo(() => deriveSlug(form.pageName), [form.pageName]);
    const keywords = useMemo(
        () =>
            form.metaKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
        [form.metaKeywords],
    );

    if (!open) return null;

    const setField = (key) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [key]: value }));
    };

    const close = () => {
        if (saving) return;
        onClose();
    };

    const validate = () => {
        if (!form.pageName.trim()) return "Page name is required.";
        if (!form.metaTitle.trim()) return "Meta title is required.";
        if (!form.metaDescription.trim()) return "Meta description is required.";
        if (!form.metaKeywords.trim()) return "Meta keywords are required.";
        if (!form.canonicalUrl.trim()) return "Canonical URL is required.";
        if (!/^https?:\/\/.+/i.test(form.canonicalUrl.trim())) {
            return "Canonical URL must be a full URL (starting with http:// or https://).";
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

        const payload = {
            pageName: form.pageName.trim(),
            metaTitle: form.metaTitle.trim(),
            metaDescription: form.metaDescription.trim(),
            metaKeywords: form.metaKeywords.trim(),
            canonicalUrl: form.canonicalUrl.trim(),
        };
        // isActive is only meaningful on update (create defaults to true server-side
        // and there's no isActive field in createPageMeta's destructure).
        if (isEdit) payload.isActive = form.isActive;

        setSaving(true);
        try {
            if (isEdit) {
                await pageMetaApi.update(page._id, payload);
                toast.success("Page meta updated");
            } else {
                await pageMetaApi.create(payload);
                toast.success("Page meta created");
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            {isEdit ? "Edit Page Meta" : "Create Page Meta"}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                            SEO metadata served to crawlers for this storefront page.
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
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

                        {/* Page name + slug preview */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Page Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.pageName}
                                onChange={setField("pageName")}
                                placeholder="e.g. Home, About Us, Contact"
                                className={inputCls}
                            />
                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                Slug:
                                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                    {slug || "—"}
                                </code>
                                <span className="text-gray-400">
                                    (auto-derived; the public route resolves by this slug)
                                </span>
                            </p>
                        </div>

                        {/* Meta title */}
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-800">
                                    Meta Title <span className="text-red-500">*</span>
                                </label>
                                <span
                                    className={`text-xs ${lengthTone(form.metaTitle.length, "metaTitle")}`}
                                >
                                    {form.metaTitle.length}/{SEO_LIMITS.metaTitle.ideal}
                                </span>
                            </div>
                            <input
                                value={form.metaTitle}
                                onChange={setField("metaTitle")}
                                placeholder="Concise, keyword-rich title (~60 chars)"
                                className={inputCls}
                            />
                        </div>

                        {/* Meta description */}
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-800">
                                    Meta Description <span className="text-red-500">*</span>
                                </label>
                                <span
                                    className={`text-xs ${lengthTone(form.metaDescription.length, "metaDescription")}`}
                                >
                                    {form.metaDescription.length}/{SEO_LIMITS.metaDescription.ideal}
                                </span>
                            </div>
                            <textarea
                                value={form.metaDescription}
                                onChange={setField("metaDescription")}
                                rows={3}
                                placeholder="Compelling summary shown under the title in search results (~160 chars)"
                                className={`${inputCls} resize-y`}
                            />
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Meta Keywords <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.metaKeywords}
                                onChange={setField("metaKeywords")}
                                placeholder="comma, separated, keywords"
                                className={inputCls}
                            />
                            {keywords.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {keywords.map((k, i) => (
                                        <span
                                            key={`${k}-${i}`}
                                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                        >
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Canonical URL */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Canonical URL <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <LinkIcon size={15} className="shrink-0 text-gray-400" />
                                <input
                                    value={form.canonicalUrl}
                                    onChange={setField("canonicalUrl")}
                                    placeholder="https://yourstore.com/about"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        {/* Live SERP preview */}
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                <Search size={12} />
                                Search Result Preview
                            </p>
                            <p className="truncate text-sm text-emerald-700">
                                {form.canonicalUrl || "https://yourstore.com/…"}
                            </p>
                            <p className="mt-0.5 text-lg leading-snug text-blue-700">
                                {truncate(form.metaTitle || "Your meta title appears here", 60)}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-600">
                                {truncate(
                                    form.metaDescription ||
                                        "Your meta description preview appears here, giving searchers a reason to click through.",
                                    160,
                                )}
                            </p>
                        </div>

                        {/* Active toggle (edit only) */}
                        {isEdit && (
                            <label className="flex items-center gap-2.5 pt-1">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={setField("isActive")}
                                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Active — served to the storefront (inactive pages 404 on the
                                    public route)
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={close}
                            disabled={saving}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Page Meta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PageMetaFormModal;

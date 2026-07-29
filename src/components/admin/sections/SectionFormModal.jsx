// src/components/admin/sections/SectionFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import sectionApi from "../../../api/sectionApi";
import { productApi } from "../../../api/productApi";
import { SORT_BY_OPTIONS, SORT_ORDER_OPTIONS, PRODUCT_LIMIT_CHOICES } from "./sectionConstants";

const EMPTY = {
    title: "",
    description: "",
    attributeKey: "",
    attributeValue: "",
    productLimit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
    displayOrder: 0,
    isActive: true,
    showInHomepage: true,
};

// Pull only the editable fields off a full section record (edit mode).
const fromSection = (s) => ({
    title: s.title ?? "",
    description: s.description ?? "",
    attributeKey: s.attributeKey ?? "",
    attributeValue: s.attributeValue ?? "",
    productLimit: s.productLimit ?? 8,
    sortBy: s.sortBy ?? "createdAt",
    sortOrder: s.sortOrder ?? "desc",
    displayOrder: s.displayOrder ?? 0,
    isActive: s.isActive ?? true,
    showInHomepage: s.showInHomepage ?? true,
});

const SectionFormModal = ({ open, section, onClose, onSaved }) => {
    const isEdit = Boolean(section);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Attribute vocabulary { key: [values] } across all active products.
    const [vocab, setVocab] = useState({});
    // Live count of products matching the current exact key/value pair.
    const [matchCount, setMatchCount] = useState(null);
    const [counting, setCounting] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(section ? fromSection(section) : EMPTY);
            setError("");
            setMatchCount(null);
        }
    }, [open, section]);

    // Fetch the vocabulary once when the modal opens.
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        productApi
            .getAttributeVocabulary()
            .then(({ data }) => {
                if (!cancelled) setVocab(data.attributes || {});
            })
            .catch(() => {
                // Autocomplete is a convenience — swallow errors, inputs stay free-text.
            });
        return () => {
            cancelled = true;
        };
    }, [open]);

    const keyOptions = useMemo(() => Object.keys(vocab), [vocab]);

    // Values for the exact typed key; fall back to the full distinct value set
    // while the author is still mid-typing an unrecognised key.
    const valueOptions = useMemo(() => {
        const forKey = vocab[form.attributeKey];
        if (forKey && forKey.length) return forKey;
        const all = new Set();
        Object.values(vocab).forEach((vals) => vals.forEach((v) => all.add(v)));
        return Array.from(all);
    }, [vocab, form.attributeKey]);

    // Debounced live match count whenever the (trimmed) key/value pair changes.
    useEffect(() => {
        if (!open) return;
        const key = form.attributeKey.trim();
        const value = form.attributeValue.trim();
        if (!key || !value) {
            setMatchCount(null);
            return;
        }
        setCounting(true);
        const t = setTimeout(async () => {
            try {
                const { data } = await productApi.countByAttribute(key, value);
                setMatchCount(data.total ?? 0);
            } catch {
                setMatchCount(null);
            } finally {
                setCounting(false);
            }
        }, 450);
        return () => clearTimeout(t);
    }, [open, form.attributeKey, form.attributeValue]);

    if (!open) return null;

    const setField = (key) => (e) => {
        const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [key]: val }));
    };

    const close = () => {
        if (saving) return;
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.title.trim() || !form.attributeKey.trim() || !form.attributeValue.trim()) {
            setError("Title, attribute key and attribute value are required.");
            return;
        }

        const payload = {
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            // attribute matching is case/space sensitive on the storefront query —
            // normalise here so "Womens " and "womens" don't silently diverge.
            attributeKey: form.attributeKey.trim(),
            attributeValue: form.attributeValue.trim(),
            productLimit: Number(form.productLimit),
            displayOrder: Number(form.displayOrder) || 0,
        };

        setSaving(true);
        try {
            if (isEdit) {
                const { data } = await sectionApi.update(section._id, payload);
                toast.success("Section updated");
                onSaved(data.section);
            } else {
                const { data } = await sectionApi.create(payload);
                toast.success("Section created");
                onSaved(data.section);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save section");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

    const bothFilled = form.attributeKey.trim() && form.attributeValue.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-semibold text-gray-900">
                        {isEdit ? "Edit Section" : "Add Section"}
                    </h3>
                    <button
                        onClick={close}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Shared datalists for attribute autocomplete */}
                <datalist id="section-attr-keys">
                    {keyOptions.map((k) => (
                        <option key={k} value={k} />
                    ))}
                </datalist>
                <datalist id="section-attr-values">
                    {valueOptions.map((v) => (
                        <option key={v} value={v} />
                    ))}
                </datalist>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    {error && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={setField("title")}
                            maxLength={100}
                            placeholder="e.g., Trending Offer, Winter Collection"
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={setField("description")}
                            maxLength={200}
                            rows={2}
                            placeholder="e.g., Choose Our Trending Offer, Special Winter Products"
                            className={inputCls}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Attribute key <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.attributeKey}
                                onChange={setField("attributeKey")}
                                list="section-attr-keys"
                                autoComplete="off"
                                placeholder="e.g., offer, season, collection"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Attribute value <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.attributeValue}
                                onChange={setField("attributeValue")}
                                list="section-attr-values"
                                autoComplete="off"
                                placeholder="e.g., trend, winter, new-arrival"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <p className="-mt-2 text-xs text-gray-400">
                        Matching is exact and case-sensitive. Pick from existing product attributes
                        (suggested as you type) so the pair actually resolves.
                    </p>

                    {/* Live match preview — stops dead sections being saved */}
                    {bothFilled && (
                        <div
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                                counting
                                    ? "bg-gray-50 text-gray-500"
                                    : matchCount === null
                                      ? "bg-gray-50 text-gray-500"
                                      : matchCount > 0
                                        ? "bg-green-50 text-green-700"
                                        : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            {counting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Checking matched products…
                                </>
                            ) : matchCount === null ? (
                                "Couldn't check match count right now."
                            ) : matchCount > 0 ? (
                                <>
                                    <CheckCircle2 size={15} />
                                    {matchCount} active product{matchCount === 1 ? "" : "s"} match
                                    this pair.
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={15} />
                                    No products match this exact key/value — check spelling and
                                    casing, or tag products first.
                                </>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Products to show
                            </label>
                            <select
                                value={form.productLimit}
                                onChange={setField("productLimit")}
                                className={`${inputCls} bg-white`}
                            >
                                {PRODUCT_LIMIT_CHOICES.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Sort by
                            </label>
                            <select
                                value={form.sortBy}
                                onChange={setField("sortBy")}
                                className={`${inputCls} bg-white`}
                            >
                                {SORT_BY_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Order
                            </label>
                            <select
                                value={form.sortOrder}
                                onChange={setField("sortOrder")}
                                className={`${inputCls} bg-white`}
                            >
                                {SORT_ORDER_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-800">
                            Display order
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={form.displayOrder}
                            onChange={setField("displayOrder")}
                            className={inputCls}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Lower numbers appear first on the homepage.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2 text-sm text-gray-800">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={setField("isActive")}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Active section
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-800">
                            <input
                                type="checkbox"
                                checked={form.showInHomepage}
                                onChange={setField("showInHomepage")}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Show on homepage
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
                            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Section"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SectionFormModal;

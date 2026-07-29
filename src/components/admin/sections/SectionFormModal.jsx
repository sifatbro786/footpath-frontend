// src/components/admin/sections/SectionFormModal.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import sectionApi from "../../../api/sectionApi";
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

    useEffect(() => {
        if (open) {
            setForm(section ? fromSection(section) : EMPTY);
            setError("");
        }
    }, [open, section]);

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
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
                                placeholder="e.g., offer, season, collection"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Attribute value <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.attributeValue}
                                onChange={setField("attributeValue")}
                                placeholder="e.g., trend, winter, new-arrival"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <p className="-mt-2 text-xs text-gray-400">
                        Products whose attributes contain this exact key/value pair are pulled into
                        the section automatically.
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                                Products to show
                            </label>
                            <select
                                value={form.productLimit}
                                onChange={setField("productLimit")}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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

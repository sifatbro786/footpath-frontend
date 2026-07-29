// src/pages/admin/category/CategoryForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import categoryApi, { getCategoryError } from "../../../api/categoryApi";
import FieldLabel from "../../../components/admin/category/FieldLabel";
import CategoryImageUpload from "../../../components/admin/category/CategoryImageUpload";

const META_TITLE_MAX = 600; // schema: metaTitle maxlength 600
const META_DESC_MAX = 1600; // schema: metaDescription maxlength 1600
const NAME_MAX = 1000;
const DESC_MAX = 5000;

const EMPTY = {
    name: "",
    description: "",
    isActive: true,
    parentCategory: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "", // comma-separated in the input; split on submit
};

// Flatten tree to a list with depth for an indented <select>.
const flatten = (nodes, depth = 0, acc = []) => {
    nodes.forEach((n) => {
        acc.push({ _id: n._id, name: n.name, depth });
        if (n.children?.length) flatten(n.children, depth + 1, acc);
    });
    return acc;
};

// Collect a node's own id + all descendant ids (invalid parents → cycle guard).
const collectSubtreeIds = (nodes, targetId, acc = new Set(), inside = false) => {
    nodes.forEach((n) => {
        const isTarget = inside || n._id === targetId;
        if (isTarget) acc.add(n._id);
        collectSubtreeIds(n.children || [], targetId, acc, isTarget);
    });
    return acc;
};

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY);
    const [imageFile, setImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const setField = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

    // Load parent options (tree) + the record itself when editing.
    useEffect(() => {
        (async () => {
            try {
                const [{ data }, record] = await Promise.all([
                    categoryApi.getTree(),
                    isEdit ? categoryApi.getOne(id) : Promise.resolve(null),
                ]);
                setTree(data);
                if (record) {
                    setForm({
                        name: record.name || "",
                        description: record.description || "",
                        isActive: record.isActive ?? true,
                        parentCategory: record.parentCategory?._id || record.parentCategory || "",
                        metaTitle: record.metaTitle || "",
                        metaDescription: record.metaDescription || "",
                        metaKeywords: (record.metaKeywords || []).join(", "),
                    });
                    setExistingImageUrl(record.image?.url || null);
                }
            } catch (err) {
                toast.error(getCategoryError(err, "Failed to load category"));
                navigate("/admin/categories");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Parent dropdown options — exclude self + descendants when editing.
    const parentOptions = useMemo(() => {
        const all = flatten(tree);
        if (!isEdit) return all;
        const blocked = collectSubtreeIds(tree, id);
        return all.filter((o) => !blocked.has(o._id));
    }, [tree, id, isEdit]);

    const removeExistingImage = async () => {
        if (!isEdit) return;
        try {
            await categoryApi.removeImage(id);
            setExistingImageUrl(null);
            toast.success("Image removed");
        } catch (err) {
            toast.error(getCategoryError(err, "Failed to remove image"));
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Category name is required");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description,
                isActive: form.isActive,
                parentCategory: form.parentCategory, // "" => omitted by the API layer
                metaTitle: form.metaTitle,
                metaDescription: form.metaDescription,
                metaKeywords: form.metaKeywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                imageFile,
            };

            if (isEdit) {
                await categoryApi.update(id, payload);
                toast.success("Category updated");
            } else {
                await categoryApi.create(payload);
                toast.success("Category created");
            }
            navigate("/admin/categories");
        } catch (err) {
            toast.error(getCategoryError(err, "Failed to save category"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-5 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/admin/categories")}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    title="Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                    {isEdit ? "Edit Category" : "Create New Category"}
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left: details */}
                <div className="space-y-5 lg:col-span-2">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 text-base font-semibold text-gray-900">
                            Category Details
                        </h2>

                        <div className="mb-4">
                            <FieldLabel
                                htmlFor="name"
                                label="Category Name"
                                required
                                tooltip="Shown to customers and used to auto-generate the URL slug."
                            />
                            <input
                                id="name"
                                value={form.name}
                                onChange={setField("name")}
                                maxLength={NAME_MAX}
                                placeholder="e.g., Electronics, T-Shirts"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <FieldLabel
                                htmlFor="description"
                                label="Description"
                                tooltip="Optional. Displayed on the category page and used for search."
                            />
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={setField("description")}
                                maxLength={DESC_MAX}
                                rows={4}
                                placeholder="A brief description of the category content."
                                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel
                                label="Category Image"
                                tooltip="Optional thumbnail/banner. PNG, JPG, WEBP or GIF, max 5MB."
                            />
                            <CategoryImageUpload
                                file={imageFile}
                                existingUrl={existingImageUrl}
                                onSelect={setImageFile}
                                onClearFile={() => setImageFile(null)}
                                onRemoveExisting={removeExistingImage}
                            />
                        </div>
                    </section>

                    {/* SEO */}
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 text-base font-semibold text-gray-900">
                            Search engine listing preview (SEO)
                        </h2>

                        <div className="mb-4">
                            <FieldLabel
                                htmlFor="metaTitle"
                                label="Meta Title"
                                tooltip="Title shown in search engine results. Keep it concise and descriptive."
                            />
                            <input
                                id="metaTitle"
                                value={form.metaTitle}
                                onChange={setField("metaTitle")}
                                maxLength={META_TITLE_MAX}
                                placeholder="SEO meta title"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">
                                {form.metaTitle.length}/{META_TITLE_MAX} characters
                            </p>
                        </div>

                        <div className="mb-4">
                            <FieldLabel
                                htmlFor="metaDescription"
                                label="Meta Description"
                                tooltip="Summary shown under the title in search results."
                            />
                            <textarea
                                id="metaDescription"
                                value={form.metaDescription}
                                onChange={setField("metaDescription")}
                                maxLength={META_DESC_MAX}
                                rows={3}
                                placeholder="SEO meta description"
                                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">
                                {form.metaDescription.length}/{META_DESC_MAX} characters
                            </p>
                        </div>

                        <div>
                            <FieldLabel
                                htmlFor="metaKeywords"
                                label="Meta Keywords"
                                tooltip="Comma-separated keywords used for SEO indexing."
                            />
                            <input
                                id="metaKeywords"
                                value={form.metaKeywords}
                                onChange={setField("metaKeywords")}
                                placeholder="keyword1, keyword2, keyword3"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Separate keywords with commas
                            </p>
                        </div>
                    </section>
                </div>

                {/* Right: status + organization */}
                <div className="space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 text-base font-semibold text-gray-900">
                            Category Status
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isActive}
                                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                    form.isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        form.isActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-gray-800">
                                    {form.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {form.isActive
                                ? "Categories set to active will be visible in your store."
                                : "Inactive categories are hidden from the storefront."}
                        </p>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h2 className="mb-4 text-base font-semibold text-gray-900">
                            Category Organization
                        </h2>
                        <FieldLabel
                            htmlFor="parentCategory"
                            label="Parent Category"
                            tooltip="Nest this under another category. Leave as root for a top-level category."
                        />
                        <select
                            id="parentCategory"
                            value={form.parentCategory}
                            onChange={setField("parentCategory")}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">No Parent (Root Category)</option>
                            {parentOptions.map((o) => (
                                <option key={o._id} value={o._id}>
                                    {`${"\u2014 ".repeat(o.depth)}${o.name}`}
                                </option>
                            ))}
                        </select>
                    </section>
                </div>
            </div>

            {/* Sticky footer actions */}
            <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-4 py-3 lg:pl-72">
                <div className="mx-auto flex max-w-5xl justify-end gap-3">
                    <button
                        onClick={() => navigate("/admin/categories")}
                        disabled={saving}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? "Saving…" : isEdit ? "Update Category" : "Save Category"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;

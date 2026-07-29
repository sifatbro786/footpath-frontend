/* eslint-disable no-unused-vars */
// src/pages/admin/products/ProductForm.jsx
import {
    ArrowLeft,
    Boxes,
    DollarSign,
    Image as ImageIcon,
    Info,
    Layers,
    Plus,
    Search,
    Tag,
    ToggleRight,
    Trash2,
    Truck,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import categoryApi from "../../../api/categoryApi";
import { productApi } from "../../../api/productApi";
import ProductFaq from "../../../components/admin/products/ProductFaq";
import ProductImageManager from "../../../components/admin/products/ProductImageManager";
import ProductVariantEditor from "../../../components/admin/products/ProductVariantEditor";
import InfoTip from "../../../components/admin/products/InfoTip";
import productFaqData from "../../../components/admin/products/productFaqData";
import { productFinalPrice, formatPrice } from "../../../components/admin/products/productPricing";

const SECTIONS = [
    { id: "basic", label: "Basic Information", icon: Info },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "variants", label: "Variants", icon: Layers },
    { id: "attributes", label: "Attributes", icon: Tag },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "seo", label: "SEO", icon: Search },
    { id: "status", label: "Status", icon: ToggleRight },
];

const emptyForm = {
    name: "",
    brand: "Generic",
    sku: "",
    category: "",
    subCategory: "",
    description: "",
    bulletPoints: [""],
    basePrice: "",
    discountType: "none",
    discountValue: 0,
    stock: "",
    lowStockAlert: 5,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    shippingClass: "Standard",
    isFeatured: false,
    isActive: true,
    imageGroups: [{ name: "Main", images: [] }],
    hasVariants: false,
    variantOptions: [],
    variants: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "", // comma-separated in the input; array on submit
    attributes: [],
};

/* --------------------------- category tree helpers ------------------------ */
const flattenCats = (nodes, depth = 0, acc = []) => {
    nodes.forEach((n) => {
        acc.push({ _id: n._id, name: n.name, depth });
        if (n.children?.length) flattenCats(n.children, depth + 1, acc);
    });
    return acc;
};
const findNode = (nodes, id) => {
    for (const n of nodes) {
        if (n._id === id) return n;
        const f = findNode(n.children || [], id);
        if (f) return f;
    }
    return null;
};

const CURRENCY = "USD"; // schema default; not user-editable here

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [active, setActive] = useState("basic");
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    /* ------------------------------- load -------------------------------- */
    useEffect(() => {
        (async () => {
            try {
                const [{ data: catTree }, res] = await Promise.all([
                    categoryApi.getTree(),
                    isEdit ? productApi.getOne(id) : Promise.resolve(null),
                ]);
                setTree(catTree);

                if (res) {
                    const p = res.data.product;
                    setForm({
                        name: p.name || "",
                        brand: p.brand || "Generic",
                        sku: p.sku || "",
                        category: p.category?._id || p.category || "",
                        subCategory: p.subCategory?._id || p.subCategory || "",
                        description: p.description || "",
                        bulletPoints: p.bulletPoints?.length ? p.bulletPoints : [""],
                        basePrice: p.basePrice ?? "",
                        discountType: p.discountType || "none",
                        discountValue: p.discountValue ?? 0,
                        stock: p.stock ?? "",
                        lowStockAlert: p.lowStockAlert ?? 5,
                        weight: p.weight ?? 0,
                        dimensions: {
                            length: p.dimensions?.length ?? 0,
                            width: p.dimensions?.width ?? 0,
                            height: p.dimensions?.height ?? 0,
                        },
                        shippingClass: p.shippingClass || "Standard",
                        isFeatured: !!p.isFeatured,
                        isActive: p.isActive ?? true,
                        imageGroups: p.imageGroups?.length
                            ? p.imageGroups
                            : [{ name: "Main", images: [] }],
                        hasVariants: !!p.hasVariants,
                        variantOptions: p.variantOptions || [],
                        variants: (p.variants || []).map((v) => ({
                            options: v.options || [],
                            basePrice: v.basePrice ?? "",
                            discountType: v.discountType || "none",
                            discountValue: v.discountValue ?? 0,
                            stock: v.stock ?? 0,
                            sku: v.sku || "",
                            imageGroupName: v.imageGroupName || "",
                            order: v.order ?? 0,
                        })),
                        metaTitle: p.metaTitle || "",
                        metaDescription: p.metaDescription || "",
                        metaKeywords: (p.metaKeywords || []).join(", "),
                        attributes: p.attributes || [],
                    });
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load product");
                if (isEdit) navigate("/admin/products");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const categoryOptions = useMemo(() => flattenCats(tree), [tree]);
    const subCategoryOptions = useMemo(
        () => (form.category ? findNode(tree, form.category)?.children || [] : []),
        [tree, form.category],
    );
    const imageGroupNames = useMemo(
        () => form.imageGroups.map((g) => g.name).filter(Boolean),
        [form.imageGroups],
    );

    const onCategoryChange = (categoryId) => {
        const children = findNode(tree, categoryId)?.children || [];
        const keepSub = children.some((c) => c._id === form.subCategory) ? form.subCategory : "";
        set({ category: categoryId, subCategory: keepSub });
    };

    /* ------------------------------ submit ------------------------------- */
    const validate = () => {
        if (!form.name.trim()) return "Product name is required";
        if (!form.category) return "Category is required";
        if (form.basePrice === "" || Number(form.basePrice) < 0)
            return "Valid base price is required";
        if (form.stock === "" || Number(form.stock) < 0) return "Valid stock is required";
        if (form.discountType === "percentage" && Number(form.discountValue) > 100)
            return "Percentage discount cannot exceed 100%";
        return null;
    };

    const buildPayload = () => {
        const payload = {
            name: form.name.trim(),
            brand: form.brand || "Generic",
            category: form.category,
            description: form.description,
            bulletPoints: form.bulletPoints.map((b) => b.trim()).filter(Boolean),
            basePrice: Number(form.basePrice),
            discountType: form.discountType,
            discountValue: Number(form.discountValue) || 0,
            stock: Number(form.stock),
            lowStockAlert: Number(form.lowStockAlert) || 5,
            weight: Number(form.weight) || 0,
            dimensions: {
                length: Number(form.dimensions.length) || 0,
                width: Number(form.dimensions.width) || 0,
                height: Number(form.dimensions.height) || 0,
            },
            shippingClass: form.shippingClass,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
            imageGroups: form.imageGroups,
            hasVariants: form.hasVariants,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
            metaKeywords: form.metaKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            attributes: form.attributes.filter((a) => a.key?.trim() && a.value?.trim()),
        };

        // sku is unique+sparse — never send an empty string (would collide across products)
        if (form.sku.trim()) payload.sku = form.sku.trim();
        // subCategory must be a valid ObjectId — omit when empty
        if (form.subCategory) payload.subCategory = form.subCategory;

        if (form.hasVariants) {
            payload.variantOptions = form.variantOptions
                .map((o) => ({
                    name: o.name.trim(),
                    values: [...new Set(o.values.map((v) => v.trim()).filter(Boolean))],
                }))
                .filter((o) => o.name && o.values.length);

            payload.variants = form.variants.map((v, i) => ({
                options: v.options.map((o) => ({ name: o.name, value: o.value })),
                // blank base price => inherit product base on the server
                ...(v.basePrice === "" ? {} : { basePrice: Number(v.basePrice) }),
                discountType: v.discountType || "none",
                discountValue: Number(v.discountValue) || 0,
                stock: Number(v.stock) || 0,
                sku: v.sku || "",
                imageGroupName: v.imageGroupName || "",
                order: i,
            }));
        } else {
            payload.variantOptions = [];
            payload.variants = [];
        }

        // NOTE: never send `price` — the server derives it from base + discount.
        return payload;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }
        setSaving(true);
        try {
            const payload = buildPayload();
            if (isEdit) {
                await productApi.update(id, payload);
                toast.success("Product updated");
                navigate(`/admin/products/${id}`);
            } else {
                const { data } = await productApi.create(payload);
                toast.success("Product created");
                navigate(`/admin/products/${data.product._id}`); // straight to the view page
            }
        } catch (err) {
            const data = err.response?.data;
            toast.error(data?.errors?.[0]?.msg || data?.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    /* ------------------------- small field helpers ----------------------- */
    const inputCls =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
    const labelRow = (label, tip, required) => (
        <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-800">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {tip && <InfoTip text={tip} />}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            </div>
        );
    }

    const faq = productFaqData[active];

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Edit Product" : "Add Product"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEdit ? "Update this product" : "Create a new product for your store"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate("/admin/products")}
                        disabled={saving}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
                {/* Left nav */}
                <aside className="lg:sticky lg:top-4 lg:self-start">
                    <nav className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2">
                        {SECTIONS.map(({ id: sid, label, icon: Icon }) => (
                            <button
                                key={sid}
                                onClick={() => setActive(sid)}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                    active === sid
                                        ? "bg-blue-50 font-medium text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="min-w-0 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        {/* ============ BASIC ============ */}
                        {active === "basic" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Basic Information
                                </h2>

                                <div>
                                    {labelRow(
                                        "Product Title",
                                        "Shown to customers; the slug is auto-generated from this on create.",
                                        true,
                                    )}
                                    <input
                                        value={form.name}
                                        onChange={(e) => set({ name: e.target.value })}
                                        maxLength={200}
                                        placeholder="e.g., Cotton T-Shirt"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    {labelRow(
                                        "Description",
                                        "The main product description shown on the product page.",
                                        true,
                                    )}
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => set({ description: e.target.value })}
                                        rows={4}
                                        placeholder="Describe your product…"
                                        className={`${inputCls} resize-y`}
                                    />
                                </div>

                                <div>
                                    <p className="mb-1.5 text-sm font-medium text-gray-800">
                                        Bullet Points (Key Features)
                                    </p>
                                    <div className="space-y-2">
                                        {form.bulletPoints.map((bp, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    value={bp}
                                                    onChange={(e) =>
                                                        set({
                                                            bulletPoints: form.bulletPoints.map(
                                                                (b, j) =>
                                                                    j === i ? e.target.value : b,
                                                            ),
                                                        })
                                                    }
                                                    placeholder={`Bullet Point ${i + 1}`}
                                                    className={inputCls}
                                                />
                                                {form.bulletPoints.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            set({
                                                                bulletPoints:
                                                                    form.bulletPoints.filter(
                                                                        (_, j) => j !== i,
                                                                    ),
                                                            })
                                                        }
                                                        className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() =>
                                            set({ bulletPoints: [...form.bulletPoints, ""] })
                                        }
                                        className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        <Plus size={14} /> Add Another Bullet Point
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        {labelRow("Category", "Primary placement. Required.", true)}
                                        <select
                                            value={form.category}
                                            onChange={(e) => onCategoryChange(e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="">Select category</option>
                                            {categoryOptions.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {`${"\u2014 ".repeat(c.depth)}${c.name}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        {labelRow(
                                            "Subcategory",
                                            "Optional child category for finer grouping.",
                                        )}
                                        <select
                                            value={form.subCategory}
                                            onChange={(e) => set({ subCategory: e.target.value })}
                                            disabled={!subCategoryOptions.length}
                                            className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
                                        >
                                            <option value="">
                                                {subCategoryOptions.length
                                                    ? "Select subcategory"
                                                    : "No subcategories"}
                                            </option>
                                            {subCategoryOptions.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        {labelRow(
                                            "Brand",
                                            "Defaults to 'Generic' if left unchanged.",
                                        )}
                                        <input
                                            value={form.brand}
                                            onChange={(e) => set({ brand: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        {labelRow(
                                            "SKU",
                                            "Optional, but must be unique when set. Leave blank for none.",
                                        )}
                                        <input
                                            value={form.sku}
                                            onChange={(e) => set({ sku: e.target.value })}
                                            placeholder="Product SKU"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============ PRICING ============ */}
                        {active === "pricing" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">Pricing</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        {labelRow("Base Price", "Price before any discount.", true)}
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.basePrice}
                                            onChange={(e) => set({ basePrice: e.target.value })}
                                            placeholder="0"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        {labelRow(
                                            "Discount Type",
                                            "Choose how the discount is applied.",
                                        )}
                                        <select
                                            value={form.discountType}
                                            onChange={(e) =>
                                                set({
                                                    discountType: e.target.value,
                                                    discountValue:
                                                        e.target.value === "none"
                                                            ? 0
                                                            : form.discountValue,
                                                })
                                            }
                                            className={inputCls}
                                        >
                                            <option value="none">No Discount</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                    </div>

                                    {/* Discount Value appears only once a type is chosen */}
                                    {form.discountType !== "none" && (
                                        <div>
                                            {labelRow(
                                                "Discount Value",
                                                form.discountType === "percentage"
                                                    ? "0–100 (%)."
                                                    : "Flat amount subtracted from base price.",
                                            )}
                                            <input
                                                type="number"
                                                min="0"
                                                max={
                                                    form.discountType === "percentage"
                                                        ? 100
                                                        : undefined
                                                }
                                                value={form.discountValue}
                                                onChange={(e) =>
                                                    set({ discountValue: e.target.value })
                                                }
                                                className={inputCls}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        {labelRow(
                                            "Final Price",
                                            "Auto-calculated by the server. Read-only.",
                                        )}
                                        <input
                                            readOnly
                                            value={formatPrice(
                                                productFinalPrice(
                                                    form.basePrice,
                                                    form.discountType,
                                                    form.discountValue,
                                                ),
                                                CURRENCY,
                                            )}
                                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============ INVENTORY ============ */}
                        {active === "inventory" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">Inventory</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        {labelRow(
                                            "Stock",
                                            "The number of units available for sale.",
                                            true,
                                        )}
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.stock}
                                            onChange={(e) => set({ stock: e.target.value })}
                                            placeholder="0"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        {labelRow(
                                            "Low Stock Alert",
                                            "Threshold at which the product is flagged low in admin.",
                                        )}
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.lowStockAlert}
                                            onChange={(e) => set({ lowStockAlert: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Tip: after launch, use “Adjust Stock” on the product list — it
                                    applies a signed +/- change atomically.
                                </p>
                            </div>
                        )}

                        {/* ============ MEDIA ============ */}
                        {active === "media" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">Media</h2>
                                <ProductImageManager
                                    value={form.imageGroups}
                                    onChange={(imageGroups) => set({ imageGroups })}
                                />
                            </div>
                        )}

                        {/* ============ VARIANTS ============ */}
                        {active === "variants" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Variants
                                    </h2>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={form.hasVariants}
                                            onChange={(e) => set({ hasVariants: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        This product has variants
                                    </label>
                                </div>

                                {form.hasVariants ? (
                                    <ProductVariantEditor
                                        variantOptions={form.variantOptions}
                                        variants={form.variants}
                                        imageGroupNames={imageGroupNames}
                                        productBasePrice={form.basePrice}
                                        productDiscountType={form.discountType}
                                        productDiscountValue={form.discountValue}
                                        currency={CURRENCY}
                                        onOptionsChange={(variantOptions) =>
                                            set({ variantOptions })
                                        }
                                        onVariantsChange={(variants) => set({ variants })}
                                    />
                                ) : (
                                    <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                                        Enable “This product has variants” to define options like
                                        Size or Color.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ============ ATTRIBUTES ============ */}
                        {active === "attributes" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Attributes
                                </h2>
                                <div className="space-y-2">
                                    {form.attributes.map((attr, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                value={attr.key}
                                                onChange={(e) =>
                                                    set({
                                                        attributes: form.attributes.map((a, j) =>
                                                            j === i
                                                                ? { ...a, key: e.target.value }
                                                                : a,
                                                        ),
                                                    })
                                                }
                                                placeholder="Key (e.g. Material)"
                                                className={inputCls}
                                            />
                                            <input
                                                value={attr.value}
                                                onChange={(e) =>
                                                    set({
                                                        attributes: form.attributes.map((a, j) =>
                                                            j === i
                                                                ? { ...a, value: e.target.value }
                                                                : a,
                                                        ),
                                                    })
                                                }
                                                placeholder="Value (e.g. Cotton)"
                                                className={inputCls}
                                            />
                                            <button
                                                onClick={() =>
                                                    set({
                                                        attributes: form.attributes.filter(
                                                            (_, j) => j !== i,
                                                        ),
                                                    })
                                                }
                                                className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() =>
                                        set({
                                            attributes: [
                                                ...form.attributes,
                                                { key: "", value: "" },
                                            ],
                                        })
                                    }
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    <Plus size={14} /> Add attribute
                                </button>
                            </div>
                        )}

                        {/* ============ SHIPPING ============ */}
                        {active === "shipping" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">Shipping</h2>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div>
                                        {labelRow("Weight (kg)", "Package weight in kilograms.")}
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.weight}
                                            onChange={(e) => set({ weight: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    {["length", "width", "height"].map((dim) => (
                                        <div key={dim}>
                                            {labelRow(
                                                `${dim[0].toUpperCase()}${dim.slice(1)} (cm)`,
                                                "In centimetres.",
                                            )}
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={form.dimensions[dim]}
                                                onChange={(e) =>
                                                    set({
                                                        dimensions: {
                                                            ...form.dimensions,
                                                            [dim]: e.target.value,
                                                        },
                                                    })
                                                }
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="max-w-xs">
                                    {labelRow(
                                        "Shipping Class",
                                        "Used by shipping/rate logic at checkout.",
                                    )}
                                    <select
                                        value={form.shippingClass}
                                        onChange={(e) => set({ shippingClass: e.target.value })}
                                        className={inputCls}
                                    >
                                        {["Standard", "Express", "Overnight", "Free"].map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ============ SEO ============ */}
                        {active === "seo" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Search engine listing (SEO)
                                </h2>
                                <div>
                                    {labelRow("Meta Title", "Title shown in search results.")}
                                    <input
                                        value={form.metaTitle}
                                        onChange={(e) => set({ metaTitle: e.target.value })}
                                        placeholder="SEO meta title"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    {labelRow(
                                        "Meta Description",
                                        "Summary shown under the title in search results.",
                                    )}
                                    <textarea
                                        value={form.metaDescription}
                                        onChange={(e) => set({ metaDescription: e.target.value })}
                                        rows={3}
                                        placeholder="SEO meta description"
                                        className={`${inputCls} resize-y`}
                                    />
                                </div>
                                <div>
                                    {labelRow("Meta Keywords", "Comma-separated keywords.")}
                                    <input
                                        value={form.metaKeywords}
                                        onChange={(e) => set({ metaKeywords: e.target.value })}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className={inputCls}
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Separate keywords with commas
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ============ STATUS ============ */}
                        {active === "status" && (
                            <div className="space-y-4">
                                <h2 className="text-base font-semibold text-gray-900">Status</h2>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => set({ isActive: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Active — visible in the storefront
                                    </span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) => set({ isFeatured: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Featured — can appear in curated sections
                                    </span>
                                </label>
                            </div>
                        )}
                    </section>

                    {/* Per-tab FAQ */}
                    {faq && (
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <ProductFaq title={faq.title} items={faq.items} />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductForm;

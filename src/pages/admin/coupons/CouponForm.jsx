// src/pages/admin/coupons/CouponForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import couponApi from "../../../api/couponApi";
import categoryApi from "../../../api/categoryApi";
import { productApi } from "../../../api/productApi";

const EMPTY = {
    code: "",
    description: "",
    couponType: "percentage",
    value: "",
    maxDiscountAmount: "",
    minOrderAmount: "0",
    maxUsage: "0",
    usagePerCustomer: "1",
    appliesTo: "all",
    productRestrictions: [],
    categoryRestrictions: [],
    startDate: "",
    expiryDate: "",
    isActive: true,
};

// yyyy-MM-dd for <input type="date">
const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");

const flattenCats = (nodes, depth = 0, acc = []) => {
    nodes.forEach((n) => {
        acc.push({ _id: n._id, name: n.name, depth });
        if (n.children?.length) flattenCats(n.children, depth + 1, acc);
    });
    return acc;
};

const Card = ({ title, children }) => (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
        {children}
    </section>
);

const Field = ({ label, required, children }) => (
    <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const CouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState([]);
    const [productQuery, setProductQuery] = useState("");
    const [productResults, setProductResults] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]); // [{_id, name}]

    const setField = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

    useEffect(() => {
        categoryApi
            .getTree()
            .then(({ data }) => setCategories(flattenCats(data)))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isEdit) {
            setLoading(false);
            return;
        }
        couponApi
            .getOne(id)
            .then(({ data }) => {
                const c = data.coupon;
                setForm({
                    code: c.code || "",
                    description: c.description || "",
                    couponType: c.couponType,
                    value: String(c.value ?? ""),
                    maxDiscountAmount:
                        c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : "",
                    minOrderAmount: String(c.minOrderAmount ?? 0),
                    maxUsage: String(c.maxUsage ?? 0),
                    usagePerCustomer: String(c.usagePerCustomer ?? 1),
                    appliesTo: c.appliesTo || "all",
                    productRestrictions: (c.productRestrictions || []).map((p) => p._id || p),
                    categoryRestrictions: (c.categoryRestrictions || []).map(
                        (cat) => cat._id || cat,
                    ),
                    startDate: toDateInput(c.startDate),
                    expiryDate: toDateInput(c.expiryDate),
                    isActive: c.isActive ?? true,
                });
                // productRestrictions is populated with {_id, name} by getCouponById
                setSelectedProducts(
                    (c.productRestrictions || [])
                        .filter((p) => p && p.name)
                        .map((p) => ({ _id: p._id, name: p.name })),
                );
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "Failed to load coupon");
                navigate("/admin/coupons");
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, navigate]);

    // debounced product search for the "products" restriction picker
    useEffect(() => {
        if (form.appliesTo !== "products" || productQuery.trim().length < 2) {
            setProductResults([]);
            return;
        }
        const t = setTimeout(() => {
            productApi
                .getSearch(productQuery.trim())
                .then(({ data }) => setProductResults(data.products || []))
                .catch(() => {});
        }, 350);
        return () => clearTimeout(t);
    }, [productQuery, form.appliesTo]);

    const toggleCategory = (catId) => {
        setForm((f) => {
            const has = f.categoryRestrictions.includes(catId);
            return {
                ...f,
                categoryRestrictions: has
                    ? f.categoryRestrictions.filter((x) => x !== catId)
                    : [...f.categoryRestrictions, catId],
            };
        });
    };

    const addProduct = (p) => {
        if (form.productRestrictions.includes(p._id)) return;
        setForm((f) => ({ ...f, productRestrictions: [...f.productRestrictions, p._id] }));
        setSelectedProducts((s) => [...s, { _id: p._id, name: p.name }]);
        setProductQuery("");
        setProductResults([]);
    };

    const removeProduct = (pid) => {
        setForm((f) => ({
            ...f,
            productRestrictions: f.productRestrictions.filter((x) => x !== pid),
        }));
        setSelectedProducts((s) => s.filter((p) => p._id !== pid));
    };

    const isFreeShipping = form.couponType === "free_shipping";
    const isPercentage = form.couponType === "percentage";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code.trim()) return toast.error("Coupon code is required");
        if (!isFreeShipping && (!form.value || Number(form.value) <= 0))
            return toast.error("Discount value must be greater than 0");
        if (!form.startDate || !form.expiryDate)
            return toast.error("Start and expiry dates are required");
        if (new Date(form.startDate) >= new Date(form.expiryDate))
            return toast.error("Start date must be before expiry date");
        if (form.appliesTo === "products" && form.productRestrictions.length === 0)
            return toast.error("Select at least one product, or change Applies To");
        if (form.appliesTo === "categories" && form.categoryRestrictions.length === 0)
            return toast.error("Select at least one category, or change Applies To");

        const payload = {
            code: form.code.trim().toUpperCase(),
            description: form.description.trim(),
            couponType: form.couponType,
            value: isFreeShipping ? 0 : Number(form.value),
            maxDiscountAmount:
                isPercentage && form.maxDiscountAmount !== ""
                    ? Number(form.maxDiscountAmount)
                    : null,
            minOrderAmount: Number(form.minOrderAmount) || 0,
            maxUsage: Number(form.maxUsage) || 0,
            usagePerCustomer: Number(form.usagePerCustomer) || 0,
            appliesTo: form.appliesTo,
            productRestrictions: form.appliesTo === "products" ? form.productRestrictions : [],
            categoryRestrictions: form.appliesTo === "categories" ? form.categoryRestrictions : [],
            startDate: form.startDate,
            expiryDate: form.expiryDate,
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await couponApi.update(id, payload);
                toast.success("Coupon updated");
            } else {
                await couponApi.create(payload);
                toast.success("Coupon created");
            }
            navigate("/admin/coupons");
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (Array.isArray(errors) && errors.length) {
                toast.error(errors.map((e) => e.msg).join(", "));
            } else {
                toast.error(err.response?.data?.message || "Failed to save coupon");
            }
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
        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/admin/coupons")}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                    {isEdit ? "Edit Coupon" : "Create Coupon"}
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-5 lg:col-span-2">
                    <Card title="Coupon Details">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Coupon Code" required>
                                <input
                                    value={form.code}
                                    onChange={(e) =>
                                        setField("code")({
                                            target: { value: e.target.value.toUpperCase() },
                                        })
                                    }
                                    placeholder="e.g. SUMMER25"
                                    className={`${inputCls} font-mono uppercase`}
                                />
                            </Field>
                            <Field label="Description">
                                <input
                                    value={form.description}
                                    onChange={setField("description")}
                                    maxLength={200}
                                    placeholder="Internal note, shown to admins only"
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Discount Value">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Discount Type" required>
                                <select
                                    value={form.couponType}
                                    onChange={setField("couponType")}
                                    className={inputCls}
                                >
                                    <option value="percentage">% Percentage Off</option>
                                    <option value="fixed_amount">Fixed Amount Off</option>
                                    <option value="free_shipping">Free Shipping</option>
                                </select>
                            </Field>
                            {!isFreeShipping && (
                                <Field
                                    label={
                                        isPercentage
                                            ? "Discount Value (%)"
                                            : "Discount Value (\u09F3)"
                                    }
                                    required
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        max={isPercentage ? 100 : undefined}
                                        value={form.value}
                                        onChange={setField("value")}
                                        className={inputCls}
                                    />
                                </Field>
                            )}
                            {isPercentage && (
                                <Field label="Max Discount Amount (\u09F3, optional cap)">
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.maxDiscountAmount}
                                        onChange={setField("maxDiscountAmount")}
                                        placeholder="No cap"
                                        className={inputCls}
                                    />
                                </Field>
                            )}
                        </div>
                        {isFreeShipping && (
                            <p className="mt-2 text-xs text-gray-400">
                                Free shipping coupons don't carry a discount value — shipping is
                                zeroed at checkout instead.
                            </p>
                        )}
                    </Card>

                    <Card title="Restrictions">
                        <Field label="Applies To">
                            <select
                                value={form.appliesTo}
                                onChange={setField("appliesTo")}
                                className={inputCls}
                            >
                                <option value="all">All Products</option>
                                <option value="products">Specific Products</option>
                                <option value="categories">Specific Categories</option>
                            </select>
                        </Field>

                        {form.appliesTo === "categories" && (
                            <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-gray-200 p-2">
                                {categories.length === 0 && (
                                    <p className="p-2 text-sm text-gray-400">No categories found</p>
                                )}
                                {categories.map((cat) => (
                                    <label
                                        key={cat._id}
                                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                                        style={{ paddingLeft: `${cat.depth * 16 + 8}px` }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.categoryRestrictions.includes(cat._id)}
                                            onChange={() => toggleCategory(cat._id)}
                                            className="rounded border-gray-300"
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        )}

                        {form.appliesTo === "products" && (
                            <div className="mt-3 space-y-2">
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-2.5 top-2.5 text-gray-400"
                                    />
                                    <input
                                        value={productQuery}
                                        onChange={(e) => setProductQuery(e.target.value)}
                                        placeholder="Search products by name or SKU…"
                                        className={`${inputCls} pl-8`}
                                    />
                                    {productResults.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                            {productResults.map((p) => (
                                                <button
                                                    type="button"
                                                    key={p._id}
                                                    onClick={() => addProduct(p)}
                                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProducts.map((p) => (
                                        <span
                                            key={p._id}
                                            className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                                        >
                                            {p.name}
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(p._id)}
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedProducts.length === 0 && (
                                        <p className="text-xs text-gray-400">
                                            No products selected yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                    <Card title="Status">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                                }
                                className="rounded border-gray-300"
                            />
                            Coupon is Active
                        </label>
                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? "Saving…" : isEdit ? "Update Coupon" : "Create Coupon"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/coupons")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </Card>

                    <Card title="Usage Limits">
                        <div className="space-y-4">
                            <Field label="Total Max Usage (0 for Unlimited)">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.maxUsage}
                                    onChange={setField("maxUsage")}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Usage Per Customer (0 for Unlimited)">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.usagePerCustomer}
                                    onChange={setField("usagePerCustomer")}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Min. Order Amount (\u09F3)">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.minOrderAmount}
                                    onChange={setField("minOrderAmount")}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Validity Period">
                        <div className="space-y-4">
                            <Field label="Start Date" required>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={setField("startDate")}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Expiry Date" required>
                                <input
                                    type="date"
                                    value={form.expiryDate}
                                    onChange={setField("expiryDate")}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default CouponForm;

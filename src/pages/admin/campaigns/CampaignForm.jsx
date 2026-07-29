// src/pages/admin/campaigns/CampaignForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Search } from "lucide-react";
import toast from "react-hot-toast";
import productCampaignApi from "../../../api/productCampaignApi";
import categoryApi from "../../../api/categoryApi";
import { productApi } from "../../../api/productApi";

const EMPTY = {
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    campaignType: "all_products",
    productIds: [],
    categoryIds: [],
    minQuantity: "1",
    priority: "0",
    startDate: "",
    endDate: "",
    isActive: true,
};

// yyyy-MM-ddThh:mm for <input type="datetime-local">
const toDateTimeInput = (v) => (v ? new Date(v).toISOString().slice(0, 16) : "");

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

const Field = ({ label, required, children, hint }) => (
    <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
);

const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const CampaignForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [wasActive, setWasActive] = useState(false);

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
        productCampaignApi
            .getOne(id)
            .then(({ data }) => {
                const c = data.campaign;
                setForm({
                    name: c.name || "",
                    description: c.description || "",
                    discountType: c.discountType,
                    discountValue: String(c.discountValue ?? ""),
                    maxDiscountAmount:
                        c.maxDiscountAmount != null ? String(c.maxDiscountAmount) : "",
                    campaignType: c.campaignType || "all_products",
                    productIds: (c.productIds || []).map((p) => p._id || p),
                    categoryIds: (c.categoryIds || []).map((cat) => cat._id || cat),
                    minQuantity: String(c.minQuantity ?? 1),
                    priority: String(c.priority ?? 0),
                    startDate: toDateTimeInput(c.startDate),
                    endDate: toDateTimeInput(c.endDate),
                    isActive: c.isActive ?? true,
                });
                setSelectedProducts(
                    (c.productIds || [])
                        .filter((p) => p && p.name)
                        .map((p) => ({ _id: p._id, name: p.name })),
                );
                setWasActive(c.currentStatus === "active");
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "Failed to load campaign");
                navigate("/admin/campaigns");
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, navigate]);

    useEffect(() => {
        if (form.campaignType !== "specific_products" || productQuery.trim().length < 2) {
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
    }, [productQuery, form.campaignType]);

    const toggleCategory = (catId) => {
        setForm((f) => {
            const has = f.categoryIds.includes(catId);
            return {
                ...f,
                categoryIds: has
                    ? f.categoryIds.filter((x) => x !== catId)
                    : [...f.categoryIds, catId],
            };
        });
    };

    const addProduct = (p) => {
        if (form.productIds.includes(p._id)) return;
        setForm((f) => ({ ...f, productIds: [...f.productIds, p._id] }));
        setSelectedProducts((s) => [...s, { _id: p._id, name: p.name }]);
        setProductQuery("");
        setProductResults([]);
    };

    const removeProduct = (pid) => {
        setForm((f) => ({ ...f, productIds: f.productIds.filter((x) => x !== pid) }));
        setSelectedProducts((s) => s.filter((p) => p._id !== pid));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Campaign name is required");
        if (!form.discountValue || Number(form.discountValue) <= 0)
            return toast.error("Discount value must be greater than 0");
        if (form.discountType === "percentage" && Number(form.discountValue) > 100)
            return toast.error("Percentage discount cannot exceed 100%");
        if (!form.startDate || !form.endDate) return toast.error("Start and end date are required");
        if (new Date(form.startDate) >= new Date(form.endDate))
            return toast.error("End date must be after start date");
        if (form.campaignType === "specific_products" && form.productIds.length === 0)
            return toast.error("Select at least one product");
        if (form.campaignType === "category_based" && form.categoryIds.length === 0)
            return toast.error("Select at least one category");

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
            campaignType: form.campaignType,
            productIds: form.campaignType === "specific_products" ? form.productIds : [],
            categoryIds: form.campaignType === "category_based" ? form.categoryIds : [],
            minQuantity: Number(form.minQuantity) || 1,
            priority: Number(form.priority) || 0,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await productCampaignApi.update(id, payload);
                toast.success(
                    wasActive
                        ? "Campaign updated — re-applied to affected products"
                        : "Campaign updated",
                );
            } else {
                await productCampaignApi.create(payload);
                toast.success("Campaign created");
            }
            navigate("/admin/campaigns");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save campaign");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-gray-400">Loading…</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/admin/campaigns")}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                    {isEdit ? "Edit Campaign" : "New Campaign"}
                </h1>
            </div>

            {isEdit && wasActive && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                    This campaign is currently active. Saving will roll back the old terms and
                    re-apply the new ones to every affected product immediately.
                </p>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-5 lg:col-span-2">
                    <Card title="Campaign Details">
                        <div className="space-y-4">
                            <Field label="Name" required>
                                <input
                                    value={form.name}
                                    onChange={setField("name")}
                                    placeholder="Eid Flash Sale"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Description">
                                <textarea
                                    value={form.description}
                                    onChange={setField("description")}
                                    rows={2}
                                    className={inputCls}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Discount Type" required>
                                    <select
                                        value={form.discountType}
                                        onChange={setField("discountType")}
                                        className={inputCls}
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </Field>
                                <Field
                                    label={
                                        form.discountType === "percentage"
                                            ? "Discount Value (%)"
                                            : "Discount Value (\u09F3)"
                                    }
                                    required
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        max={form.discountType === "percentage" ? 100 : undefined}
                                        value={form.discountValue}
                                        onChange={setField("discountValue")}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            {form.discountType === "percentage" && (
                                <Field
                                    label="Max Discount Cap (\u09F3, optional)"
                                    hint="Caps the taka amount a percentage discount can knock off — useful for high-value products."
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.maxDiscountAmount}
                                        onChange={setField("maxDiscountAmount")}
                                        className={inputCls}
                                    />
                                </Field>
                            )}

                            <Field
                                label="Minimum Quantity"
                                hint="Reserved for a future per-line-item quantity gate — not yet enforced at checkout."
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={form.minQuantity}
                                    onChange={setField("minQuantity")}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Applies To">
                        <Field label="Scope" required>
                            <select
                                value={form.campaignType}
                                onChange={setField("campaignType")}
                                className={inputCls}
                            >
                                <option value="all_products">All Products</option>
                                <option value="specific_products">Specific Products</option>
                                <option value="category_based">Specific Categories</option>
                            </select>
                        </Field>

                        {form.campaignType === "category_based" && (
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
                                            checked={form.categoryIds.includes(cat._id)}
                                            onChange={() => toggleCategory(cat._id)}
                                            className="rounded border-gray-300"
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        )}

                        {form.campaignType === "specific_products" && (
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
                            Campaign is Active
                        </label>
                        <p className="mt-1 text-xs text-gray-400">
                            Turning this off rolls back affected products even if today falls inside
                            the schedule below.
                        </p>
                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? "Saving…" : isEdit ? "Update Campaign" : "Create Campaign"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/campaigns")}
                            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </Card>

                    <Card title="Priority">
                        <Field
                            label="Priority (0–100)"
                            hint="When a product is eligible for more than one active campaign, the highest priority wins — it is never stacked with others."
                        >
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={form.priority}
                                onChange={setField("priority")}
                                className={inputCls}
                            />
                        </Field>
                    </Card>

                    <Card title="Schedule">
                        <div className="space-y-4">
                            <Field label="Start Date & Time" required>
                                <input
                                    type="datetime-local"
                                    value={form.startDate}
                                    onChange={setField("startDate")}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="End Date & Time" required>
                                <input
                                    type="datetime-local"
                                    value={form.endDate}
                                    onChange={setField("endDate")}
                                    className={inputCls}
                                />
                            </Field>
                            <p className="text-xs text-gray-400">
                                A background job checks every minute and applies/rolls back
                                campaigns automatically as this window opens and closes.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default CampaignForm;

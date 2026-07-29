// src/pages/admin/carts/CreateCampaignTab.jsx
import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import toast from "react-hot-toast";
import adminCartApi from "../../../api/adminCartApi";

// Promotion.discountType enum is ["percentage", "fixed_amount"] — NOT "fixed".
// (ProductCampaign uses "fixed"; do not confuse the two.)
const DISCOUNT_TYPES = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "fixed_amount", label: "Fixed Amount (\u09F3)" },
];

// Maps to adminCartController.createCampaign targetType -> targetUsers switch.
const TARGET_TYPES = [
    { value: "abandoned_cart", label: "Abandoned Cart Users" },
    { value: "all_users", label: "All Users" },
    { value: "specific_users", label: "Specific Users" },
];

const emptyForm = {
    name: "",
    discountType: "percentage",
    description: "",
    discountValue: "10",
    durationHours: "24",
    targetType: "abandoned_cart",
    minimumCartValue: "",
    targetUsersRaw: "", // comma-separated ids, used only for manual specific_users
};

const CreateCampaignTab = ({ prefillUser, onDone }) => {
    const [form, setForm] = useState(emptyForm);
    const [pinnedUser, setPinnedUser] = useState(null); // set when arriving from a cart row
    const [submitting, setSubmitting] = useState(false);

    // Arriving via the envelope action on a cart -> target that single user.
    useEffect(() => {
        if (prefillUser?._id) {
            setPinnedUser(prefillUser);
            setForm((f) => ({ ...f, targetType: "specific_users" }));
        }
    }, [prefillUser]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const clearPinnedUser = () => {
        setPinnedUser(null);
        setForm((f) => ({ ...f, targetType: "abandoned_cart" }));
    };

    const validate = () => {
        if (!form.name.trim()) return "Campaign name is required";
        const value = Number(form.discountValue);
        if (!value || value <= 0) return "Discount value must be greater than 0";
        if (form.discountType === "percentage" && value > 100)
            return "Percentage discount cannot exceed 100%";
        if (!Number(form.durationHours) || Number(form.durationHours) <= 0)
            return "Duration must be greater than 0 hours";
        if (form.targetType === "specific_users" && !pinnedUser && !form.targetUsersRaw.trim())
            return "Provide at least one user ID for specific users";
        return null;
    };

    const buildTargetUsers = () => {
        if (form.targetType !== "specific_users") return undefined;
        if (pinnedUser) return [pinnedUser._id];
        return form.targetUsersRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) {
            toast.error(err);
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await adminCartApi.createCampaign({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                durationHours: Number(form.durationHours),
                minimumCartValue: form.minimumCartValue ? Number(form.minimumCartValue) : undefined,
                targetType: form.targetType,
                targetUsers: buildTargetUsers(),
            });
            toast.success(
                data.message ||
                    `Campaign created — ${data.campaignsCreated ?? 0} notification(s) sent`,
            );
            setForm(emptyForm);
            setPinnedUser(null);
            onDone?.();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to create campaign");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls =
        "w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none";
    const labelCls = "mb-1 block text-sm font-medium text-gray-700";

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Create New Campaign</h2>

            <div className="space-y-5">
                {/* Row 1: name + discount type */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className={labelCls}>
                            Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={set("name")}
                            placeholder="Summer Sale, Abandoned Cart Offer, etc."
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Discount Type</label>
                        <select
                            value={form.discountType}
                            onChange={set("discountType")}
                            className={inputCls}
                        >
                            {DISCOUNT_TYPES.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        value={form.description}
                        onChange={set("description")}
                        rows={3}
                        placeholder="Describe the campaign purpose..."
                        className={inputCls}
                    />
                </div>

                {/* Row 2: value + duration + target */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className={labelCls}>
                            Discount Value <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.discountValue}
                            onChange={set("discountValue")}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>
                            Duration (Hours) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={form.durationHours}
                            onChange={set("durationHours")}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Target Type</label>
                        <select
                            value={form.targetType}
                            onChange={set("targetType")}
                            disabled={Boolean(pinnedUser)}
                            className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
                        >
                            {TARGET_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Minimum cart value */}
                <div className="md:w-1/3">
                    <label className={labelCls}>Minimum Cart Value (Optional)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.minimumCartValue}
                        onChange={set("minimumCartValue")}
                        placeholder="e.g. 500"
                        className={inputCls}
                    />
                </div>

                {/* Specific-users context */}
                {form.targetType === "specific_users" &&
                    (pinnedUser ? (
                        <div className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700">
                            Targeting{" "}
                            <span className="font-semibold">
                                {pinnedUser.name || pinnedUser.email}
                            </span>
                            <button
                                onClick={clearPinnedUser}
                                className="ml-1 text-orange-500 hover:text-orange-700"
                                title="Clear"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label className={labelCls}>User IDs (comma-separated)</label>
                            <input
                                value={form.targetUsersRaw}
                                onChange={set("targetUsersRaw")}
                                placeholder="64f..., 65a..."
                                className={inputCls}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Tip: use the envelope action on a cart row to target a user without
                                pasting IDs.
                            </p>
                        </div>
                    ))}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        <Send size={15} />
                        {submitting ? "Creating…" : "Create Campaign"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaignTab;

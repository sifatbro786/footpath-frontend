// src/components/admin/shipping/ShippingRateModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";

import adminShippingApi from "../../../api/adminShippingApi";
import { LOCATION_LABEL, COD_CHARGE_TYPES } from "./shippingConstants";

// Empty string in the UI must serialize to null so the backend can "disable"
// optional thresholds (schema default is null), not store 0.
const toNullableNumber = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

const ShippingRateModal = ({ slot, rate, onClose, onSaved }) => {
    const isEdit = Boolean(rate?._id);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        baseCharge: rate?.baseCharge ?? "",
        codChargeType: rate?.codChargeType ?? "fixed",
        codChargeValue: rate?.codChargeValue ?? "",
        freeShippingThreshold: rate?.freeShippingThreshold ?? "",
        reducedShippingThreshold: rate?.reducedShippingThreshold ?? "",
        reducedShippingAmount: rate?.reducedShippingAmount ?? "",
        isActive: rate?.isActive ?? true,
    });

    const set = (key) => (e) =>
        setForm((f) => ({
            ...f,
            [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
        }));

    const handleSave = async () => {
        if (form.baseCharge === "" || Number(form.baseCharge) < 0)
            return toast.error("Base charge is required");
        if (form.codChargeValue === "" || Number(form.codChargeValue) < 0)
            return toast.error("COD charge value is required");
        if (form.codChargeType === "percentage" && Number(form.codChargeValue) > 100)
            return toast.error("Percentage COD cannot exceed 100%");

        const payload = {
            baseCharge: Number(form.baseCharge),
            codChargeType: form.codChargeType,
            codChargeValue: Number(form.codChargeValue),
            freeShippingThreshold: toNullableNumber(form.freeShippingThreshold),
            reducedShippingThreshold: toNullableNumber(form.reducedShippingThreshold),
            reducedShippingAmount: toNullableNumber(form.reducedShippingAmount),
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await adminShippingApi.updateRate(rate._id, payload);
                toast.success("Shipping rate updated");
            } else {
                // locationType + deliveryType only come from the fixed slot — never
                // free-typed — so we can't create an illegal (e.g. Dhaka Inside + Courier) combo.
                await adminShippingApi.createRate({
                    ...payload,
                    locationType: slot.locationType,
                    deliveryType: slot.deliveryType,
                });
                toast.success("Shipping rate created");
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save rate");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none";
    const labelCls = "mb-1 block text-xs font-medium text-gray-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] max-w-5xl w-auto overflow-y-auto rounded-lg bg-white shadow-xl">
                <div className="border-b border-gray-100 px-6 py-4">
                    <p className="font-bold text-gray-900">
                        {LOCATION_LABEL[slot.locationType]}
                        <span className="font-normal text-gray-400"> · {slot.deliveryType}</span>
                    </p>
                    {isEdit ? (
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            {rate.isActive ? "Active" : "Inactive"}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">New rate</span>
                    )}
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelCls}>Base Charge (৳)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.baseCharge}
                                onChange={set("baseCharge")}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>COD Charge Type</label>
                            <select
                                value={form.codChargeType}
                                onChange={set("codChargeType")}
                                className={inputCls}
                            >
                                {COD_CHARGE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>
                            COD Charge{" "}
                            {form.codChargeType === "percentage" ? "(%)" : "Amount (\u09F3)"}
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.codChargeValue}
                            onChange={set("codChargeValue")}
                            className={inputCls}
                        />
                    </div>
                    
                    {/* //? Free Shipping Threshold */}
                    {/* <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Free Shipping Threshold
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.freeShippingThreshold}
                            onChange={set("freeShippingThreshold")}
                            placeholder="Leave blank to disable"
                            className={inputCls}
                        />
                    </div> */}

                    {/* //? Reduced Shipping */}
                    {/* <div className="rounded-md border border-gray-100 bg-gray-50/60 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Reduced Shipping
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className={labelCls}>Order amount ≥ (৳)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.reducedShippingThreshold}
                                    onChange={set("reducedShippingThreshold")}
                                    placeholder="e.g. 2000"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Reduced charge (৳)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.reducedShippingAmount}
                                    onChange={set("reducedShippingAmount")}
                                    placeholder="e.g. 50"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div> */}

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={set("isActive")}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Active
                    </label>
                </div>

                <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingRateModal;

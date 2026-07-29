// src/components/admin/shipping/ShippingRatesTab.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Info } from "lucide-react";
import toast from "react-hot-toast";

import adminShippingApi from "../../../api/adminShippingApi";
import { LOCATION_TYPES, RATE_SLOTS, rateKey, formatBDT, ACCENT_CARD } from "./shippingConstants";
import ShippingRateModal from "./ShippingRateModal";

const CodValue = ({ rate }) =>
    rate.codChargeType === "percentage"
        ? `${rate.codChargeValue}%`
        : formatBDT(rate.codChargeValue);

const RateCard = ({ slot, rate, accent, onEdit }) => {
    const configured = Boolean(rate);
    return (
        <div
            className={`rounded-lg border p-4 ${configured ? ACCENT_CARD[accent] : "border-dashed border-gray-300 bg-white"}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-900">
                        {LOCATION_TYPES.find((l) => l.value === slot.locationType)?.label}
                        <span className="font-normal text-gray-400"> · {slot.deliveryType}</span>
                    </p>
                    {configured ? (
                        <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                rate.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                            }`}
                        >
                            {rate.isActive ? "Active" : "Inactive"}
                        </span>
                    ) : (
                        <span className="mt-1 inline-block text-xs text-gray-400">
                            Not configured
                        </span>
                    )}
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                    {configured ? <Pencil size={13} /> : <Plus size={13} />}
                    {configured ? "Edit" : "Configure"}
                </button>
            </div>

            {configured && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-white/70 p-3 text-center">
                        <p className="text-xs text-gray-400">Base Charge</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formatBDT(rate.baseCharge)}
                        </p>
                    </div>
                    <div className="rounded-md bg-white/70 p-3 text-center">
                        <p className="text-xs text-gray-400">COD Charge</p>
                        <p className="text-lg font-bold text-gray-900">
                            <CodValue rate={rate} />
                        </p>
                        <p className="text-[11px] text-gray-400">
                            {rate.codChargeType === "percentage" ? "percentage" : "fixed amount"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ShippingRatesTab = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // { slot, rate|null }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await adminShippingApi.getRates();
            setRates(data.rates || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load shipping rates");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const byKey = useMemo(() => {
        const map = {};
        rates.forEach((r) => (map[rateKey(r.locationType, r.deliveryType)] = r));
        return map;
    }, [rates]);

    // Group the fixed slot set by locationType so we render 3 zone sections.
    const groups = useMemo(
        () =>
            LOCATION_TYPES.map((loc) => ({
                ...loc,
                slots: RATE_SLOTS.filter((s) => s.locationType === loc.value),
            })),
        [],
    );

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Shipping Rates</h2>
                <p className="text-xs text-gray-500">
                    Configure charges per location &amp; delivery type
                </p>
            </div>

            {/* Info banner */}
            <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
                <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
                <p>
                    <span className="font-semibold">3-Zone Dhaka Shipping.</span> Dhaka Inside (city
                    thanas) and Dhaka Sub (Gazipur, Narayanganj, Savar etc.) support Home Delivery
                    only. Outside Dhaka supports both Courier and Home Delivery. COD charge is added
                    on top of base charge.
                </p>
            </div>

            {loading ? (
                <div className="py-16 text-center text-gray-400">Loading…</div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div key={group.value}>
                            <h3 className="mb-2 text-sm font-semibold text-gray-500">
                                {group.label}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                {group.slots.map((slot) => {
                                    const rate =
                                        byKey[rateKey(slot.locationType, slot.deliveryType)];
                                    return (
                                        <RateCard
                                            key={rateKey(slot.locationType, slot.deliveryType)}
                                            slot={slot}
                                            rate={rate}
                                            accent={group.accent}
                                            onEdit={() => setEditing({ slot, rate: rate || null })}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <ShippingRateModal
                    slot={editing.slot}
                    rate={editing.rate}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            )}
        </div>
    );
};

export default ShippingRatesTab;

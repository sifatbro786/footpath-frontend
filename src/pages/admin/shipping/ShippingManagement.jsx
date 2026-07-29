// src/pages/admin/shipping/ShippingManagement.jsx
import { useState } from "react";
import { Truck } from "lucide-react";

import DistrictsTab from "../../../components/admin/shipping/DistrictsTab";
import CourierBranchesTab from "../../../components/admin/shipping/CourierBranchesTab";
import ShippingRatesTab from "../../../components/admin/shipping/ShippingRatesTab";

const TABS = [
    { key: "districts", label: "Districts & Upazilas" },
    { key: "courier", label: "Courier Branches" },
    { key: "rates", label: "Shipping Rates" },
];

const ShippingManagement = () => {
    const [tab, setTab] = useState("districts");

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
                <p className="text-sm text-gray-500">
                    Manage districts, courier branches &amp; shipping rates
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                {TABS.map(({ key, label }) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                active
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {tab === "districts" && <DistrictsTab />}
            {tab === "courier" && <CourierBranchesTab />}
            {tab === "rates" && <ShippingRatesTab />}
        </div>
    );
};

export default ShippingManagement;

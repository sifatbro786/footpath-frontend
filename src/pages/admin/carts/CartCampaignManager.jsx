/* eslint-disable no-unused-vars */
// src/pages/admin/carts/CartCampaignManager.jsx
import { useState } from "react";
import { TrendingUp, ShoppingCart, Tag } from "lucide-react";
import CartOverviewTab from "../../../components/admin/carts/CartOverviewTab";
import AllCartsTab from "../../../components/admin/carts/AllCartsTab";
import CreateCampaignTab from "../../../components/admin/carts/CreateCampaignTab";

const TABS = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "carts", label: "All Carts", icon: ShoppingCart },
    { key: "create", label: "Create Campaign", icon: Tag },
];

const CartCampaignManager = () => {
    const [tab, setTab] = useState("overview");

    // When the envelope action on a cart row is clicked we jump to the Create
    // Campaign tab pre-targeted at that single user (targetType: specific_users).
    // There is no per-cart "send email" endpoint, so we reuse the real
    // createCampaign flow rather than inventing a payload for bulk-promotions.
    const [prefillUser, setPrefillUser] = useState(null);

    const goCreateForUser = (user) => {
        setPrefillUser(user);
        setTab("create");
    };

    return (
        <div className="space-y-5 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Cart Campaign Manager</h1>
                <p className="text-sm text-gray-500">
                    Manage abandoned carts and create targeted campaigns
                </p>
            </div>

            {/* Tabs */}
            <div className="rounded-lg border border-gray-200 bg-white px-2">
                <nav className="flex gap-1">
                    {TABS.map(({ key, label, icon: Icon }) => {
                        const active = tab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                                    active
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {tab === "overview" && <CartOverviewTab />}
            {tab === "carts" && <AllCartsTab onCreateForUser={goCreateForUser} />}
            {tab === "create" && (
                <CreateCampaignTab
                    prefillUser={prefillUser}
                    onDone={() => {
                        setPrefillUser(null);
                        setTab("carts");
                    }}
                />
            )}
        </div>
    );
};

export default CartCampaignManager;

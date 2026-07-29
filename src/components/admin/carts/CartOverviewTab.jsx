/* eslint-disable no-unused-vars */
// src/pages/admin/carts/CartOverviewTab.jsx
import { useEffect, useState } from "react";
import { ShoppingCart, Users, Clock, TrendingUp, Info, Package } from "lucide-react";
import toast from "react-hot-toast";
import adminCartApi from "../../../api/adminCartApi";

const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, hint }) => (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon size={20} className={iconColor} />
        </div>
        <div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
                {label}
                {hint && (
                    <span title={hint} className="cursor-help text-gray-400">
                        <Info size={13} />
                    </span>
                )}
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const CartOverviewTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await adminCartApi.getStats();
                setStats(data.stats || null);
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load cart stats");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const totalCarts = stats?.totalCarts ?? 0;
    const abandonedCarts = stats?.abandonedCarts ?? 0;
    const activeUsers = stats?.totalUsers ?? 0;

    // The backend does not expose order data here, so there is no true
    // cart->order conversion metric. We surface the "active (non-abandoned)
    // share" as a proxy and label it clearly via the tooltip so it isn't
    // mistaken for real conversion.
    const activeShare = totalCarts ? ((totalCarts - abandonedCarts) / totalCarts) * 100 : 0;

    const popular = stats?.popularProducts || [];

    if (loading) {
        return <div className="py-16 text-center text-gray-400">Loading…</div>;
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={ShoppingCart}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    label="Total Carts"
                    value={totalCarts}
                />
                <StatCard
                    icon={Users}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    label="Active Users"
                    value={activeUsers}
                />
                <StatCard
                    icon={Clock}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                    label="Abandoned Carts"
                    value={abandonedCarts}
                />
                <StatCard
                    icon={TrendingUp}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    label="Conversion Rate"
                    value={`${activeShare.toFixed(1)}%`}
                    hint="Active (non-abandoned) share of carts. The API does not expose order data, so this is not true order conversion."
                />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-gray-900">Most Added Products in Carts</h2>

                {popular.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">No product data yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {popular.map((p, i) => (
                            <li key={p._id || i} className="flex items-center gap-3 py-3">
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <Package size={16} className="text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {p.name || "Unknown product"}
                                    </p>
                                    <p className="text-xs text-gray-400">{formatBDT(p.price)}</p>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    <p>
                                        <span className="font-semibold text-gray-800">
                                            {p.count}
                                        </span>{" "}
                                        cart{p.count === 1 ? "" : "s"}
                                    </p>
                                    <p>{p.totalQuantity} unit(s)</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CartOverviewTab;

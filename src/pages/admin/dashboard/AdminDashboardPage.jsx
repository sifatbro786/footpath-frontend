/* eslint-disable no-unused-vars */
// src/pages/admin/dashboard/AdminDashboardPage.jsx
//
// Wired 1:1 to GET /api/admin/analytics/dashboard (analyticsController.getDashboardAnalytics).
//
// IMPORTANT scope semantics baked into this UI — the endpoint mixes windows, and
// showing them under one banner would be misleading, so each block is labelled
// for exactly the window the backend computes it over:
//   • overview.totalOrders / pendingOrders / deliveredOrders / totalProducts /
//     totalUsers  → ALL-TIME counts (no date filter in the controller).
//   • overview.totalRevenue / categorySales / topProducts → the SELECTED period,
//     DELIVERED orders only.
//   • paymentMethods → the SELECTED period, but ALL orders regardless of status.
//   • salesTrend → ALWAYS the last 7 days, independent of the period selector,
//     and only contains days that actually had delivered orders (we zero-fill the
//     gaps client-side so the line doesn't lie).
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DollarSign,
    ShoppingCart,
    Clock,
    Truck,
    Package,
    Users,
    RefreshCw,
    Layers,
    Star,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import toast from "react-hot-toast";
import { analyticsApi } from "../../../api/adminApi";

/* --------------------------------- helpers -------------------------------- */

const PERIODS = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This week" },
    { value: "monthly", label: "This month" },
    { value: "yearly", label: "This year" },
];
const periodLabel = (v) => PERIODS.find((p) => p.value === v)?.label ?? "This month";

const fmtCurrency = (n) => `৳${Number(n || 0).toLocaleString("en-US")}`;
const fmtNumber = (n) => Number(n || 0).toLocaleString("en-US");

// Payment method vocabulary mirrors Order.js enum: ["COD", "SSLCommerz"].
const PAYMENT_META = {
    COD: { label: "Cash on Delivery", color: "#f59e0b" },
    SSLCommerz: { label: "SSLCommerz", color: "#4f46e5" },
};
const paymentMeta = (id) => PAYMENT_META[id] || { label: id || "Unknown", color: "#9ca3af" };

// Build a continuous, oldest→newest 7-day series and zero-fill days the backend
// omitted (it only returns days with delivered orders). Keyed in UTC to match
// the controller's $dateToString(%Y-%m-%d) which runs in UTC.
const buildTrend = (salesTrend = []) => {
    const byKey = new Map(salesTrend.map((d) => [d._id, d]));
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const dt = new Date(
            Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i),
        );
        const key = dt.toISOString().slice(0, 10);
        const hit = byKey.get(key);
        days.push({
            key,
            label: dt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
            }),
            sales: hit?.dailySales ?? 0,
            orders: hit?.orderCount ?? 0,
        });
    }
    return days;
};

/* ------------------------------- primitives ------------------------------- */

const KpiCard = ({ icon: Icon, label, value, scope, accent = "gray" }) => {
    const accentCls = {
        gray: "bg-gray-100 text-gray-600",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        blue: "bg-blue-100 text-blue-700",
        indigo: "bg-indigo-100 text-indigo-700",
    }[accent];
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-md ${accentCls}`}
                >
                    <Icon size={17} />
                </span>
                {scope && (
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        {scope}
                    </span>
                )}
            </div>
            <p className="mt-3 text-sm text-gray-500">{label}</p>
            <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
};

const Panel = ({ title, subtitle, right, children, className = "" }) => (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div>
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
            {right}
        </div>
        {children}
    </div>
);

const EmptyRow = ({ children }) => (
    <div className="flex h-full min-h-40 flex-col items-center justify-center px-4 py-10 text-center text-sm text-gray-400">
        {children}
    </div>
);

const CurrencyTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="mt-1 text-gray-600">
                Revenue: <span className="font-semibold">{fmtCurrency(payload[0].value)}</span>
            </p>
            {payload[0]?.payload?.orders != null && (
                <p className="text-gray-500">Orders: {fmtNumber(payload[0].payload.orders)}</p>
            )}
        </div>
    );
};

/* --------------------------------- page ----------------------------------- */

const AdminDashboardPage = () => {
    const [period, setPeriod] = useState("monthly");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await analyticsApi.getDashboard(period);
            setData(res.data.data);
        } catch (err) {
            setError(true);
            toast.error(err.response?.data?.message || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        load();
    }, [load]);

    const overview = data?.overview ?? {};
    const trend = useMemo(() => buildTrend(data?.salesTrend), [data]);
    const trendTotal = useMemo(() => trend.reduce((s, d) => s + d.sales, 0), [trend]);
    const payments = useMemo(() => data?.paymentMethods ?? [], [data]);
    const paymentTotal = useMemo(
        () => payments.reduce((s, p) => s + (p.count || 0), 0),
        [payments],
    );
    const topProducts = data?.topProducts ?? [];
    const categorySales = data?.categorySales ?? [];
    const maxCatSales = Math.max(1, ...categorySales.map((c) => c.totalSales || 0));

    /* ------------------------------ loading ------------------------------- */
    if (loading && !data) {
        return (
            <div className="space-y-5 pb-10">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="h-80 animate-pulse rounded-lg bg-gray-100 lg:col-span-2" />
                    <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
                </div>
            </div>
        );
    }

    /* ------------------------------- error -------------------------------- */
    if (error && !data) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
                <p className="text-sm text-gray-600">Couldn’t load the dashboard.</p>
                <button
                    onClick={load}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <RefreshCw size={14} />
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">
            {/* Header + period control */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        Store performance overview · updated live from delivered orders
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-md border border-gray-300 bg-white p-0.5">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                                    period === p.value
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI grid — scope tag on each card so period vs all-time is never ambiguous */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                <KpiCard
                    icon={DollarSign}
                    label="Revenue"
                    value={fmtCurrency(overview.totalRevenue)}
                    scope={periodLabel(period)}
                    accent="green"
                />
                <KpiCard
                    icon={ShoppingCart}
                    label="Total orders"
                    value={fmtNumber(overview.totalOrders)}
                    scope="All time"
                    accent="blue"
                />
                <KpiCard
                    icon={Clock}
                    label="Pending"
                    value={fmtNumber(overview.pendingOrders)}
                    scope="All time"
                    accent="amber"
                />
                <KpiCard
                    icon={Truck}
                    label="Delivered"
                    value={fmtNumber(overview.deliveredOrders)}
                    scope="All time"
                    accent="green"
                />
                <KpiCard
                    icon={Package}
                    label="Active products"
                    value={fmtNumber(overview.totalProducts)}
                    scope="All time"
                    accent="indigo"
                />
                <KpiCard
                    icon={Users}
                    label="Active customers"
                    value={fmtNumber(overview.totalUsers)}
                    scope="All time"
                    accent="gray"
                />
            </div>

            <p className="text-xs text-gray-400">
                Revenue, top products and category breakdown reflect{" "}
                <span className="font-medium text-gray-500">delivered</span> orders for{" "}
                <span className="font-medium text-gray-500">
                    {periodLabel(period).toLowerCase()}
                </span>
                . Order, product and customer counts are all-time totals.
            </p>

            {/* Row: sales trend + payment mix */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Panel
                    className="lg:col-span-2"
                    title="Sales trend"
                    subtitle="Fixed 7-day window · delivered orders (independent of the period above)"
                    right={
                        <div className="text-right">
                            <p className="text-xs text-gray-400">7-day total</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {fmtCurrency(trendTotal)}
                            </p>
                        </div>
                    }
                >
                    <div className="px-2 py-4">
                        {trendTotal === 0 ? (
                            <EmptyRow>No delivered orders in the last 7 days yet.</EmptyRow>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart
                                    data={trend}
                                    margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
                                >
                                    <defs>
                                        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="0%"
                                                stopColor="#111827"
                                                stopOpacity={0.16}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#111827"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={54}
                                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                                    />
                                    <Tooltip content={<CurrencyTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#111827"
                                        strokeWidth={2}
                                        fill="url(#revFill)"
                                        dot={{ r: 2.5, fill: "#111827" }}
                                        activeDot={{ r: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Payment methods"
                    subtitle={`Orders placed · ${periodLabel(period).toLowerCase()}`}
                >
                    <div className="px-4 py-4">
                        {paymentTotal === 0 ? (
                            <EmptyRow>No orders placed in this period.</EmptyRow>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={payments}
                                            dataKey="count"
                                            nameKey="_id"
                                            innerRadius={48}
                                            outerRadius={72}
                                            paddingAngle={2}
                                            stroke="none"
                                        >
                                            {payments.map((p) => (
                                                <Cell key={p._id} fill={paymentMeta(p._id).color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, _n, entry) => [
                                                `${fmtNumber(value)} orders · ${fmtCurrency(
                                                    entry?.payload?.totalAmount,
                                                )}`,
                                                paymentMeta(entry?.payload?._id).label,
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-3 space-y-2">
                                    {payments.map((p) => {
                                        const meta = paymentMeta(p._id);
                                        const pct = Math.round((p.count / paymentTotal) * 100);
                                        return (
                                            <div
                                                key={p._id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="flex items-center gap-2 text-gray-600">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: meta.color }}
                                                    />
                                                    {meta.label}
                                                </span>
                                                <span className="text-gray-500">
                                                    {fmtNumber(p.count)} ({pct}%) ·{" "}
                                                    <span className="font-medium text-gray-700">
                                                        {fmtCurrency(p.totalAmount)}
                                                    </span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </Panel>
            </div>

            {/* Row: top products + category breakdown */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel
                    title="Top products"
                    subtitle={`By units sold · delivered · ${periodLabel(period).toLowerCase()}`}
                    right={<Star size={15} className="text-gray-300" />}
                >
                    {topProducts.length === 0 ? (
                        <EmptyRow>No products sold in this period yet.</EmptyRow>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-4 py-2.5 w-8">#</th>
                                        <th className="px-4 py-2.5">Product</th>
                                        <th className="px-4 py-2.5 text-right">Units</th>
                                        <th className="px-4 py-2.5 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topProducts.map((p, i) => (
                                        <tr key={p._id ?? i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                                            <td className="max-w-56 truncate px-4 py-2.5 font-medium text-gray-800">
                                                {p.productName || "—"}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-gray-600">
                                                {fmtNumber(p.totalSold)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                                {fmtCurrency(p.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>

                <Panel
                    title="Sales by category"
                    subtitle={`Delivered · ${periodLabel(period).toLowerCase()}`}
                    right={<Layers size={15} className="text-gray-300" />}
                >
                    {categorySales.length === 0 ? (
                        <EmptyRow>No category sales in this period yet.</EmptyRow>
                    ) : (
                        <div className="space-y-3 px-4 py-4">
                            {categorySales.slice(0, 6).map((c) => (
                                <div key={c._id}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="truncate font-medium text-gray-800">
                                            {c.categoryName}
                                        </span>
                                        <span className="text-gray-500">
                                            {fmtCurrency(c.totalSales)}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-gray-900"
                                            style={{
                                                width: `${Math.max(
                                                    3,
                                                    (c.totalSales / maxCatSales) * 100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {fmtNumber(c.totalItems)} items · {fmtNumber(c.orderCount)}{" "}
                                        order{c.orderCount === 1 ? "" : "s"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
};

export default AdminDashboardPage;

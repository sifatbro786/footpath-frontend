import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, TrendingUp } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import toast from "react-hot-toast";

import { analyticsApi } from "../../../api/adminApi";
import { exportCsv } from "../../../lib/admin/exportCsv";

/**
 * /admin/sales-report
 *
 * The endpoint has existed since the start and was never called by anything.
 *
 * Two things about it that shape this page:
 *
 * 1. It only counts orders with orderStatus "Delivered". That is a defensible
 *    definition of revenue (money actually earned, not money promised), but it
 *    means the numbers here will not match the dashboard's order totals, and
 *    someone will ask why. The page says so explicitly.
 *
 * 2. It returns one row per date + product, already grouped, with no totals.
 *    So the daily chart and the summary are aggregated here from those rows
 *    rather than fetched separately.
 */

const taka = (n) => `৳${Math.round(Number(n) || 0).toLocaleString("en-BD")}`;

/** Default window: the last 30 days, as yyyy-mm-dd for the date inputs. */
const defaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
};

export default function SalesReportPage() {
    const [range, setRange] = useState(defaultRange);
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await analyticsApi.getSalesReport({
                startDate: range.startDate,
                // The backend compares against createdAt with $lte, so a bare
                // date would exclude everything after midnight on the end day.
                endDate: `${range.endDate}T23:59:59.999Z`,
                paymentMethod,
            });
            setRows(data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load the sales report");
        } finally {
            setLoading(false);
        }
    }, [range.startDate, range.endDate, paymentMethod]);

    useEffect(() => {
        load();
    }, [load]);

    const summary = useMemo(() => {
        const revenue = rows.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
        const units = rows.reduce((sum, r) => sum + (r.quantitySold || 0), 0);
        const products = new Set(rows.map((r) => r._id?.productId)).size;
        return { revenue, units, products };
    }, [rows]);

    /** Revenue per day, oldest first, for the chart. */
    const daily = useMemo(() => {
        const byDate = new Map();
        for (const row of rows) {
            const date = row._id?.date;
            if (!date) continue;
            const current = byDate.get(date) ?? { date, revenue: 0, units: 0 };
            current.revenue += row.totalRevenue || 0;
            current.units += row.quantitySold || 0;
            byDate.set(date, current);
        }
        return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [rows]);

    /** Best sellers by revenue over the window. */
    const topProducts = useMemo(() => {
        const byProduct = new Map();
        for (const row of rows) {
            const id = row._id?.productId;
            if (!id) continue;
            const current = byProduct.get(id) ?? {
                id,
                name: row._id.productName,
                category: row._id.categoryName,
                revenue: 0,
                units: 0,
            };
            current.revenue += row.totalRevenue || 0;
            current.units += row.quantitySold || 0;
            byProduct.set(id, current);
        }
        return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    }, [rows]);

    const handleExport = () => {
        if (rows.length === 0) {
            toast.error("Nothing to export for this range.");
            return;
        }
        exportCsv({
            filename: `sales-report-${range.startDate}-to-${range.endDate}`,
            columns: [
                { label: "Date", format: (r) => r._id?.date },
                { label: "Product", format: (r) => r._id?.productName },
                { label: "Category", format: (r) => r._id?.categoryName },
                { label: "Units sold", format: (r) => r.quantitySold },
                { label: "Revenue (BDT)", format: (r) => Math.round(r.totalRevenue || 0) },
                { label: "Average price (BDT)", format: (r) => Math.round(r.averagePrice || 0) },
            ],
            rows,
        });
    };

    const inputCls =
        "rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Sales report</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Revenue from delivered orders, broken down by product.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stated up front, because it is the first question anyone asks
                when these numbers differ from the dashboard's. */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Counts delivered orders only. Pending, confirmed and shipped orders are excluded
                until they arrive.
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div>
                    <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                        From
                    </label>
                    <input
                        id="from"
                        type="date"
                        className={`mt-1.5 ${inputCls}`}
                        value={range.startDate}
                        max={range.endDate}
                        onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
                    />
                </div>
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                        To
                    </label>
                    <input
                        id="to"
                        type="date"
                        className={`mt-1.5 ${inputCls}`}
                        value={range.endDate}
                        min={range.startDate}
                        onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
                    />
                </div>
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700">
                        Payment
                    </label>
                    <select
                        id="method"
                        className={`mt-1.5 ${inputCls}`}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="all">All methods</option>
                        <option value="COD">Cash on delivery</option>
                        <option value="SSLCommerz">Paid online</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: "Revenue", value: taka(summary.revenue) },
                    { label: "Units sold", value: summary.units.toLocaleString("en-BD") },
                    { label: "Products sold", value: summary.products.toLocaleString("en-BD") },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                            {loading ? "—" : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-900">Revenue by day</h2>

                {loading ? (
                    <div className="mt-4 h-64 animate-pulse rounded bg-gray-100" />
                ) : daily.length === 0 ? (
                    <div className="mt-4 grid h-64 place-items-center text-center">
                        <div>
                            <TrendingUp size={22} className="mx-auto text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">
                                No delivered orders in this range.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={daily}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    // Long ranges would overlap every label.
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                                />
                                <Tooltip
                                    formatter={(value) => [taka(value), "Revenue"]}
                                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                                />
                                <Bar dataKey="revenue" fill="#111827" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
                    Best sellers in this range
                </h2>

                {topProducts.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-500">
                        Nothing sold in this range yet.
                    </p>
                ) : (
                    <table className="w-full min-w-2xl text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Units</th>
                                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{product.category}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                                        {product.units}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                                        {taka(product.revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

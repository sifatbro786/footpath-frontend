// src/pages/admin/carts/AllCartsTab.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Eye, Mail, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import adminCartApi from "../../../api/adminCartApi";
import Pagination from "../common/Pagination";
import CartDetailsModal from "./CartDetailsModal";

const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("") || "?";

const StatusPill = ({ abandoned }) =>
    abandoned ? (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
            Abandoned
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Active
        </span>
    );

const AllCartsTab = ({ onCreateForUser }) => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all"); // all | active | abandoned
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCart, setSelectedCart] = useState(null);

    // Debounce the search box so we don't hit the API on every keystroke.
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await adminCartApi.getAllCarts({
                page,
                limit: 20,
                search: search || undefined,
                status: status !== "all" ? status : undefined,
            });
            setCarts(data.carts || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load carts");
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    // The base getAllCarts endpoint has no server-side status filter unless you
    // apply the optional backend patch. Until then, `status` is ignored server-
    // side, so we also filter the loaded page here so the control still works.
    const visibleCarts = useMemo(() => {
        if (status === "all") return carts;
        const wantAbandoned = status === "abandoned";
        return carts.filter((c) => Boolean(c.isAbandoned) === wantAbandoned);
    }, [carts, status]);

    return (
        <div className="space-y-4">
            {/* Search + Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="relative flex-1 min-w-60">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by user name, email or product..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                    />
                </div>
                <button
                    onClick={() => setShowFilters((s) => !s)}
                    className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium ${
                        showFilters
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    <SlidersHorizontal size={15} />
                    Filters
                </button>

                {showFilters && (
                    <div className="w-full">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="abandoned">Abandoned</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Cart Items</th>
                                <th className="px-4 py-3">Total Value</th>
                                <th className="px-4 py-3">Last Updated</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            ) : visibleCarts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <ShoppingCart
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No carts found
                                    </td>
                                </tr>
                            ) : (
                                visibleCarts.map((cart) => {
                                    const itemCount = cart.items?.length || 0;
                                    return (
                                        <tr key={cart._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                                                        {initials(cart.user?.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {cart.user?.name || "Unknown user"}
                                                        </p>
                                                        <p className="truncate text-xs text-gray-400">
                                                            {cart.user?.email || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {itemCount} item{itemCount === 1 ? "" : "s"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">
                                                {formatBDT(cart.totalPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {cart.updatedAt
                                                    ? new Date(cart.updatedAt).toLocaleDateString(
                                                          "en-GB",
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusPill abandoned={cart.isAbandoned} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setSelectedCart(cart)}
                                                        title="View cart"
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            cart.user
                                                                ? onCreateForUser?.(cart.user)
                                                                : toast.error(
                                                                      "This cart has no linked user",
                                                                  )
                                                        }
                                                        title="Create recovery campaign for this user"
                                                        className="text-orange-500 hover:text-orange-700"
                                                    >
                                                        <Mail size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} total carts</p>

            <CartDetailsModal
                cart={selectedCart}
                open={Boolean(selectedCart)}
                onClose={() => setSelectedCart(null)}
                onCreateForUser={(user) => {
                    setSelectedCart(null);
                    onCreateForUser?.(user);
                }}
            />
        </div>
    );
};

export default AllCartsTab;

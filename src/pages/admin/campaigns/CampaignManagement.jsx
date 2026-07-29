// src/pages/admin/campaigns/CampaignManagement.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Megaphone, Play, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import productCampaignApi from "../../../api/productCampaignApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";

const formatBDT = (n) => `\u09F3${Number(n || 0).toLocaleString("en-BD")}`;

const formatDiscount = (c) => {
    if (c.discountType === "percentage")
        return `${c.discountValue}%${c.maxDiscountAmount ? ` (up to ${formatBDT(c.maxDiscountAmount)})` : ""}`;
    return formatBDT(c.discountValue);
};

const formatScope = (c) => {
    if (c.campaignType === "all_products") return "All Products";
    if (c.campaignType === "specific_products")
        return `${c.productIds?.length || 0} Product${c.productIds?.length === 1 ? "" : "s"}`;
    if (c.campaignType === "category_based")
        return `${c.categoryIds?.length || 0} Categor${c.categoryIds?.length === 1 ? "y" : "ies"}`;
    return "—";
};

const StatusPill = ({ campaign }) => {
    if (!campaign.isActive)
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Disabled
            </span>
        );
    if (campaign.currentStatus === "active")
        return (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Active
            </span>
        );
    if (campaign.currentStatus === "upcoming")
        return (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Scheduled
            </span>
        );
    return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
            Ended
        </span>
    );
};

const CampaignManagement = () => {
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [status, setStatus] = useState("all"); // all | upcoming | active | ended
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [actionId, setActionId] = useState(null); // campaign currently apply/rollback-ing

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await productCampaignApi.getAll({
                page,
                limit: 20,
                status: status !== "all" ? status : undefined,
            });
            setCampaigns(data.campaigns || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [status]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await productCampaignApi.remove(deleteTarget._id);
            toast.success("Campaign deleted — affected products rolled back");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete campaign");
        } finally {
            setDeleting(false);
        }
    };

    const handleApply = async (c) => {
        setActionId(c._id);
        try {
            const { data } = await productCampaignApi.apply(c._id);
            toast.success(`Applied to ${data.result?.appliedProducts ?? 0} product(s)`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to apply campaign");
        } finally {
            setActionId(null);
        }
    };

    const handleRollback = async (c) => {
        setActionId(c._id);
        try {
            const { data } = await productCampaignApi.rollback(c._id);
            toast.success(`Rolled back ${data.result?.rolledBackProducts ?? 0} product(s)`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to roll back campaign");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Product Campaigns</h1>
                    <p className="text-sm text-gray-500">
                        Time-boxed discounts applied directly to product pricing. A background job
                        starts/ends these every minute — use Apply/Rollback for an immediate effect.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/campaigns/new")}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    New Campaign
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Campaign</th>
                                <th className="px-4 py-3">Discount</th>
                                <th className="px-4 py-3">Applies To</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Schedule</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <Megaphone
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No campaigns found
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-gray-900">{c.name}</p>
                                            {c.description && (
                                                <p className="text-xs text-gray-400">
                                                    {c.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {formatDiscount(c)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {formatScope(c)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {c.priority ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(c.startDate).toLocaleDateString("en-GB")} –{" "}
                                            {new Date(c.endDate).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill campaign={c} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/campaigns/${c._id}/edit`)
                                                    }
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    disabled={actionId === c._id}
                                                    onClick={() => handleApply(c)}
                                                    className="flex items-center gap-1 text-green-600 hover:underline disabled:opacity-50"
                                                    title="Apply now (skips waiting for the cron job)"
                                                >
                                                    <Play size={14} />
                                                    Apply
                                                </button>
                                                <button
                                                    disabled={actionId === c._id}
                                                    onClick={() => handleRollback(c)}
                                                    className="flex items-center gap-1 text-orange-600 hover:underline disabled:opacity-50"
                                                    title="Restore affected products to their pre-campaign price"
                                                >
                                                    <RotateCcw size={14} />
                                                    Rollback
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="flex items-center gap-1 text-red-600 hover:underline"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} total campaigns</p>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this campaign?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.name}" will be permanently removed. If it's currently active, affected products are rolled back to their pre-campaign price first. This cannot be undone.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default CampaignManagement;

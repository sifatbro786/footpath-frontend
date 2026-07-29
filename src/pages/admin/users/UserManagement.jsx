// src/pages/admin/users/UserManagement.jsx
import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Search,
    RefreshCw,
    Ban,
    CheckCircle2,
    Trash2,
    Users as UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminUsersApi } from "../../../api/adminApi";
import { useAuth } from "../../../hooks/useAuth";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import AddStaffModal from "../../../components/admin/users/AddStaffModal";
import {
    ROLES,
    assignableRoles,
    roleMeta,
    statusMeta,
    initials,
} from "../../../components/admin/users/userConstants";

const fmtLastLogin = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "Never";

const UserManagement = () => {
    const { user: me } = useAuth();

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [busyId, setBusyId] = useState(null); // row-level spinner for role/status updates

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [roleFilter, debouncedSearch]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await adminUsersApi.getUsers({
                page,
                limit: 10,
                search: debouncedSearch || undefined,
                role: roleFilter !== "all" ? roleFilter : undefined,
            });
            setUsers(data.users || []);
            setTotal(data.total ?? data.count ?? 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load staff members");
        } finally {
            setLoading(false);
        }
    }, [page, roleFilter, debouncedSearch]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRoleChange = async (id, role) => {
        setBusyId(id);
        try {
            const { data } = await adminUsersApi.updateUserRole(id, role);
            setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
            toast.success("Role updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update role");
        } finally {
            setBusyId(null);
        }
    };

    const handleToggleStatus = async (u) => {
        const nextStatus = u.status === "active" ? "suspended" : "active";
        setBusyId(u._id);
        try {
            const { data } = await adminUsersApi.updateUserStatus(u._id, nextStatus);
            setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
            toast.success(nextStatus === "active" ? "Account activated" : "Account suspended");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await adminUsersApi.deleteUser(deleteTarget._id);
            toast.success("Staff member removed");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete staff member");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage your staff, assign roles, and control access permissions.
                    </p>
                </div>
                <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Add Staff Member
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="min-w-55 flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Role</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">Staff members ({total})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Staff Member</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Login</th>
                                <th className="px-4 py-3 text-right">Actions</th>
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center text-gray-400"
                                    >
                                        <UsersIcon
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />
                                        No staff members found
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isSelf = u._id === me?._id;
                                    const sMeta = statusMeta(u.status);
                                    const options = assignableRoles(me?.role);
                                    const rowBusy = busyId === u._id;

                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                                        {initials(u.name)}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {u.name}
                                                        {isSelf && (
                                                            <span className="ml-1.5 text-xs font-normal text-gray-400">
                                                                (you)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                            <td className="px-4 py-3">
                                                {isSelf ? (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleMeta(u.role).badge}`}
                                                    >
                                                        {roleMeta(u.role).label}
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={u.role}
                                                        disabled={rowBusy}
                                                        onChange={(e) =>
                                                            handleRoleChange(u._id, e.target.value)
                                                        }
                                                        className="rounded-md border border-gray-300 bg-white py-1 px-2 text-xs font-medium focus:border-gray-500 focus:outline-none disabled:opacity-50"
                                                    >
                                                        {options.some(
                                                            (o) => o.value === u.role,
                                                        ) ? null : (
                                                            <option value={u.role}>
                                                                {roleMeta(u.role).label}
                                                            </option>
                                                        )}
                                                        {options.map((r) => (
                                                            <option key={r.value} value={r.value}>
                                                                {r.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sMeta.badge}`}
                                                >
                                                    {sMeta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {fmtLastLogin(u.lastLogin)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleToggleStatus(u)}
                                                        disabled={isSelf || rowBusy}
                                                        title={
                                                            isSelf
                                                                ? "You cannot change your own status"
                                                                : u.status === "active"
                                                                  ? "Suspend account"
                                                                  : "Activate account"
                                                        }
                                                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
                                                    >
                                                        {u.status === "active" ? (
                                                            <Ban size={15} />
                                                        ) : (
                                                            <CheckCircle2 size={15} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(u)}
                                                        disabled={isSelf}
                                                        title={
                                                            isSelf
                                                                ? "You cannot delete your own account"
                                                                : "Delete"
                                                        }
                                                        className="flex items-center gap-1 text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
                                                    >
                                                        <Trash2 size={15} />
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

            <AddStaffModal
                open={addOpen}
                actingUserRole={me?.role}
                onClose={() => setAddOpen(false)}
                onCreated={() => {
                    setAddOpen(false);
                    load();
                }}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Remove this staff member?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.name}" (${deleteTarget.email}) will permanently lose access. This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default UserManagement;

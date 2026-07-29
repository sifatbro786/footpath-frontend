// src/components/admin/shipping/DistrictCard.jsx
import { useState } from "react";
import { Pencil, Trash2, Plus, X, ChevronDown, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";

import adminShippingApi from "../../../api/adminShippingApi";
import ConfirmDialog from "../common/ConfirmDialog";
import { SHIPPING_ZONES, ZONE_BADGE, ZONE_LABEL } from "./shippingConstants";

const emptyUpazila = { name: "", shippingZone: "dhaka_city" };

const DistrictCard = ({ district, onChanged, onDeleted }) => {
    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // rename
    const [renaming, setRenaming] = useState(false);
    const [nameDraft, setNameDraft] = useState(district.name);

    // upazila add/edit
    const [addingUpazila, setAddingUpazila] = useState(false);
    const [upazilaDraft, setUpazilaDraft] = useState(emptyUpazila);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState(emptyUpazila);

    const upazilas = district.upazilas || [];

    const toggleActive = async () => {
        setBusy(true);
        try {
            // Send only name + isActive; upazilas omitted (undefined) is ignored by
            // Mongoose, so this won't wipe the subdocuments.
            const { data } = await adminShippingApi.updateDistrict(district._id, {
                name: district.name,
                isActive: !district.isActive,
            });
            onChanged(data.district);
            toast.success(district.isActive ? "District deactivated" : "District activated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update district");
        } finally {
            setBusy(false);
        }
    };

    const saveRename = async () => {
        if (!nameDraft.trim()) return toast.error("Name can't be empty");
        setBusy(true);
        try {
            const { data } = await adminShippingApi.updateDistrict(district._id, {
                name: nameDraft.trim(),
            });
            onChanged(data.district);
            setRenaming(false);
            toast.success("District renamed");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to rename district");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await adminShippingApi.deleteDistrict(district._id);
            toast.success("District deleted");
            setConfirmDelete(false);
            onDeleted();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete district");
            setBusy(false);
        }
    };

    const addUpazila = async () => {
        if (!upazilaDraft.name.trim()) return toast.error("Upazila name is required");
        setBusy(true);
        try {
            const { data } = await adminShippingApi.addUpazila(district._id, {
                name: upazilaDraft.name.trim(),
                shippingZone: upazilaDraft.shippingZone,
            });
            onChanged(data.district);
            setUpazilaDraft(emptyUpazila);
            setAddingUpazila(false);
            toast.success("Upazila added");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add upazila");
        } finally {
            setBusy(false);
        }
    };

    const saveUpazilaEdit = async (upazilaId) => {
        if (!editDraft.name.trim()) return toast.error("Upazila name is required");
        setBusy(true);
        try {
            const { data } = await adminShippingApi.updateUpazila(district._id, upazilaId, {
                name: editDraft.name.trim(),
                shippingZone: editDraft.shippingZone,
            });
            onChanged(data.district);
            setEditingId(null);
            toast.success("Upazila updated");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update upazila");
        } finally {
            setBusy(false);
        }
    };

    const deleteUpazila = async (upazilaId) => {
        setBusy(true);
        try {
            const { data } = await adminShippingApi.deleteUpazila(district._id, upazilaId);
            onChanged(data.district);
            toast.success("Upazila removed");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove upazila");
        } finally {
            setBusy(false);
        }
    };

    const zoneSelectCls =
        "rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none";

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            {/* District header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                    onClick={() => setExpanded((s) => !s)}
                    className="flex min-w-0 items-center gap-3 text-left"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                        {district.name?.[0]?.toUpperCase() || "?"}
                    </span>
                    <span className="min-w-0">
                        {renaming ? (
                            <input
                                value={nameDraft}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="rounded-md border border-gray-300 py-1 px-2 text-sm"
                            />
                        ) : (
                            <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                                {district.name}
                                <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                        district.isActive ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                />
                            </span>
                        )}
                        <span className="block text-xs text-gray-400">
                            {upazilas.length} upazila{upazilas.length === 1 ? "" : "s"}
                        </span>
                    </span>
                    {expanded ? (
                        <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                    )}
                </button>

                <div className="flex items-center gap-2">
                    {renaming ? (
                        <>
                            <button
                                onClick={saveRename}
                                disabled={busy}
                                className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setRenaming(false);
                                    setNameDraft(district.name);
                                }}
                                className="text-xs text-gray-500 hover:underline"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={toggleActive}
                                disabled={busy}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    district.isActive
                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                            >
                                {district.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                                onClick={() => setRenaming(true)}
                                className="text-amber-500 hover:text-amber-600"
                                title="Rename"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="text-gray-400 hover:text-red-600"
                                title="Delete district"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Upazilas panel */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Upazilas
                        </span>
                        <button
                            onClick={() => {
                                setAddingUpazila((s) => !s);
                                setUpazilaDraft(emptyUpazila);
                            }}
                            className="flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                        >
                            <Plus size={13} />
                            Add Upazila
                        </button>
                    </div>

                    {/* Add upazila form */}
                    {addingUpazila && (
                        <div className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_200px_auto]">
                            <input
                                autoFocus
                                value={upazilaDraft.name}
                                onChange={(e) =>
                                    setUpazilaDraft((d) => ({ ...d, name: e.target.value }))
                                }
                                placeholder="Upazila name"
                                className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                            />
                            <select
                                value={upazilaDraft.shippingZone}
                                onChange={(e) =>
                                    setUpazilaDraft((d) => ({ ...d, shippingZone: e.target.value }))
                                }
                                className={zoneSelectCls}
                            >
                                {SHIPPING_ZONES.map((z) => (
                                    <option key={z.value} value={z.value}>
                                        {z.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={addUpazila}
                                    disabled={busy}
                                    className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setAddingUpazila(false)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upazila list */}
                    {upazilas.length === 0 ? (
                        <p className="py-3 text-center text-xs text-gray-400">No upazilas yet</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {upazilas.map((u) =>
                                editingId === u._id ? (
                                    <div
                                        key={u._id}
                                        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white p-2"
                                    >
                                        <input
                                            value={editDraft.name}
                                            onChange={(e) =>
                                                setEditDraft((d) => ({
                                                    ...d,
                                                    name: e.target.value,
                                                }))
                                            }
                                            className="w-32 rounded-md border border-gray-300 py-1 px-2 text-sm"
                                        />
                                        <select
                                            value={editDraft.shippingZone}
                                            onChange={(e) =>
                                                setEditDraft((d) => ({
                                                    ...d,
                                                    shippingZone: e.target.value,
                                                }))
                                            }
                                            className="rounded-md border border-gray-300 py-1 px-2 text-sm"
                                        >
                                            {SHIPPING_ZONES.map((z) => (
                                                <option key={z.value} value={z.value}>
                                                    {z.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => saveUpazilaEdit(u._id)}
                                            disabled={busy}
                                            className="text-green-600 hover:text-green-700"
                                            title="Save"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                            title="Cancel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span
                                        key={u._id}
                                        className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                            ZONE_BADGE[u.shippingZone] ||
                                            "bg-gray-100 text-gray-600"
                                        }`}
                                        title={ZONE_LABEL[u.shippingZone] || u.shippingZone}
                                    >
                                        {u.name}
                                        <button
                                            onClick={() => {
                                                setEditingId(u._id);
                                                setEditDraft({
                                                    name: u.name,
                                                    shippingZone: u.shippingZone,
                                                });
                                            }}
                                            className="opacity-60 hover:opacity-100"
                                            title="Edit"
                                        >
                                            <Pencil size={11} />
                                        </button>
                                        <button
                                            onClick={() => deleteUpazila(u._id)}
                                            className="opacity-60 hover:opacity-100"
                                            title="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ),
                            )}
                        </div>
                    )}
                </div>
            )}

            <ConfirmDialog
                open={confirmDelete}
                title="Delete this district?"
                message={`"${district.name}" and all its upazilas will be permanently removed. This cannot be undone.`}
                loading={busy}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
};

export default DistrictCard;

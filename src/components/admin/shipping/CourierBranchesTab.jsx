// src/components/admin/shipping/CourierBranchesTab.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, Building2, Power } from "lucide-react";
import toast from "react-hot-toast";

import adminShippingApi from "../../../api/adminShippingApi";
import ConfirmDialog from "../common/ConfirmDialog";

const BranchInput = ({ onAdd }) => {
    const [value, setValue] = useState("");
    const submit = () => {
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
    };
    return (
        <div className="mt-3 flex items-center gap-2">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Branch name"
                className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
            />
            <button
                onClick={submit}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
                Add
            </button>
            <button
                onClick={() => setValue("")}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
                Cancel
            </button>
        </div>
    );
};

const CourierBranchesTab = () => {
    const [configs, setConfigs] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [adding, setAdding] = useState(false);
    const [newDistrict, setNewDistrict] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [branchRes, districtRes] = await Promise.all([
                adminShippingApi.getCourierBranches(),
                adminShippingApi.getDistricts(),
            ]);
            setConfigs(branchRes.data.branches || []);
            setDistricts(districtRes.data.districts || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load courier configs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const patch = (updated) =>
        setConfigs((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

    // Only offer districts that don't already have a courier config (backend
    // rejects duplicates, and one config per district is the intended model).
    const availableDistricts = useMemo(() => {
        const taken = new Set(configs.map((c) => c.district));
        return districts.filter((d) => !taken.has(d.name));
    }, [districts, configs]);

    const handleCreate = async () => {
        if (!newDistrict) return toast.error("Pick a district");
        try {
            await adminShippingApi.createCourierBranch({ district: newDistrict, branches: [] });
            toast.success("Courier config created");
            setNewDistrict("");
            setAdding(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create config");
        }
    };

    const addBranch = async (config, branchName) => {
        setBusyId(config._id);
        try {
            const { data } = await adminShippingApi.addBranch(config._id, branchName);
            patch(data.record);
            toast.success("Branch added");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add branch");
        } finally {
            setBusyId(null);
        }
    };

    const removeBranch = async (config, branchName) => {
        setBusyId(config._id);
        try {
            const { data } = await adminShippingApi.removeBranch(config._id, branchName);
            patch(data.record);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove branch");
        } finally {
            setBusyId(null);
        }
    };

    const toggleActive = async (config) => {
        setBusyId(config._id);
        try {
            const { data } = await adminShippingApi.updateCourierBranch(config._id, {
                district: config.district,
                branches: config.branches,
                isActive: !config.isActive,
            });
            patch(data.record);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update config");
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async () => {
        const config = confirmDelete;
        setBusyId(config._id);
        try {
            await adminShippingApi.deleteCourierBranch(config._id);
            toast.success("Courier config deleted");
            setConfirmDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete config");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Courier Branches</h2>
                    <p className="text-xs text-gray-500">
                        {configs.length} district{configs.length === 1 ? "" : "s"} with courier
                        service
                    </p>
                </div>
                <button
                    onClick={() => setAdding((s) => !s)}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Add Config
                </button>
            </div>

            {adding && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-4">
                    <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                        <option value="">Select a district…</option>
                        {availableDistricts.map((d) => (
                            <option key={d._id} value={d.name}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleCreate}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        Create
                    </button>
                    <button
                        onClick={() => {
                            setAdding(false);
                            setNewDistrict("");
                        }}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    {availableDistricts.length === 0 && (
                        <p className="w-full text-xs text-amber-600">
                            Every district already has a courier config.
                        </p>
                    )}
                </div>
            )}

            {loading ? (
                <div className="py-16 text-center text-gray-400">Loading…</div>
            ) : configs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 py-14 text-center text-gray-400">
                    <Building2 size={26} className="mx-auto mb-2 text-gray-300" />
                    No courier configs yet
                </div>
            ) : (
                <div className="space-y-3">
                    {configs.map((config) => (
                        <div
                            key={config._id}
                            className="rounded-lg border border-gray-200 bg-white p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="flex items-center gap-1.5 font-semibold text-gray-900">
                                        {config.district}
                                        <span
                                            className={`inline-block h-2 w-2 rounded-full ${
                                                config.isActive ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        />
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {config.branches?.length || 0} branch
                                        {config.branches?.length === 1 ? "" : "es"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleActive(config)}
                                        disabled={busyId === config._id}
                                        className={`${
                                            config.isActive
                                                ? "text-green-600"
                                                : "text-gray-400 hover:text-green-600"
                                        }`}
                                        title={config.isActive ? "Deactivate" : "Activate"}
                                    >
                                        <Power size={16} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(config)}
                                        className="text-gray-400 hover:text-red-600"
                                        title="Delete config"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Branch chips */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(config.branches || []).map((b) => (
                                    <span
                                        key={b}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700"
                                    >
                                        {b}
                                        <button
                                            onClick={() => removeBranch(config, b)}
                                            disabled={busyId === config._id}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                {(config.branches || []).length === 0 && (
                                    <span className="text-xs text-gray-400">No branches yet</span>
                                )}
                            </div>

                            <BranchInput onAdd={(name) => addBranch(config, name)} />
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={Boolean(confirmDelete)}
                title="Delete courier config?"
                message={
                    confirmDelete
                        ? `Courier service config for "${confirmDelete.district}" will be removed.`
                        : ""
                }
                loading={Boolean(busyId)}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default CourierBranchesTab;

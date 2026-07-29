// src/components/admin/shipping/DistrictsTab.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, MapPin } from "lucide-react";
import toast from "react-hot-toast";

import adminShippingApi from "../../../api/adminShippingApi";
import { SHIPPING_ZONES, ZONE_BADGE } from "./shippingConstants";
import DistrictCard from "./DistrictCard";

const DistrictsTab = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await adminShippingApi.getDistricts();
            setDistricts(data.districts || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load districts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Keep a single district in sync after an upazila mutation without a full reload.
    const patchDistrict = (updated) =>
        setDistricts((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));

    const handleCreate = async () => {
        if (!newName.trim()) return toast.error("District name is required");
        setCreating(true);
        try {
            await adminShippingApi.createDistrict({ name: newName.trim() });
            toast.success("District created");
            setNewName("");
            setAdding(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create district");
        } finally {
            setCreating(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return districts;
        return districts.filter((d) => d.name.toLowerCase().includes(q));
    }, [districts, search]);

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Districts &amp; Upazilas</h2>
                    <p className="text-xs text-gray-500">
                        {districts.length} district{districts.length === 1 ? "" : "s"} configured
                    </p>
                </div>
                <button
                    onClick={() => setAdding((s) => !s)}
                    className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    <Plus size={16} />
                    Add District
                </button>
            </div>

            {/* Zone legend */}
            <div className="flex flex-wrap gap-2">
                {SHIPPING_ZONES.map((z) => (
                    <span
                        key={z.value}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ZONE_BADGE[z.value]}`}
                    >
                        {z.label}
                    </span>
                ))}
            </div>

            {/* Add district inline form */}
            {adding && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4">
                    <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="District name (e.g. Dhaka)"
                        className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        {creating ? "Saving…" : "Save"}
                    </button>
                    <button
                        onClick={() => {
                            setAdding(false);
                            setNewName("");
                        }}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search districts..."
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="py-16 text-center text-gray-400">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 py-14 text-center text-gray-400">
                    <MapPin size={26} className="mx-auto mb-2 text-gray-300" />
                    {search ? "No districts match your search" : "No districts configured yet"}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((district) => (
                        <DistrictCard
                            key={district._id}
                            district={district}
                            onChanged={patchDistrict}
                            onDeleted={load}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DistrictsTab;

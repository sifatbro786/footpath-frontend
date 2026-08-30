import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Monitor, Smartphone, Video, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

import { heroApi } from "../../../api/heroApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";

/**
 * /admin/hero-content
 *
 * ⚠️ READ THIS BEFORE EXTENDING THE FORM.
 *
 * HeroContent is a SECOND, separate model from HeroItem, and its public
 * endpoint throws almost all of it away. getActiveHeroContent maps every
 * document down to `item.mediaUrl` and returns four bare URL arrays grouped by
 * device and media type:
 *
 *   { desktopVideos, desktopImages, mobileVideos, mobileImages }
 *
 * So although the model stores title, subtitle, buttonText and buttonLink, the
 * storefront never receives any of them. On the shop these records are
 * background imagery only, used by the promo banner.
 *
 * This page therefore edits what actually has an effect: device, media type and
 * URL. Offering a headline field here would let an admin write copy that is
 * silently discarded, which is worse than not offering it. To make the copy
 * fields real, getActiveHeroContent must return documents instead of mapping to
 * mediaUrl, and that is a backend change.
 *
 * For headlines and buttons, use Hero slides instead.
 */

const EMPTY = {
    title: "Background media",
    subtitle: "Shown on the storefront",
    mediaType: "image",
    mediaUrl: "",
    deviceType: "desktop",
    order: 0,
    isActive: true,
};

const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

export default function HeroContentManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState(EMPTY);
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await heroApi.listContent();
            // getAllHeroContent responds with a bare array, not { success, data }.
            setItems(Array.isArray(data) ? data : (data?.data ?? []));
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load hero content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const submit = async (e) => {
        e.preventDefault();
        if (!values.mediaUrl.trim()) {
            toast.error("A media URL is required.");
            return;
        }

        setSaving(true);
        try {
            await heroApi.createContent({ ...values, mediaUrl: values.mediaUrl.trim() });
            toast.success("Media added");
            setValues(EMPTY);
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save that media");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await heroApi.deleteContent(deleteTarget._id);
            toast.success("Media removed");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not remove that media");
        } finally {
            setDeleting(false);
        }
    };

    const set = (patch) => setValues((prev) => ({ ...prev, ...patch }));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Hero content</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Background imagery for the storefront promo banner.
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
                        onClick={() => setShowForm((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <Plus size={14} />
                        Add media
                    </button>
                </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Only the media URL, device and type reach the storefront. Headlines and buttons on
                this model are dropped by the public API, so use{" "}
                <span className="font-semibold">Hero slides</span> for anything with copy.
            </div>

            {showForm && (
                <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label htmlFor="hc-device" className="block text-sm font-medium text-gray-700">
                                Device
                            </label>
                            <select
                                id="hc-device"
                                className={`mt-1.5 ${field}`}
                                value={values.deviceType}
                                onChange={(e) => set({ deviceType: e.target.value })}
                            >
                                {/* HeroContent.deviceType has no "both" option,
                                    unlike HeroItem. Add one record per device. */}
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="hc-type" className="block text-sm font-medium text-gray-700">
                                Media type
                            </label>
                            <select
                                id="hc-type"
                                className={`mt-1.5 ${field}`}
                                value={values.mediaType}
                                onChange={(e) => set({ mediaType: e.target.value })}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="hc-order" className="block text-sm font-medium text-gray-700">
                                Order
                            </label>
                            <input
                                id="hc-order"
                                type="number"
                                min="0"
                                className={`mt-1.5 ${field}`}
                                value={values.order}
                                onChange={(e) => set({ order: Number(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="hc-url" className="block text-sm font-medium text-gray-700">
                            Media URL
                        </label>
                        <input
                            id="hc-url"
                            className={`mt-1.5 ${field}`}
                            value={values.mediaUrl}
                            onChange={(e) => set({ mediaUrl: e.target.value })}
                            placeholder="https://res.cloudinary.com/..."
                        />
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? "Saving" : "Add media"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
                    <p className="text-base font-semibold text-gray-900">No hero content yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        The promo banner falls back to its built-in imagery until you add some.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        const DeviceIcon = item.deviceType === "mobile" ? Smartphone : Monitor;
                        const MediaIcon = item.mediaType === "video" ? Video : ImageIcon;

                        return (
                            <div
                                key={item._id}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                            >
                                <div className="h-32 bg-gray-50">
                                    {item.mediaType === "image" ? (
                                        <img
                                            src={item.mediaUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center text-gray-400">
                                            <Video size={22} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <DeviceIcon size={12} />
                                            {item.deviceType}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <MediaIcon size={12} />
                                            {item.mediaType}
                                        </span>
                                        {!item.isActive && (
                                            <span className="text-amber-600">Hidden</span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(item)}
                                        aria-label="Remove media"
                                        className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Remove this media?"
                message="It will no longer appear on the storefront."
                confirmLabel="Remove"
                loading={deleting}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, ArrowUp, ArrowDown, Monitor, Smartphone, Image as ImageIcon, Video } from "lucide-react";
import toast from "react-hot-toast";

import { heroApi } from "../../../api/heroApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import HeroItemFormModal from "../../../components/admin/hero/HeroItemFormModal";

/**
 * /admin/hero-items
 *
 * Reordering is done with up and down buttons rather than drag and drop.
 * Deliberate: the reorder endpoint takes the whole list as { id, order } pairs
 * and a hero carousel is typically three to six slides, so a pointer-precise
 * drag interaction (which also needs a keyboard equivalent to be accessible)
 * would be a lot of machinery for moving one row one place. The buttons are
 * accessible for free and unambiguous on touch.
 *
 * The list writes optimistically and reconciles: order feels instant, and a
 * failed save reloads the truth from the server.
 */

const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, both: null };

export default function HeroSlidesManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await heroApi.listItems();
            setItems(data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load hero slides");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const persistOrder = async (next) => {
        // Renumber from zero so the stored order never drifts into gaps.
        const payload = next.map((item, index) => ({ id: item._id, order: index }));
        try {
            await heroApi.reorderItems(payload);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the new order");
            load();
        }
    };

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        setItems(next);
        persistOrder(next);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (editing) {
                await heroApi.updateItem(editing._id, values);
                toast.success("Slide updated");
            } else {
                // New slides go to the end of the carousel.
                await heroApi.createItem({ ...values, order: items.length });
                toast.success("Slide created");
            }
            setModalOpen(false);
            setEditing(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the slide");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await heroApi.deleteItem(deleteTarget._id);
            toast.success("Slide deleted");
            setDeleteTarget(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not delete the slide");
        } finally {
            setDeleting(false);
        }
    };

    const toggleActive = async (item) => {
        // Optimistic: the switch should not lag behind the click.
        setItems((prev) =>
            prev.map((i) => (i._id === item._id ? { ...i, isActive: !i.isActive } : i)),
        );
        try {
            await heroApi.updateItem(item._id, { ...item, isActive: !item.isActive });
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update the slide");
            load();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Hero slides</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        The carousel at the top of the homepage. Order here is the order shoppers
                        see.
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
                        onClick={() => {
                            setEditing(null);
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <Plus size={14} />
                        New slide
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
                    <p className="text-base font-semibold text-gray-900">No slides yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        The homepage hero stays hidden until at least one slide is active.
                    </p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((item, index) => {
                        const DeviceIcon = DEVICE_ICON[item.deviceType];
                        const MediaIcon = item.mediaType === "video" ? Video : ImageIcon;

                        return (
                            <li
                                key={item._id}
                                className={`flex gap-4 rounded-lg border bg-white p-4 ${
                                    item.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
                                }`}
                            >
                                <div className="flex flex-col justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        aria-label="Move up"
                                        className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        <ArrowUp size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, 1)}
                                        disabled={index === items.length - 1}
                                        aria-label="Move down"
                                        className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                    >
                                        <ArrowDown size={13} />
                                    </button>
                                </div>

                                <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                                    {item.mediaType === "image" ? (
                                        <img
                                            src={item.mediaUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-gray-400">
                                            <Video size={18} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {item.title}
                                    </p>
                                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                                        {item.subtitle}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MediaIcon size={12} />
                                            {item.mediaType}
                                        </span>
                                        {DeviceIcon && (
                                            <span className="inline-flex items-center gap-1">
                                                <DeviceIcon size={12} />
                                                {item.deviceType}
                                            </span>
                                        )}
                                        {item.mediaType === "image" && (
                                            <span>{item.duration}s</span>
                                        )}
                                        <span className="tabular-nums">Position {index + 1}</span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive}
                                            onChange={() => toggleActive(item)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        Live
                                    </label>

                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(item);
                                                setModalOpen(true);
                                            }}
                                            aria-label="Edit slide"
                                            className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(item)}
                                            aria-label="Delete slide"
                                            className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <HeroItemFormModal
                open={modalOpen}
                initial={editing}
                saving={saving}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete this slide?"
                message={`"${deleteTarget?.title}" will be removed from the homepage carousel.`}
                confirmLabel="Delete"
                loading={deleting}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

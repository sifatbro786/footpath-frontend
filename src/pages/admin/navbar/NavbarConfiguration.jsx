// src/pages/admin/navbar/NavbarConfiguration.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import navbarApi from "../../../api/navbarApi";
import { uploadApi } from "../../../api/uploadApi";
import NavItemEditor from "../../../components/admin/navbar/NavItemEditor";
import {
    ICON_SETTINGS,
    emptyDraft,
    resolveTarget,
    toLocalItem,
    toPayloadItem,
    typeLabel,
    validateItem,
} from "../../../components/admin/navbar/navbarConstants";

const Panel = ({ title, subtitle, children, className = "" }) => (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
        <div className="border-b border-gray-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// Pure-CSS drag handle so we don't depend on an icon that may not exist in this
// lucide build.
const DragHandle = (props) => (
    <span
        {...props}
        title="Drag to reorder"
        className="grid cursor-grab grid-cols-2 gap-0.5 p-1 text-gray-300 active:cursor-grabbing"
    >
        {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-current" />
        ))}
    </span>
);

const Toggle = ({ on, onClick, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onClick}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
            on ? "bg-gray-900" : "bg-gray-300"
        }`}
    >
        <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                on ? "left-4.5" : "left-0.5"
            }`}
        />
    </button>
);

const NavbarConfiguration = () => {
    const [config, setConfig] = useState({
        logo: { url: "", public_id: "" },
        logoUrl: "/",
        cartIcon: true,
        searchIcon: true,
        userIcon: true,
        wishlistIcon: true,
    });
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [draft, setDraft] = useState(emptyDraft());
    const [editingKey, setEditingKey] = useState(null);
    const [editDraft, setEditDraft] = useState(null);
    const [dragKey, setDragKey] = useState(null);

    const logoInputRef = useRef(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [cfgRes, catRes] = await Promise.all([
                navbarApi.getConfig(),
                navbarApi.getCategories(),
            ]);
            const data = cfgRes.data.data || {};
            setConfig({
                logo: data.logo || { url: "", public_id: "" },
                logoUrl: data.logoUrl || "/",
                cartIcon: data.cartIcon ?? true,
                searchIcon: data.searchIcon ?? true,
                userIcon: data.userIcon ?? true,
                wishlistIcon: data.wishlistIcon ?? true,
            });
            setItems((data.items || []).map(toLocalItem));
            setCategories(catRes.data.data || []);
            setDirty(false);
            setEditingKey(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load navbar config");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const markDirty = () => setDirty(true);
    const patchConfig = (patch) => {
        setConfig((c) => ({ ...c, ...patch }));
        markDirty();
    };

    /* --------------------------------- logo -------------------------------- */
    const onLogoFile = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
        setUploadingLogo(true);
        try {
            const { data } = await uploadApi.uploadSingle(file);
            const url = data.imageUrl || data.file?.url;
            patchConfig({ logo: { url, public_id: data.filename || "" } });
            toast.success("Logo uploaded");
        } catch (err) {
            toast.error(err.response?.data?.message || "Logo upload failed");
        } finally {
            setUploadingLogo(false);
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
    };

    /* --------------------------------- items ------------------------------- */
    const addItem = () => {
        const err = validateItem(draft);
        if (err) return toast.error(err);
        setItems((prev) => [...prev, { ...draft }]);
        setDraft(emptyDraft());
        markDirty();
    };

    const removeItem = (key) => {
        setItems((prev) => prev.filter((i) => i._key !== key));
        if (editingKey === key) setEditingKey(null);
        markDirty();
    };

    const toggleItem = (key) => {
        setItems((prev) => prev.map((i) => (i._key === key ? { ...i, isActive: !i.isActive } : i)));
        markDirty();
    };

    const startEdit = (item) => {
        setEditingKey(item._key);
        setEditDraft({ ...item });
    };
    const cancelEdit = () => {
        setEditingKey(null);
        setEditDraft(null);
    };
    const commitEdit = () => {
        const err = validateItem(editDraft);
        if (err) return toast.error(err);
        setItems((prev) => prev.map((i) => (i._key === editDraft._key ? { ...editDraft } : i)));
        setEditingKey(null);
        setEditDraft(null);
        markDirty();
    };

    /* --------------------------------- DnD --------------------------------- */
    const onDragEnter = (targetKey) => {
        if (!dragKey || dragKey === targetKey) return;
        setItems((prev) => {
            const from = prev.findIndex((i) => i._key === dragKey);
            const to = prev.findIndex((i) => i._key === targetKey);
            if (from === -1 || to === -1) return prev;
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
        markDirty();
    };

    /* --------------------------------- save -------------------------------- */
    const save = async () => {
        for (const it of items) {
            const err = validateItem(it);
            if (err) return toast.error(err);
        }
        setSaving(true);
        try {
            const payload = {
                logo: config.logo,
                logoUrl: config.logoUrl,
                cartIcon: config.cartIcon,
                searchIcon: config.searchIcon,
                userIcon: config.userIcon,
                wishlistIcon: config.wishlistIcon,
                items: items.map((it, i) => toPayloadItem(it, i)),
            };
            await navbarApi.updateConfig(payload);
            toast.success("Navbar saved");
            await load(); // re-sync with the canonical server copy (paths, ids)
        } catch (err) {
            const apiErrs = err.response?.data?.errors;
            toast.error(
                (Array.isArray(apiErrs) && apiErrs.join(", ")) ||
                    err.response?.data?.message ||
                    "Failed to save navbar",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5 pb-10">
                <div className="h-8 w-56 animate-pulse rounded bg-gray-100" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
                ))}
            </div>
        );
    }

    const activeItems = items.filter((i) => i.isActive);

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Navbar</h1>
                    <p className="text-sm text-gray-500">Manage your storefront navigation menu</p>
                </div>
                <div className="flex items-center gap-2">
                    {dirty && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Unsaved changes
                        </span>
                    )}
                    <button
                        onClick={save}
                        disabled={saving || !dirty}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>

            {/* Logo */}
            <Panel title="Logo" subtitle="The image and where clicking it takes visitors">
                <div className="flex flex-wrap items-start gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        {config.logo?.url ? (
                            <img
                                src={config.logo.url}
                                alt="Logo"
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <span className="text-xs text-gray-300">No logo</span>
                        )}
                    </div>
                    <div className="min-w-56 flex-1 space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Logo image
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => onLogoFile(e.target.files?.[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {uploadingLogo ? "Uploading…" : "Choose image"}
                                </button>
                                {config.logo?.url && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            patchConfig({ logo: { url: "", public_id: "" } })
                                        }
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP · up to 5MB</p>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Logo link
                            </label>
                            <input
                                value={config.logoUrl}
                                onChange={(e) => patchConfig({ logoUrl: e.target.value })}
                                placeholder="/"
                                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Where clicking the logo takes visitors — usually the home page (/).
                            </p>
                        </div>
                    </div>
                </div>
            </Panel>

            {/* Navigation items */}
            <Panel
                title="Navigation items"
                subtitle="Drag to reorder · toggle to show or hide · order here is the storefront order"
            >
                {/* Add form */}
                <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-medium text-gray-800">Add item</p>
                    <NavItemEditor draft={draft} onChange={setDraft} categories={categories} />
                    <button
                        onClick={addItem}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        <Plus size={14} /> Add item
                    </button>
                </div>

                {/* List */}
                <div className="mt-4 space-y-2">
                    {items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            No items yet — add your first navigation item above.
                        </p>
                    ) : (
                        items.map((item) => {
                            const isEditing = editingKey === item._key;
                            return (
                                <div
                                    key={item._key}
                                    draggable={!isEditing}
                                    onDragStart={() => setDragKey(item._key)}
                                    onDragEnter={() => onDragEnter(item._key)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={() => setDragKey(null)}
                                    className={`rounded-md border bg-white transition ${
                                        dragKey === item._key
                                            ? "border-gray-400 opacity-60"
                                            : "border-gray-200"
                                    }`}
                                >
                                    {isEditing ? (
                                        <div className="space-y-3 p-4">
                                            <NavItemEditor
                                                draft={editDraft}
                                                onChange={setEditDraft}
                                                categories={categories}
                                                compact
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={cancelEdit}
                                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={commitEdit}
                                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 px-3 py-2.5">
                                            <DragHandle />
                                            <Toggle
                                                on={item.isActive}
                                                onClick={() => toggleItem(item._key)}
                                                label={`Toggle ${item.name}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`truncate text-sm font-medium ${
                                                        item.isActive
                                                            ? "text-gray-900"
                                                            : "text-gray-400 line-through"
                                                    }`}
                                                >
                                                    {item.name}
                                                </p>
                                                <p className="truncate text-xs text-gray-400">
                                                    {typeLabel(item.type)} ·{" "}
                                                    {resolveTarget(item, categories)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => removeItem(item._key)}
                                                title="Delete"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Panel>

            {/* Icon settings */}
            <Panel title="Header icons" subtitle="Choose which action icons appear in the header">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ICON_SETTINGS.map((ic) => (
                        <label
                            key={ic.key}
                            className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2.5"
                        >
                            <span className="text-sm text-gray-700">{ic.label}</span>
                            <Toggle
                                on={config[ic.key]}
                                onClick={() => patchConfig({ [ic.key]: !config[ic.key] })}
                                label={ic.label}
                            />
                        </label>
                    ))}
                </div>
            </Panel>

            {/* Preview */}
            <Panel title="Preview" subtitle="How the menu will read on the storefront">
                <div className="flex flex-wrap items-center gap-4 rounded-md bg-gray-50 px-4 py-3">
                    {config.logo?.url ? (
                        <img src={config.logo.url} alt="" className="h-7 object-contain" />
                    ) : (
                        <span className="text-sm font-semibold text-gray-700">Your Store</span>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                        {activeItems.length === 0 ? (
                            <span className="text-xs text-gray-400">No active items</span>
                        ) : (
                            activeItems.map((i) => (
                                <span
                                    key={i._key}
                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                    {i.name}
                                </span>
                            ))
                        )}
                    </div>
                    <div className="ml-auto flex gap-1.5">
                        {ICON_SETTINGS.filter((ic) => config[ic.key]).map((ic) => (
                            <span
                                key={ic.key}
                                className="rounded bg-gray-200 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-500"
                            >
                                {ic.label.split(" ")[0]}
                            </span>
                        ))}
                    </div>
                </div>
            </Panel>
        </div>
    );
};

export default NavbarConfiguration;

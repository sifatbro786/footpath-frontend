// src/components/admin/navbar/NavItemEditor.jsx
import { ITEM_TYPES } from "./navbarConstants";

// Controlled field group shared by the "Add item" form and inline row editing.
// `draft` is the local item shape; `onChange` receives the next draft.
const NavItemEditor = ({ draft, onChange, categories = [], compact = false }) => {
    const set = (patch) => onChange({ ...draft, ...patch });

    // Switching type clears the fields that no longer apply, so a leftover value
    // from another type never leaks into the payload.
    const onTypeChange = (type) => set({ type, category: "", customUrl: "", path: "" });

    const inputCls =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";

    return (
        <div className={compact ? "space-y-3" : "space-y-4"}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                        Item name
                    </label>
                    <input
                        value={draft.name}
                        onChange={(e) => set({ name: e.target.value })}
                        maxLength={50}
                        placeholder="e.g. Collections"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Type</label>
                    <select
                        value={draft.type}
                        onChange={(e) => onTypeChange(e.target.value)}
                        className={`${inputCls} bg-white`}
                    >
                        {ITEM_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Type-specific target field */}
            {draft.type === "category" ? (
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
                    <select
                        value={draft.category?._id || draft.category || ""}
                        onChange={(e) => set({ category: e.target.value })}
                        className={`${inputCls} bg-white`}
                    >
                        <option value="">Select a category…</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                                {"\u00A0".repeat((c.level || 0) * 2)}
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : draft.type === "custom" ? (
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                        Custom URL
                    </label>
                    <input
                        value={draft.customUrl}
                        onChange={(e) => set({ customUrl: e.target.value })}
                        placeholder="https://example.com or /any-path"
                        className={inputCls}
                    />
                </div>
            ) : (
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">URL path</label>
                    <input
                        value={draft.path}
                        onChange={(e) => set({ path: e.target.value })}
                        placeholder="/about, /best-deal"
                        className={inputCls}
                    />
                </div>
            )}
        </div>
    );
};

export default NavItemEditor;

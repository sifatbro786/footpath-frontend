import { useEffect, useState } from "react";
import { X, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";

import { aplusApi } from "../../../api/aplusApi";

/**
 * A+ content block builder.
 *
 * Six section types, each editing a different field on the same subdocument
 * (models/AplusContent.js):
 *   text | features    content, an HTML string
 *   imageGallery       images [{ url, alt, caption }]
 *   video              videos [{ url, title, thumbnail }]
 *   specifications     specifications [{ key, value }]
 *   comparison         comparisonData [{ feature, ourProduct, competitor }]
 *
 * `content` is raw HTML rendered into the storefront. It is sanitised with
 * DOMPurify at render time (see components/store/product/AplusContent.jsx),
 * which is what makes a plain textarea acceptable here rather than requiring a
 * locked-down rich text editor. The warning under the field says so, because an
 * admin pasting from Word should know what happens to it.
 *
 * `order` is written from array position on save, so moving a block is all the
 * reordering there is.
 */

const SECTION_TYPES = [
    { value: "text", label: "Text" },
    { value: "features", label: "Features" },
    { value: "imageGallery", label: "Image gallery" },
    { value: "video", label: "Video" },
    { value: "specifications", label: "Specifications" },
    { value: "comparison", label: "Comparison" },
];

const newSection = (type) => ({
    type,
    title: "",
    content: "",
    images: [],
    videos: [],
    specifications: [],
    comparisonData: [],
});

const field =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

/** Editor for one section's type-specific body. */
function SectionBody({ section, onChange }) {
    const setRows = (key, rows) => onChange({ [key]: rows });

    const RepeatableRows = ({ storeKey, columns, addLabel }) => (
        <div className="space-y-2">
            {(section[storeKey] ?? []).map((row, i) => (
                <div key={i} className="flex gap-2">
                    {columns.map((column) => (
                        <input
                            key={column.key}
                            className={field}
                            value={row[column.key] ?? ""}
                            placeholder={column.placeholder}
                            onChange={(e) => {
                                const next = [...section[storeKey]];
                                next[i] = { ...next[i], [column.key]: e.target.value };
                                setRows(storeKey, next);
                            }}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            setRows(
                                storeKey,
                                section[storeKey].filter((_, index) => index !== i),
                            )
                        }
                        aria-label="Remove row"
                        className="shrink-0 rounded border border-gray-200 px-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() =>
                    setRows(storeKey, [
                        ...(section[storeKey] ?? []),
                        Object.fromEntries(columns.map((c) => [c.key, ""])),
                    ])
                }
                className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
            >
                {addLabel}
            </button>
        </div>
    );

    switch (section.type) {
        case "imageGallery":
            return (
                <RepeatableRows
                    storeKey="images"
                    addLabel="Add an image"
                    columns={[
                        { key: "url", placeholder: "Image URL" },
                        { key: "alt", placeholder: "Alt text" },
                        { key: "caption", placeholder: "Caption" },
                    ]}
                />
            );

        case "video":
            return (
                <RepeatableRows
                    storeKey="videos"
                    addLabel="Add a video"
                    columns={[
                        { key: "url", placeholder: "Video URL" },
                        { key: "title", placeholder: "Title" },
                        { key: "thumbnail", placeholder: "Poster image URL" },
                    ]}
                />
            );

        case "specifications":
            return (
                <RepeatableRows
                    storeKey="specifications"
                    addLabel="Add a specification"
                    columns={[
                        { key: "key", placeholder: "Label" },
                        { key: "value", placeholder: "Value" },
                    ]}
                />
            );

        case "comparison":
            return (
                <RepeatableRows
                    storeKey="comparisonData"
                    addLabel="Add a comparison row"
                    columns={[
                        { key: "feature", placeholder: "Feature" },
                        { key: "ourProduct", placeholder: "This product" },
                        { key: "competitor", placeholder: "Others" },
                    ]}
                />
            );

        default:
            return (
                <div>
                    <textarea
                        rows={5}
                        className={field}
                        value={section.content ?? ""}
                        onChange={(e) => onChange({ content: e.target.value })}
                        placeholder="<p>Basic HTML is allowed.</p>"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        HTML is allowed. Scripts, event handlers and unsafe links are stripped
                        before this reaches a shopper.
                    </p>
                </div>
            );
    }
}

export default function AplusEditorModal({ target, onClose, onSaved }) {
    const [title, setTitle] = useState("");
    const [sections, setSections] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Seed from whatever already exists for this product. A 404 simply means
    // there is none yet, which is the normal case for a new attachment.
    useEffect(() => {
        if (!target?.productId) return;

        let cancelled = false;
        setLoading(true);
        setTitle("");
        setSections([]);
        setIsActive(true);

        aplusApi
            .getByProductId(target.productId)
            .then(({ data }) => {
                if (cancelled) return;
                // ⚠️ This endpoint returns { success, aplusContent }, NOT the
                // { success, data } envelope most of the API uses. Reading
                // `data.data` here silently yielded undefined, so the editor
                // opened blank even for a product that already had content, and
                // saving then wiped it.
                const existing = data?.aplusContent ?? data?.data;
                if (!existing) return;
                setTitle(existing.title ?? "");
                setSections(
                    [...(existing.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
                );
                setIsActive(existing.isActive ?? true);
            })
            .catch(() => {
                /* no content yet */
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [target?.productId]);

    useEffect(() => {
        if (!target) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [target, onClose]);

    if (!target) return null;

    const updateSection = (index, patch) =>
        setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

    const moveSection = (index, direction) => {
        const to = index + direction;
        if (to < 0 || to >= sections.length) return;
        const next = [...sections];
        [next[index], next[to]] = [next[to], next[index]];
        setSections(next);
    };

    const save = async () => {
        setSaving(true);
        try {
            await aplusApi.save({
                productId: target.productId,
                title: title.trim() || `A+ Content for ${target.productName}`,
                // Order is written from position, so the array IS the order.
                sections: sections.map((section, index) => ({ ...section, order: index })),
                isActive,
            });
            toast.success("A+ content saved");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the content");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="aplus-editor-title"
                className="relative my-8 w-full max-w-3xl rounded-lg border border-gray-200 bg-white"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <div className="min-w-0">
                        <h2
                            id="aplus-editor-title"
                            className="truncate text-base font-semibold text-gray-900"
                        >
                            A+ content
                        </h2>
                        <p className="truncate text-sm text-gray-500">{target.productName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
                    {loading ? (
                        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
                    ) : (
                        <>
                            <div>
                                <label
                                    htmlFor="aplus-title"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Section heading
                                </label>
                                <input
                                    id="aplus-title"
                                    className={`mt-1.5 ${field}`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Why you will like it"
                                />
                            </div>

                            {sections.map((section, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <select
                                            value={section.type}
                                            onChange={(e) =>
                                                updateSection(index, {
                                                    ...newSection(e.target.value),
                                                    title: section.title,
                                                })
                                            }
                                            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
                                        >
                                            {SECTION_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            className={`${field} flex-1`}
                                            value={section.title ?? ""}
                                            onChange={(e) =>
                                                updateSection(index, { title: e.target.value })
                                            }
                                            placeholder="Block heading (optional)"
                                        />

                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, -1)}
                                                disabled={index === 0}
                                                aria-label="Move block up"
                                                className="rounded border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                            >
                                                <ArrowUp size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, 1)}
                                                disabled={index === sections.length - 1}
                                                aria-label="Move block down"
                                                className="rounded border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                            >
                                                <ArrowDown size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSections((prev) =>
                                                        prev.filter((_, i) => i !== index),
                                                    )
                                                }
                                                aria-label="Remove block"
                                                className="rounded border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <SectionBody
                                            section={section}
                                            onChange={(patch) => updateSection(index, patch)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => setSections((prev) => [...prev, newSection("text")])}
                                className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900"
                            >
                                <Plus size={14} />
                                Add a block
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Show on the product page
                    </label>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={save}
                            disabled={saving || loading}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? "Saving" : "Save content"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

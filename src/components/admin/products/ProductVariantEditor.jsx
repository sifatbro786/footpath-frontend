// src/components/admin/products/ProductVariantEditor.jsx
import { useMemo, useState } from "react";
import { Plus, Trash2, Wand2, Eye, X, AlertTriangle } from "lucide-react";
import { variantFinalPrice, formatPrice } from "./productPricing";

/* ----------------------------- helpers ----------------------------------- */
const norm = (s) => (s ?? "").toString().trim();
const isColorOption = (name) => norm(name).toLowerCase() === "color";

const comboKey = (options) =>
    [...options]
        .map((o) => `${o.name}=${o.value}`)
        .sort()
        .join("|");

// const sameCombo = (a, b) => comboKey(a) === comboKey(b);

const cartesian = (opts) =>
    opts.reduce(
        (acc, o) =>
            acc.flatMap((combo) => o.values.map((v) => [...combo, { name: o.name, value: v }])),
        [[]],
    );

const blankVariant = (options, order) => ({
    options,
    basePrice: "",
    discountType: "none",
    discountValue: 0,
    stock: 0,
    sku: "",
    imageGroupName: "",
    order,
});

/* ========================================================================= */
const ProductVariantEditor = ({
    variantOptions,
    variants,
    imageGroupNames = [],
    productBasePrice,
    productDiscountType,
    productDiscountValue,
    currency = "USD",
    onOptionsChange,
    onVariantsChange,
}) => {
    const [preserve, setPreserve] = useState(true);
    const [addMissing, setAddMissing] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    /* --------------------------- options CRUD ---------------------------- */
    const addOption = () => onOptionsChange([...variantOptions, { name: "", values: [""] }]);

    const setOptionName = (i, name) =>
        onOptionsChange(
            variantOptions.map((o, idx) => {
                if (idx !== i) return o;
                // Switching to a "color" option seeds empty values with a default hex.
                const values = isColorOption(name)
                    ? o.values.map((v) => (v?.startsWith("#") ? v : v || "#000000"))
                    : o.values;
                return { ...o, name, values };
            }),
        );

    const removeOption = (i) => onOptionsChange(variantOptions.filter((_, idx) => idx !== i));

    const addValue = (oi) =>
        onOptionsChange(
            variantOptions.map((o, idx) =>
                idx === oi
                    ? { ...o, values: [...o.values, isColorOption(o.name) ? "#000000" : ""] }
                    : o,
            ),
        );

    const setValue = (oi, vi, val) =>
        onOptionsChange(
            variantOptions.map((o, idx) =>
                idx === oi ? { ...o, values: o.values.map((v, j) => (j === vi ? val : v)) } : o,
            ),
        );

    const removeValue = (oi, vi) =>
        onOptionsChange(
            variantOptions.map((o, idx) =>
                idx === oi ? { ...o, values: o.values.filter((_, j) => j !== vi) } : o,
            ),
        );

    /* ------------------------ smart update engine ------------------------ */
    const validOptions = useMemo(
        () =>
            variantOptions
                .map((o) => ({
                    name: norm(o.name),
                    values: [...new Set(o.values.map(norm).filter(Boolean))],
                }))
                .filter((o) => o.name && o.values.length > 0),
        [variantOptions],
    );

    const preview = useMemo(() => {
        if (!validOptions.length) return { next: [], added: 0, removed: 0, kept: 0 };
        const targets = cartesian(validOptions);
        const existingByKey = new Map(variants.map((v) => [comboKey(v.options), v]));
        let kept = 0;
        let added = 0;

        const next = targets.map((options, index) => {
            const key = comboKey(options);
            let match = existingByKey.get(key);
            // "Add missing options to existing variants": carry data from a variant
            // that matches on the options it already had (ignoring the new option).
            if (!match && addMissing) {
                match = variants.find((v) =>
                    v.options.every((o) =>
                        options.some((t) => t.name === o.name && t.value === o.value),
                    ),
                );
            }
            if (match && preserve) {
                kept += 1;
                return { ...match, options, order: index };
            }
            added += 1;
            return blankVariant(options, index);
        });

        const targetKeys = new Set(targets.map(comboKey));
        const removed = variants.filter((v) => !targetKeys.has(comboKey(v.options))).length;
        return { next, added, removed, kept };
    }, [validOptions, variants, preserve, addMissing]);

    // "New variant options detected" — options no longer match the current variant set.
    const optionsChanged = validOptions.length > 0 && (preview.added > 0 || preview.removed > 0);

    const applySmartUpdate = () => {
        if (!validOptions.length) return;
        onVariantsChange(preview.next);
        setShowPreview(false);
    };

    /* --------------------------- manual editing -------------------------- */
    const addManualVariant = () => {
        if (!validOptions.length) return;
        const options = validOptions.map((o) => ({ name: o.name, value: o.values[0] }));
        onVariantsChange([...variants, blankVariant(options, variants.length)]);
    };

    const setVariantField = (i, field, val) =>
        onVariantsChange(variants.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));

    const setVariantOptionValue = (vi, optionName, value) =>
        onVariantsChange(
            variants.map((v, idx) =>
                idx === vi
                    ? {
                          ...v,
                          options: v.options.map((o) =>
                              o.name === optionName ? { ...o, value } : o,
                          ),
                      }
                    : v,
            ),
        );

    const removeVariant = (i) => onVariantsChange(variants.filter((_, idx) => idx !== i));

    const valuesFor = (optionName) => validOptions.find((o) => o.name === optionName)?.values || [];

    /* -------------------------------- UI --------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            {/* ===== Variant Options ===== */}
            <section>
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Variant Options</p>
                        <p className="text-xs text-gray-500">
                            Define the choices (e.g. Size, Color). Variants are built from these.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                        <Plus size={15} /> Add option
                    </button>
                </div>

                {variantOptions.length === 0 && (
                    <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                        No options yet. Add one (e.g. Size, Color) to start.
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    {variantOptions.map((option, oi) => {
                        const color = isColorOption(option.name);
                        return (
                            <div key={oi} className="rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={option.name}
                                        onChange={(e) => setOptionName(oi, e.target.value)}
                                        placeholder="Option name (e.g. Size, Color)"
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeOption(oi)}
                                        className="rounded-md p-2 text-red-500 hover:bg-red-50"
                                        title="Remove option"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">
                                            Values
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => addValue(oi)}
                                            className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                                        >
                                            <Plus size={13} /> Add value
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {option.values.map((value, vi) => (
                                            <div
                                                key={vi}
                                                className="relative flex items-center gap-1.5 rounded-md border border-gray-300 py-1 pl-1 pr-6"
                                            >
                                                {color && (
                                                    <input
                                                        type="color"
                                                        value={
                                                            /^#[0-9a-fA-F]{6}$/.test(value)
                                                                ? value
                                                                : "#000000"
                                                        }
                                                        onChange={(e) =>
                                                            setValue(oi, vi, e.target.value)
                                                        }
                                                        className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                                                        title="Pick colour"
                                                    />
                                                )}
                                                <input
                                                    value={value}
                                                    onChange={(e) =>
                                                        setValue(oi, vi, e.target.value)
                                                    }
                                                    placeholder={
                                                        color ? "#RRGGBB" : `Value ${vi + 1}`
                                                    }
                                                    className="w-28 border-0 py-1 text-sm focus:outline-none"
                                                />
                                                {option.values.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeValue(oi, vi)}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ===== Smart Variant Update ===== */}
            {variantOptions.length > 0 && (
                <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                    <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-900">Smart Variant Update</p>
                    </div>
                    <p className="mb-3 text-xs text-blue-700">
                        Update existing variants with new options
                    </p>

                    {optionsChanged && (
                        <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                            <AlertTriangle size={16} className="shrink-0" />
                            New variant options detected. Update existing variants?
                        </div>
                    )}

                    <div className="mb-3 flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={preserve}
                                onChange={(e) => setPreserve(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Preserve existing variant data (pricing, stock, etc.)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={addMissing}
                                onChange={(e) => setAddMissing(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Add missing options to existing variants
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={applySmartUpdate}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Wand2 size={15} /> Smart Update Variants
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPreview((s) => !s)}
                            className="flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                        >
                            <Eye size={15} /> {showPreview ? "Hide Preview" : "Preview Changes"}
                        </button>
                    </div>

                    {showPreview && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="rounded-md bg-white px-3 py-2">
                                <p className="text-lg font-semibold text-green-600">
                                    {preview.kept}
                                </p>
                                <p className="text-xs text-gray-500">Kept</p>
                            </div>
                            <div className="rounded-md bg-white px-3 py-2">
                                <p className="text-lg font-semibold text-blue-600">
                                    {preview.added}
                                </p>
                                <p className="text-xs text-gray-500">Added / reset</p>
                            </div>
                            <div className="rounded-md bg-white px-3 py-2">
                                <p className="text-lg font-semibold text-red-600">
                                    {preview.removed}
                                </p>
                                <p className="text-xs text-gray-500">Removed</p>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ===== Variants ===== */}
            <section>
                <div className="mb-1 flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">Variants</p>
                    <button
                        type="button"
                        onClick={addManualVariant}
                        className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                        <Plus size={15} /> Add variant
                    </button>
                </div>
                <p className="mb-3 text-xs text-gray-500">
                    All variants are listed below and generated from the selected variant options.
                    Required fields must be filled in for each variant.
                </p>

                {variants.length === 0 && (
                    <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                        No variants yet. Use Smart Update Variants, or add one manually.
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    {variants.map((variant, vi) => {
                        const finalPrice = variantFinalPrice(
                            variant,
                            productBasePrice,
                            productDiscountType,
                            productDiscountValue,
                        );
                        const label =
                            variant.options
                                .map((o) => o.value)
                                .filter(Boolean)
                                .join(" / ") || "Variant";
                        const hasDiscount = variant.discountType !== "none";

                        return (
                            <div key={vi} className="rounded-lg border border-gray-200 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(vi)}
                                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                {/* option pickers */}
                                <div className="mb-3 flex flex-wrap gap-3">
                                    {variant.options.map((opt) => {
                                        const color = isColorOption(opt.name);
                                        const opts = valuesFor(opt.name);
                                        return (
                                            <div key={opt.name}>
                                                <label className="mb-1 block text-xs font-medium text-gray-500">
                                                    {opt.name}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {color && (
                                                        <span
                                                            className="h-6 w-6 shrink-0 rounded border border-gray-300"
                                                            style={{ backgroundColor: opt.value }}
                                                        />
                                                    )}
                                                    <select
                                                        value={opt.value}
                                                        onChange={(e) =>
                                                            setVariantOptionValue(
                                                                vi,
                                                                opt.name,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-36 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                                    >
                                                        {opts.length === 0 && (
                                                            <option value={opt.value}>
                                                                {opt.value}
                                                            </option>
                                                        )}
                                                        {opts.map((v) => (
                                                            <option key={v} value={v}>
                                                                {v}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* pricing row */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                            Base Price
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={variant.basePrice}
                                            onChange={(e) =>
                                                setVariantField(vi, "basePrice", e.target.value)
                                            }
                                            placeholder={String(productBasePrice || 0)}
                                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                            Discount Type
                                        </label>
                                        <select
                                            value={variant.discountType}
                                            onChange={(e) =>
                                                setVariantField(vi, "discountType", e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        >
                                            <option value="none">No Discount</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                    </div>

                                    {hasDiscount ? (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                                Discount Value
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.discountValue}
                                                onChange={(e) =>
                                                    setVariantField(
                                                        vi,
                                                        "discountValue",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                                Final Price
                                            </label>
                                            <input
                                                readOnly
                                                value={formatPrice(finalPrice, currency)}
                                                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-600"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={variant.stock}
                                            onChange={(e) =>
                                                setVariantField(vi, "stock", e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {hasDiscount && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Final price after discount:{" "}
                                        <span className="font-medium text-gray-900">
                                            {formatPrice(finalPrice, currency)}
                                        </span>
                                    </p>
                                )}

                                {/* sku + image group */}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                            SKU
                                        </label>
                                        <input
                                            value={variant.sku}
                                            onChange={(e) =>
                                                setVariantField(vi, "sku", e.target.value)
                                            }
                                            placeholder="Variant SKU"
                                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                            Image Group
                                        </label>
                                        <select
                                            value={variant.imageGroupName}
                                            onChange={(e) =>
                                                setVariantField(
                                                    vi,
                                                    "imageGroupName",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                        >
                                            <option value="">Select Group</option>
                                            {imageGroupNames.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default ProductVariantEditor;

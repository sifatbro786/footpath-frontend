/**
 * Description, highlights and the specification table.
 *
 * Set as an editorial spec sheet: hairline separated rows, label left in small
 * caps, value right. No card, no shadow, no icons.
 */
export default function ProductSpecs({ product }) {
    const { description, bulletPoints, attributes, brand, sku } = product;

    // Brand and SKU are useful spec rows but live outside `attributes`, so fold
    // them in rather than printing them somewhere separate.
    const rows = [
        ...(brand ? [{ key: "Brand", value: brand }] : []),
        ...(sku ? [{ key: "SKU", value: sku }] : []),
        ...attributes,
    ];

    if (!description && !bulletPoints.length && !rows.length) return null;

    return (
        <section className="grid gap-12 lg:grid-cols-2">
            <div>
                {description && (
                    <>
                        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                            About this product
                        </h2>
                        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                            {description}
                        </p>
                    </>
                )}

                {bulletPoints.length > 0 && (
                    <ul className="mt-7 space-y-2.5">
                        {bulletPoints.map((point, i) => (
                            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                                <span
                                    aria-hidden="true"
                                    className="mt-2.5 h-px w-3.5 shrink-0 bg-marigold"
                                />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {rows.length > 0 && (
                <div>
                    <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                        Specifications
                    </h2>
                    <dl className="mt-4 border-t border-line">
                        {rows.map((row, i) => (
                            <div
                                key={`${row.key}-${i}`}
                                className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                            >
                                <dt className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                    {row.key}
                                </dt>
                                <dd className="text-right text-sm text-ink">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </section>
    );
}

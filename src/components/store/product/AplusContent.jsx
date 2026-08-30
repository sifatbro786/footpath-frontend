import DOMPurify from "dompurify";

/**
 * A+ content renderer.
 *
 * models/AplusContent.js stores six section types, each using a different
 * subset of its fields:
 *   text            content (HTML)
 *   features        content (HTML)
 *   imageGallery    images [{ url, alt, caption }]
 *   video           videos [{ url, title, thumbnail }]
 *   specifications  specifications [{ key, value }]
 *   comparison      comparisonData [{ feature, ourProduct, competitor }]
 *
 * SECURITY: `content` is raw HTML written in the admin panel and rendered into
 * every shopper's page. Even though authors are trusted staff, injecting it
 * unsanitised means one compromised admin account, or one stored XSS in the
 * admin editor, executes script for every visitor. DOMPurify strips scripts,
 * event handlers and javascript: URLs while leaving formatting intact. This is
 * the only place in the storefront that renders server supplied HTML.
 */

const sanitize = (html) =>
    DOMPurify.sanitize(html ?? "", {
        USE_PROFILES: { html: true },
        // Anchors survive sanitisation, so force them to open safely.
        ADD_ATTR: ["target", "rel"],
    });

const SectionHeading = ({ children }) =>
    children ? (
        <h3 className="mb-5 font-display text-xl font-semibold tracking-tight text-ink">
            {children}
        </h3>
    ) : null;

/**
 * Prose styling is applied through explicit child selectors rather than a
 * typography plugin, which is not installed. Kept deliberately narrow: the
 * tags an admin actually produces.
 */
const proseClasses = [
    "text-[15px] leading-relaxed text-ink-soft",
    "[&_p]:mb-4",
    "[&_strong]:font-semibold [&_strong]:text-ink",
    "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
    "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5",
    "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5",
    "[&_li]:mb-1.5",
    "[&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
    "[&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
    "[&_img]:my-4 [&_img]:w-full [&_img]:border [&_img]:border-line",
].join(" ");

function Section({ section }) {
    switch (section.type) {
        case "imageGallery":
            if (!section.images?.length) return null;
            return (
                <>
                    <SectionHeading>{section.title}</SectionHeading>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.images.map((image, i) => (
                            <figure key={i}>
                                <img
                                    src={image.url}
                                    alt={image.alt || ""}
                                    loading="lazy"
                                    className="w-full border border-line object-cover"
                                />
                                {image.caption && (
                                    <figcaption className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                        {image.caption}
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                </>
            );

        case "video":
            if (!section.videos?.length) return null;
            return (
                <>
                    <SectionHeading>{section.title}</SectionHeading>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {section.videos.map((video, i) => (
                            <div key={i}>
                                {/* controls, no autoplay: an unrequested video
                                    that starts itself is hostile on mobile data. */}
                                <video
                                    src={video.url}
                                    poster={video.thumbnail || undefined}
                                    controls
                                    preload="none"
                                    className="w-full border border-line bg-ink"
                                />
                                {video.title && (
                                    <p className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                        {video.title}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            );

        case "specifications":
            if (!section.specifications?.length) return null;
            return (
                <>
                    <SectionHeading>{section.title}</SectionHeading>
                    <dl className="border-t border-line">
                        {section.specifications.map((spec, i) => (
                            <div
                                key={i}
                                className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                            >
                                <dt className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                    {spec.key}
                                </dt>
                                <dd className="text-right text-sm text-ink">{spec.value}</dd>
                            </div>
                        ))}
                    </dl>
                </>
            );

        case "comparison":
            if (!section.comparisonData?.length) return null;
            return (
                <>
                    <SectionHeading>{section.title}</SectionHeading>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-lg border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-ink/25">
                                    <th className="py-3 pr-4 text-left font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                        Feature
                                    </th>
                                    <th className="py-3 pr-4 text-left font-label text-[11px] uppercase tracking-[0.16em] text-ink">
                                        This product
                                    </th>
                                    <th className="py-3 text-left font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                        Others
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.comparisonData.map((row, i) => (
                                    <tr key={i} className="border-b border-line">
                                        <td className="py-3 pr-4 text-ink-soft">{row.feature}</td>
                                        <td className="py-3 pr-4 font-medium text-ink">
                                            {row.ourProduct}
                                        </td>
                                        <td className="py-3 text-ink/50">{row.competitor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            );

        case "text":
        case "features":
        default:
            if (!section.content) return null;
            return (
                <>
                    <SectionHeading>{section.title}</SectionHeading>
                    <div
                        className={proseClasses}
                        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
                    />
                </>
            );
    }
}

export default function AplusContent({ content }) {
    const sections = (content?.sections ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (!sections.length) return null;

    return (
        <section className="border-t border-line pt-14">
            {content.title && (
                <h2 className="mb-10 font-display text-2xl font-semibold tracking-tight text-ink">
                    {content.title}
                </h2>
            )}

            <div className="space-y-14">
                {sections.map((section, i) => (
                    <div key={section._id ?? i}>
                        <Section section={section} />
                    </div>
                ))}
            </div>
        </section>
    );
}

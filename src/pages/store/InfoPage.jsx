import { Link } from "react-router-dom";

import Seo from "../../components/common/Seo";
import Eyebrow from "../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";

/**
 * Shared shell for the policy and help pages: FAQ, shipping, returns, privacy,
 * terms.
 *
 * One component rather than five near-identical files. These pages differ only
 * in their content, and giving each its own layout guarantees they drift apart
 * in spacing and heading style over time.
 *
 * Content lives in infoPages.js as structured data, so a section is a data
 * edit, not a JSX edit. SEO title and description still come from a PageMeta
 * record when one exists for the slug, so the searchable part stays editable
 * without a deploy.
 *
 * These are genuine legal and operational commitments. The copy below is a
 * sound starting point written against how this shop actually works (COD
 * splits, courier vs home delivery, the real return window), but a shop owner
 * should read it before launch and a lawyer should see the privacy and terms
 * pages.
 */
export default function InfoPage({ slug, eyebrow, title, intro, sections, footnote }) {
    return (
        <>
            <Seo
                slug={slug}
                fallbackTitle={`${title} | Elmate Stationery`}
                fallbackDescription={intro}
            />

            <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs items={[{ label: title, href: `/${slug}` }]} className="mb-7" />

                <header>
                    <Eyebrow>{eyebrow}</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        {title}
                    </h1>
                    {intro && (
                        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{intro}</p>
                    )}
                </header>

                <div className="mt-12 space-y-10">
                    {sections.map((section) => (
                        <section key={section.heading} className="border-t border-line pt-8">
                            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                                {section.heading}
                            </h2>

                            {section.body?.map((paragraph, i) => (
                                <p
                                    key={i}
                                    className="mt-3 text-[15px] leading-relaxed text-ink-soft"
                                >
                                    {paragraph}
                                </p>
                            ))}

                            {section.list && (
                                <ul className="mt-4 space-y-2.5">
                                    {section.list.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mt-2.5 h-px w-3.5 shrink-0 bg-marigold"
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                <footer className="mt-14 border-t border-line pt-8">
                    {footnote && (
                        <p className="text-[13.5px] leading-relaxed text-ink/55">{footnote}</p>
                    )}
                    <p className="mt-4 text-[13.5px] text-ink-soft">
                        Still stuck?{" "}
                        <Link
                            to="/contact"
                            className="text-ink underline underline-offset-4 hover:text-brand"
                        >
                            Get in touch
                        </Link>{" "}
                        and a person will answer.
                    </p>
                </footer>
            </div>
        </>
    );
}

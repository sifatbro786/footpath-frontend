import { Link } from "react-router-dom";

/**
 * Breadcrumb trail.
 *
 * Uses a slash separator rather than a chevron icon: it reads as a path,
 * matches the type-led feel of the rest of the catalogue, and costs no icon.
 *
 * Props:
 *   items  [{ label, href }] root first. The last entry renders as plain text
 *          because it is the current page.
 */
export default function Breadcrumbs({ items = [], className = "" }) {
    if (!items.length) return null;

    const trail = [{ label: "Home", href: "/" }, ...items];

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-label text-xs text-ink/50">
                {trail.map((item, i) => {
                    const isLast = i === trail.length - 1;
                    return (
                        <li key={item.href ?? item.label} className="flex items-center gap-2">
                            {isLast ? (
                                <span aria-current="page" className="text-ink/80">
                                    {item.label}
                                </span>
                            ) : (
                                <>
                                    <Link
                                        to={item.href}
                                        className="transition-colors hover:text-ink"
                                    >
                                        {item.label}
                                    </Link>
                                    <span aria-hidden="true" className="text-ink/25">
                                        /
                                    </span>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

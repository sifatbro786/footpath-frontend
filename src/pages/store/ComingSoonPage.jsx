import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo";

/**
 * Placeholder for storefront routes that are registered but not yet built.
 *
 * PHASE 1 registers every route the storefront links to so nothing 404s
 * mid-journey. Each of these gets replaced by a real page in a later phase:
 *   /shop, /category/:slug  -> Phase 3
 *   /products/:slug         -> Phase 4
 *   /cart                   -> Phase 5
 *   /checkout               -> Phase 6
 *
 * noIndex is set because an empty page that search engines crawl now is a page
 * they may keep serving from cache after it becomes real.
 */
const ComingSoonPage = ({ title = "Coming soon", phase, description }) => (
    <>
        <Seo slug={null} title={`${title} — Elmate Stationery`} noIndex />

        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
            <span className="font-label text-xs uppercase tracking-[0.28em] text-muted">
                {phase ? `Building — ${phase}` : "Building"}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                {title}
            </h1>
            <p className="mt-3 text-sm text-ink-soft sm:text-base">
                {description ?? "This part of the store isn't ready yet. It's next on the list."}
            </p>

            <Link
                to="/"
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
            >
                Back to home
            </Link>
        </div>
    </>
);

export default ComingSoonPage;

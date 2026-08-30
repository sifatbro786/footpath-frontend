/**
 * Section eyebrow, editorial style.
 *
 * Deliberately NOT a centred pill badge: a short warm rule, then small
 * letter-spaced caps, left aligned. The rule does the work a pill would do
 * (marking the label as secondary) without the boxed-badge look.
 */
export default function Eyebrow({ children, className = "" }) {
    return (
        <span
            className={`flex items-center gap-2.5 font-label text-[11px] uppercase tracking-[0.22em] text-ink/45 ${className}`}
        >
            <span aria-hidden="true" className="h-px w-6 bg-marigold" />
            {children}
        </span>
    );
}

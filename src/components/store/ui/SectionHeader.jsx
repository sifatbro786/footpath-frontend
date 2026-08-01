// src/components/store/ui/SectionHeader.jsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Reusable section heading.
 *
 * Signature detail: a short "measured rule" (ruler ticks) sits under the
 * eyebrow — a quiet stationery cue reused across sections. Keep the rest calm.
 *
 * Props:
 *   eyebrow      short mono label (e.g. "Best sellers")
 *   title        display heading
 *   description  optional supporting line
 *   actionLabel  optional link text (e.g. "View all")
 *   actionHref   link target for actionLabel
 *   align        "left" | "center" (default "left")
 */
export default function SectionHeader({
    eyebrow,
    title,
    description,
    actionLabel,
    actionHref = "#",
    align = "left",
}) {
    const centered = align === "center";

    return (
        <div
            className={[
                "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                centered ? "text-center sm:text-left" : "",
            ].join(" ")}
        >
            <div className={centered ? "mx-auto sm:mx-0" : ""}>
                {eyebrow && (
                    <div className={centered ? "flex flex-col items-center sm:items-start" : ""}>
                        <span className="font-label text-xs uppercase tracking-[0.2em] text-grass">
                            {eyebrow}
                        </span>
                    </div>
                )}

                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {title}
                </h2>

                {description && <p className="mt-2 max-w-xl text-sm text-ink/60">{description}</p>}
            </div>

            {actionLabel && (
                <Link
                    to={actionHref}
                    className="group inline-flex items-center gap-1.5 self-start font-label text-xs
                               uppercase tracking-[0.15em] text-ink/70 transition-colors
                               hover:text-grass sm:self-auto"
                >
                    {actionLabel}
                    <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            )}
        </div>
    );
}

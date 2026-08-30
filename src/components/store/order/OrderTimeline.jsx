/**
 * Order progress.
 *
 * Renders the full journey rather than only what has happened, so someone can
 * see where they are AND what is still to come. Reached steps are inked;
 * upcoming ones are hairline outlines.
 *
 * Cancelled and Refunded are terminal and do not belong on the happy path, so
 * they replace the track entirely instead of appearing as a sixth step nobody
 * wants to progress toward.
 *
 * `statusHistory` is the authoritative record (Order.statusHistory), pushed on
 * every transition. Note that `updatedBy` is frequently empty for system
 * transitions: the payment controller used to pass the string "system" into an
 * ObjectId field, which Mongoose silently discarded. Historic entries therefore
 * have no actor, which is why this never tries to show one.
 */

const HAPPY_PATH = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

const STEP_COPY = {
    Pending: "Order placed",
    Confirmed: "Confirmed",
    Processing: "Being prepared",
    Shipped: "On its way",
    Delivered: "Delivered",
};

const formatWhen = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function OrderTimeline({ status, statusHistory = [] }) {
    const isTerminal = status === "Cancelled" || status === "Refunded";

    // Most recent timestamp per status, so a re-entered status shows when it
    // last happened rather than the first time.
    const reachedAt = {};
    for (const entry of statusHistory) {
        if (entry?.status) reachedAt[entry.status] = entry.updatedAt;
    }

    if (isTerminal) {
        const when = formatWhen(reachedAt[status]);
        return (
            <div className="border-l-2 border-coral bg-coral/5 px-4 py-3.5">
                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-coral">
                    {status === "Cancelled" ? "Order cancelled" : "Order refunded"}
                </p>
                {when && <p className="mt-1 font-label text-[11px] text-ink/45">{when}</p>}
                {statusHistory.at(-1)?.note && (
                    <p className="mt-2 text-[13px] text-ink-soft">{statusHistory.at(-1).note}</p>
                )}
            </div>
        );
    }

    const currentIndex = HAPPY_PATH.indexOf(status);

    return (
        <ol className="relative">
            {HAPPY_PATH.map((step, i) => {
                const reached = i <= currentIndex;
                const isCurrent = i === currentIndex;
                const when = formatWhen(reachedAt[step]);
                const isLast = i === HAPPY_PATH.length - 1;

                return (
                    <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Connector, drawn behind the marker */}
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className={`absolute left-[5px] top-3 h-full w-px ${
                                    i < currentIndex ? "bg-ink" : "bg-line"
                                }`}
                            />
                        )}

                        <span
                            aria-hidden="true"
                            className={`relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full border ${
                                reached
                                    ? "border-ink bg-ink"
                                    : "border-ink/25 bg-paper"
                            }`}
                        />

                        <div className="min-w-0 flex-1">
                            <p
                                className={`text-sm ${
                                    isCurrent
                                        ? "font-semibold text-ink"
                                        : reached
                                          ? "text-ink"
                                          : "text-ink/35"
                                }`}
                            >
                                {STEP_COPY[step]}
                            </p>
                            {when && reached && (
                                <p className="mt-0.5 font-label text-[11px] tabular-nums text-ink/45">
                                    {when}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

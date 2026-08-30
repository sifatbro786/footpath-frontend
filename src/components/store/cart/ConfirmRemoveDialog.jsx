import { useEffect, useRef } from "react";

/**
 * Confirmation before a cart line is removed.
 *
 * Focus moves to the cancel button on open and Escape dismisses, so the dialog
 * is operable without a mouse. Cancel takes focus rather than the destructive
 * action, so a stray Enter never deletes anything.
 */
export default function ConfirmRemoveDialog({ item, onConfirm, onCancel }) {
    const cancelRef = useRef(null);

    useEffect(() => {
        if (!item) return;
        cancelRef.current?.focus();

        const onKey = (e) => e.key === "Escape" && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [item, onCancel]);

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink/50" onClick={onCancel} aria-hidden="true" />

            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="remove-title"
                className="relative w-full max-w-sm border border-line bg-paper px-6 py-6"
            >
                <h2 id="remove-title" className="font-display text-lg font-semibold text-ink">
                    Remove this item?
                </h2>
                <p className="mt-2.5 text-sm text-ink-soft">
                    {item.name}
                    {item.variantLabel ? ` (${item.variantLabel})` : ""} will be taken out of your
                    bag.
                </p>

                <div className="mt-6 flex gap-2.5">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        className="flex-1 border border-ink/20 py-2.5 font-label text-[11px]
                                   uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
                    >
                        Keep it
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 border border-coral bg-coral py-2.5 font-label text-[11px]
                                   uppercase tracking-[0.16em] text-paper transition-colors
                                   hover:bg-transparent hover:text-coral"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

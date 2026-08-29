/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { offerPopupApi } from "../../../api/offerPopupApi";

/**
 * Promotional popup driven by /api/offers/active.
 *
 * The backend already filters by isActive + date window and sorts by priority
 * desc, so the first result is the one to show — no client-side selection.
 *
 * `displayFrequency` (OfferPopup.js enum) decides how often a given offer comes
 * back after being dismissed:
 *   once    never again on this device
 *   daily   at most once per calendar day
 *   always  every page load
 *
 * Dismissals are stored per offer id, so publishing a new offer is never
 * suppressed by an old dismissal.
 */

const STORAGE_PREFIX = "elmate.offer.";
const SHOW_DELAY_MS = 1200; // let the page paint before interrupting

const todayStamp = () => new Date().toISOString().slice(0, 10);

const wasDismissed = (offer) => {
    if (!offer?._id) return true;
    if (offer.displayFrequency === "always") return false;

    try {
        const stored = localStorage.getItem(STORAGE_PREFIX + offer._id);
        if (!stored) return false;
        if (offer.displayFrequency === "daily") return stored === todayStamp();
        return true; // "once"
    } catch {
        // Storage unavailable — show it rather than hiding a live promotion.
        return false;
    }
};

const recordDismissal = (offer) => {
    if (!offer?._id || offer.displayFrequency === "always") return;
    try {
        localStorage.setItem(STORAGE_PREFIX + offer._id, todayStamp());
    } catch {
        /* non-fatal */
    }
};

const OfferPopup = () => {
    const reduce = useReducedMotion();
    const [visible, setVisible] = useState(false);

    const { data: offer } = useQuery({
        queryKey: ["offers", "active"],
        queryFn: () => offerPopupApi.getActive().then((r) => r.data?.data?.[0] ?? null),
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    useEffect(() => {
        if (!offer || wasDismissed(offer)) return;
        const id = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        return () => clearTimeout(id);
    }, [offer]);

    // Escape closes, matching the cart drawer's behaviour.
    useEffect(() => {
        if (!visible) return;
        const onKey = (e) => e.key === "Escape" && dismiss();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const dismiss = () => {
        recordDismissal(offer);
        setVisible(false);
    };

    if (!offer) return null;

    const anim = reduce
        ? {}
        : {
              initial: { opacity: 0, scale: 0.96, y: 12 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.97, y: 8 },
              transition: { duration: 0.22, ease: "easeOut" },
          };

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-ink/50"
                        initial={reduce ? undefined : { opacity: 0 }}
                        animate={reduce ? undefined : { opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        onClick={dismiss}
                        aria-hidden="true"
                    />

                    <motion.div
                        {...anim}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="offer-popup-title"
                        className="relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-paper shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Close offer"
                            className="absolute right-3 top-3 z-10 rounded-full bg-paper/90 p-1.5 text-ink transition-colors hover:bg-paper-dim"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {offer.thumbnailImage && (
                            <img
                                src={offer.thumbnailImage}
                                alt=""
                                className="h-44 w-full object-cover"
                            />
                        )}

                        <div className="px-6 py-6 text-center">
                            <h2
                                id="offer-popup-title"
                                className="font-display text-2xl font-semibold text-ink"
                            >
                                {offer.title}
                            </h2>
                            {offer.description && (
                                <p className="mt-2 text-sm text-ink-soft">{offer.description}</p>
                            )}

                            {offer.buttonText && offer.buttonLink && (
                                <Link
                                    to={offer.buttonLink}
                                    onClick={dismiss}
                                    className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
                                >
                                    {offer.buttonText}
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OfferPopup;

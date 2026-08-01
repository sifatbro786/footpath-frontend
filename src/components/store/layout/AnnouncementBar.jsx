/* eslint-disable no-unused-vars */
// src/components/store/layout/AnnouncementBar.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { announcements } from "../../../data/store/announcements";

const AnnouncementBar = () => {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (announcements.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % announcements.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [isPaused]);

    if (!open) return null;

    const current = announcements[index];

    return (
        <aside
            className="relative border-b border-white/10 bg-ink text-paper selection:bg-marigold selection:text-ink"
            aria-label="Announcement"
        >
            <div className="mx-auto flex max-w-full items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
                {/* Spacer to balance layout */}
                <div className="hidden w-6 sm:block" />

                {/* Main Carousel Area */}
                <div
                    className="flex h-5 items-center overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id || index}
                            initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
                            animate={{ y: "0%", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex items-center gap-2.5 text-xs font-medium tracking-tight"
                        >
                            {/* Subtle Micro-badge */}
                            {current.badge && (
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-marigold backdrop-blur-xs">
                                    {current.badge}
                                </span>
                            )}

                            {/* Text Content */}
                            <span className="text-paper/90">{current.text}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dismiss Button */}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Dismiss announcement"
                    className="group -mr-1 flex h-6 w-6 items-center justify-center rounded-full text-paper/50 transition-colors hover:bg-white/10 hover:text-paper"
                >
                    <X
                        size={13}
                        className="transition-transform duration-200 group-hover:scale-110"
                    />
                </button>
            </div>
        </aside>
    );
};

export default AnnouncementBar;

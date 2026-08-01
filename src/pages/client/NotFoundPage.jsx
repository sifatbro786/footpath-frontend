/* eslint-disable no-unused-vars */
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    const reduce = useReducedMotion();
    const reveal = reduce
        ? {}
        : {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.45, ease: "easeOut" },
          };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-16 text-center">
            {/* graph-paper signature */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 paper-grid opacity-70"
            />

            <motion.div {...reveal} className="relative flex flex-col items-center">
                <Link to="/" className="mb-10" aria-label="Elmate — home">
                    <img src="/logo.png" alt="Elmate Stationery" className="h-9 w-auto" />
                </Link>

                <span className="font-label text-xs uppercase tracking-[0.28em] text-muted">
                    Error 404
                </span>

                {/* 404 with a marigold highlighter swipe — the signature moment */}
                <div className="relative mt-4">
                    <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 z-0 h-[46%] w-[116%] -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-sm bg-grass"
                    />
                    <h1 className="relative z-10 font-display text-7xl font-extrabold leading-none tracking-tight text-ink sm:text-8xl">
                        404
                    </h1>
                </div>

                <h2 className="mt-8 font-display text-2xl font-semibold text-ink sm:text-3xl">
                    This page tore out of the notebook
                </h2>
                <p className="mt-3 max-w-md text-sm text-ink-soft sm:text-base">
                    The page you're after isn't here — it may have moved, sold out, or never
                    existed. Let's get you back to the good stuff.
                </p>

                <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                    <Link
                        to="/"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-grass px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-grass/90 sm:w-auto"
                    >
                        Back to home
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex w-full items-center justify-center rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-paper-dim sm:w-auto"
                    >
                        Browse products
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;

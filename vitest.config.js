import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Test config, kept separate from vite.config.js so the production build never
 * carries test-only aliases.
 *
 * The swiper/css alias exists because Vitest does not process CSS imports and
 * Hero.jsx imports "swiper/css" + "swiper/css/effect-fade" at module scope —
 * without the alias every test that renders the homepage fails to resolve them.
 */
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.js"],
        // jsdom renders Swiper and framer-motion far slower than a real browser;
        // 5s (the default) is not enough for a full homepage mount.
        testTimeout: 25000,
        // Windows spawns worker forks slowly enough that the default pool trips
        // Vitest's 60s startup timeout before a single test runs. One long-lived
        // fork avoids the spawn storm entirely. The suite is small, so the lost
        // parallelism costs less than the flakiness it removes.
        pool: "forks",
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
    },
    resolve: {
        alias: [{ find: /^swiper\/css.*/, replacement: "/tests/empty.css" }],
    },
});

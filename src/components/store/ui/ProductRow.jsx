/* eslint-disable no-unused-vars */
// src/components/store/ui/ProductRow.jsx
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "./ProductCard";
import { normalizeProducts } from "../../../lib/store/productMapper";

/**
 * Renders a list of RAW backend products (or fixtures in the same shape).
 * Normalization happens here so pages just hand over the API array.
 *
 * Layout: horizontal scroll-snap shelf on mobile (uses `no-scrollbar`),
 * responsive grid from `sm` up.
 *
 * Props:
 *   products     raw product array
 *   onAddToCart  optional passthrough to cards
 *   layout       one of GRID_LAYOUTS keys (default "shelf4")
 *
 * NOTE: grid classes are written as literal strings (not interpolated) so
 * Tailwind's content scanner can see them. Add a new preset here rather than
 * building class names dynamically.
 */
const GRID_LAYOUTS = {
    // 2 up mobile grid -> 3 -> 4
    shelf4: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
    // 2 -> 3
    shelf3: "grid-cols-2 sm:grid-cols-3",
    // dense 2 -> 4 -> 5
    dense5: "grid-cols-2 sm:grid-cols-4 xl:grid-cols-5",
};

export default function ProductRow({ products = [], onAddToCart, layout = "shelf4" }) {
    const reduce = useReducedMotion();
    const items = normalizeProducts(products);

    if (items.length === 0) return null;

    const gridCols = GRID_LAYOUTS[layout] ?? GRID_LAYOUTS.shelf4;

    const reveal = reduce
        ? {}
        : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-80px" },
              transition: { duration: 0.4, ease: "easeOut" },
          };

    return (
        <motion.div {...reveal}>
            {/* Mobile: horizontal snap shelf */}
            <div
                className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto
                           px-4 pb-1 sm:hidden"
            >
                {items.map((p) => (
                    <div key={p.id} className="w-[45%] shrink-0 snap-start">
                        <ProductCard product={p} onAddToCart={onAddToCart} />
                    </div>
                ))}
            </div>

            {/* sm+ : grid */}
            <div className={`hidden gap-4 sm:grid ${gridCols}`}>
                {items.map((p) => (
                    <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                ))}
            </div>
        </motion.div>
    );
}

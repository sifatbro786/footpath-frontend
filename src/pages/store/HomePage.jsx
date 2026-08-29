// src/pages/store/HomePage.jsx
import Seo from "../../components/common/Seo";
import Hero from "../../components/store/home/Hero";
import TrustStrip from "../../components/store/home/TrustStrip";
import Bestsellers from "../../components/store/home/Bestsellers";
import ShopByCategory from "../../components/store/home/ShopByCategory";
import FeaturedProducts from "../../components/store/home/FeaturedProducts";
import NewArrivals from "../../components/store/home/NewArrivals";
import ThemedRows from "../../components/store/home/ThemedRows";
import PromoBanner from "../../components/store/home/PromoBanner";
import PopularBrands from "../../components/store/home/PopularBrands";
import SeoContent from "../../components/store/home/SeoContent";
import Testimonials from "../../components/store/home/Testimonials";

/**
 * Announcement bar, header and footer live in StoreLayout — this is the page
 * body only.
 *
 * Data sources after Phase 2:
 *   Hero              GET /api/hero-items
 *   TrustStrip        static — delivery/returns promises, copy not data
 *   Bestsellers       GET /api/products?sortBy=popularity
 *   ShopByCategory    GET /api/categories?level=0
 *   FeaturedProducts  GET /api/products/featured
 *   NewArrivals       GET /api/products?sortBy=newest
 *   ThemedRows        GET /api/products/homepage-sections  (0..n sections)
 *   PromoBanner       GET /api/hero  (imagery only — copy is hardcoded, see file)
 *   PopularBrands     static — no Brand model exists yet
 *   SeoContent        static copy
 *   Testimonials      static — not wired to /api/reviews yet
 *
 * Every data-backed section removes itself when it has nothing to show, so the
 * page stays coherent on a fresh database instead of rendering empty shelves.
 */
export default function HomePage() {
    return (
        <>
            {/* Title/description come from the PageMeta record with slug "home",
                editable at /admin/page-meta. Falls back if none is configured. */}
            <Seo
                slug="home"
                fallbackTitle="Elmate Stationery — Pens, Notebooks & Desk Supplies"
                fallbackDescription="Shop pens, notebooks, inks and desk supplies. Delivered across Bangladesh."
            />

            <Hero />
            <TrustStrip />
            <Bestsellers />
            <ShopByCategory />
            <FeaturedProducts />
            <NewArrivals />
            <ThemedRows />
            <PromoBanner />
            <PopularBrands />
            <SeoContent />
            <Testimonials />
        </>
    );
}

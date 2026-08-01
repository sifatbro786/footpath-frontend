// src/pages/store/HomePage.jsx
import Hero from "../../components/store/home/Hero";
import TrustStrip from "../../components/store/home/TrustStrip";
import Bestsellers from "../../components/store/home/Bestsellers";
import ShopByCategory from "../../components/store/home/ShopByCategory";
import NewArrivals from "../../components/store/home/NewArrivals";
import ThemedRows from "../../components/store/home/ThemedRows";
import PromoBanner from "../../components/store/home/PromoBanner";
import PopularBrands from "../../components/store/home/PopularBrands";
import SeoContent from "../../components/store/home/SeoContent";
import Testimonials from "../../components/store/home/Testimonials";

// Announcement + Header + Footer live in StoreLayout. This is sections 3–12.
export default function HomePage() {
    return (
        <>
            <Hero />
            <TrustStrip />
            <Bestsellers />
            <ShopByCategory />
            <NewArrivals />
            <ThemedRows />
            <PromoBanner />
            <PopularBrands />
            <SeoContent />
            <Testimonials />
        </>
    );
}

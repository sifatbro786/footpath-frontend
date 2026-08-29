import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { useHeroSlides } from "../../../hooks/store/useStorefront";

import "swiper/css";
import "swiper/css/effect-fade";

/**
 * Hero slider — GET /api/hero-items (Phase 2).
 *
 * Slides are managed at /admin/hero-items. Notes on the model:
 *   mediaType   "video" | "image" — both are handled below
 *   duration    per-slide seconds; passed to Swiper as data-swiper-autoplay
 *   deviceType  filtered client-side in useHeroSlides, not via ?device=
 *   title       supports a *marked phrase* for the marigold underline
 *               (see parseHeroTitle in productMapper)
 *
 * The whole section is hidden when there are no active slides — a stationery
 * shop with an empty black band at the top looks broken.
 */

const HeroMedia = ({ slide }) =>
    slide.mediaType === "video" ? (
        <video
            src={slide.mediaUrl}
            // A hero video is decoration: it must never block interaction or
            // surprise anyone with sound. playsInline keeps iOS from taking it
            // fullscreen.
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
        />
    ) : (
        <img
            src={slide.mediaUrl}
            alt=""
            aria-hidden="true"
            className="hero-kenburns absolute inset-0 h-full w-full object-cover object-center"
        />
    );

const HeroSkeleton = () => (
    <section className="relative bg-ink" aria-hidden="true">
        <div className="h-140 w-full animate-pulse bg-ink/60 sm:h-[70vh] lg:h-[86vh] lg:max-h-215" />
    </section>
);

const Hero = () => {
    const { slides, isLoading, isError } = useHeroSlides();

    if (isLoading) return <HeroSkeleton />;
    if (isError || slides.length === 0) return null;

    return (
        <section className="relative bg-ink" aria-label="Featured">
            <Swiper
                modules={[Autoplay, EffectFade, A11y, Keyboard]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                // Looping a single slide makes Swiper clone it needlessly and
                // can flash during the fade.
                loop={slides.length > 1}
                speed={800}
                autoplay={
                    slides.length > 1 ? { delay: 3000, disableOnInteraction: false } : false
                }
                keyboard={{ enabled: true }}
                className="w-full"
            >
                {slides.map((slide) => (
                    // data-swiper-autoplay lets each slide override the global
                    // delay with its own configured duration.
                    <SwiperSlide key={slide.id} data-swiper-autoplay={slide.durationMs}>
                        <div className="relative h-140 w-full overflow-hidden sm:h-[70vh] lg:h-[86vh] lg:max-h-215">
                            <HeroMedia slide={slide} />

                            {/* legibility scrims */}
                            <div className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/55 to-ink/5" />
                            <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />

                            <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
                                <div className="max-w-xl pb-16 sm:pb-0">
                                    <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                        {slide.titleParts.lead}
                                        {slide.titleParts.accent && (
                                            <span className="border-b-[5px] border-marigold pb-1">
                                                {slide.titleParts.accent}
                                            </span>
                                        )}
                                        {slide.titleParts.trail}
                                    </h1>

                                    {slide.subtitle && (
                                        <p className="mt-6 max-w-md text-base leading-relaxed text-paper/85 sm:text-lg">
                                            {slide.subtitle}
                                        </p>
                                    )}

                                    <div className="mt-9 flex flex-wrap items-center gap-3">
                                        <Link
                                            to={slide.ctaHref}
                                            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-ink/20 transition hover:bg-paper"
                                        >
                                            {slide.ctaLabel}
                                            <ArrowRight
                                                size={17}
                                                className="transition-transform group-hover:translate-x-0.5"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;

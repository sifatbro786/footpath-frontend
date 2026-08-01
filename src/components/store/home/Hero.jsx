import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { heroSlides } from "../../../data/store/heroData";

import "swiper/css";
import "swiper/css/effect-fade";

const Hero = () => {
    return (
        <section className="relative bg-ink" aria-label="Featured">
            <Swiper
                modules={[Autoplay, EffectFade, A11y, Keyboard]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop
                speed={800}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                keyboard={{ enabled: true }}
                className="w-full"
            >
                {heroSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-140 w-full overflow-hidden sm:h-[70vh] lg:h-[86vh] lg:max-h-215">
                            <img
                                src={slide.image}
                                alt=""
                                aria-hidden="true"
                                className="hero-kenburns absolute inset-0 h-full w-full object-cover object-center"
                            />
                            {/* legibility scrims */}
                            <div className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/55 to-ink/5" />
                            <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />

                            <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
                                <div className="max-w-xl pb-16 sm:pb-0">
                                    <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                        {slide.lead}{" "}
                                        <span className="border-b-[5px] border-marigold pb-1">
                                            {slide.accent}
                                        </span>
                                        {slide.trail}
                                    </h1>

                                    <p className="mt-6 max-w-md text-base leading-relaxed text-paper/85 sm:text-lg">
                                        {slide.blurb}
                                    </p>

                                    <div className="mt-9 flex flex-wrap items-center gap-3">
                                        <Link
                                            to={slide.primary.to}
                                            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-ink/20 transition hover:bg-paper"
                                        >
                                            {slide.primary.label}
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

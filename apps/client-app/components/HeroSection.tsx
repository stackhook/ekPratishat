import Image from "next/image";
import MetallicBackground from "./MetallicBackground";
import HeroCardStack from "./hero/HeroCardStack";
import HeroSearchForm from "./hero/HeroSearchForm";
import NavSentinels from "./hero/NavSentinels";
import { HERO_LOGO_SIZES, HERO_LOGO_SRC } from "./hero/logoAssets";
import { getCachedCategories } from "../data/categories";

const displayCards = [
  {
    heading: "Buy",
    href: "/properties?type=sale",
    image: "/marketing/hero-buy-900.jpg",
    alt: "Premium home exterior with a landscaped entry",
  },
  {
    heading: "Rent",
    href: "/properties?type=rent",
    image: "/marketing/hero-rent-900.jpg",
    alt: "Premium apartment living room with warm natural light",
  },
  {
    heading: "Sell",
    href: "/user/add-property",
    image: "/marketing/hero-sell-900.jpg",
    alt: "Premium modern house with a bright facade",
  },
];

const HeroSection = async () => {
  const categories = await getCachedCategories();

  return (
    <div className="relative w-full font-sans transition-colors duration-300">
      <NavSentinels />

      <section className="relative flex min-h-[var(--viewport-h,100svh)] [--hero-pad-bottom:clamp(1rem,2svh,1.5rem)] [--hero-pad-top:calc(var(--site-nav-height)+0.25rem)] [--hero-row-gap:clamp(1rem,2svh,1.25rem)] items-start overflow-hidden bg-secondary-100 pt-[var(--hero-pad-top)] pb-[var(--hero-pad-bottom)] transition-colors duration-300 dark:bg-[var(--ek-dark-page)] sm:[--hero-pad-top:calc(var(--site-nav-height)+0.375rem)] md:[--hero-pad-bottom:clamp(1.25rem,2.3svh,1.75rem)] lg:min-h-[var(--viewport-h,100svh)] lg:[--hero-pad-bottom:2.5rem] lg:[--hero-pad-top:calc(var(--site-nav-height)+0.75rem)] lg:items-center">
        <MetallicBackground variant="hero" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] px-5 lg:min-h-[calc(var(--viewport-h,100svh)-var(--site-nav-height)-2rem)] lg:items-center lg:px-8">
          {/*
            Two-column hero layout is xl: (≥1280px) only — laptops and
            desktops. iPad portrait (1024×1366) and any other ≥1024px
            portrait viewport stays single-column: vertical stack of
            logo+headline → card stack → search form, distributed via
            content-evenly across the full viewport height. Forcing
            2-col at 1024 portrait caused overlap and a compressed
            search form (the columns were too narrow for either side).
          */}
          <div className="grid min-h-[calc(var(--viewport-h,100svh)-var(--hero-pad-top)-var(--hero-pad-bottom))] w-full content-evenly items-center gap-[var(--hero-row-gap)] xl:min-h-0 xl:content-center xl:grid-cols-[minmax(0,0.82fr)_minmax(500px,1.18fr)] xl:gap-x-3 xl:gap-y-6">
            <div className="relative z-20 order-1 mx-auto w-full max-w-xl sm:max-w-2xl xl:col-start-1 xl:row-start-1 xl:mx-0 xl:max-w-[39rem]">
              <div
                data-logo-slot="hero"
                className="relative mb-2 h-20 w-[7.5rem] min-[390px]:h-24 min-[390px]:w-36 sm:mb-3 sm:h-32 sm:w-48 md:h-36 md:w-56 lg:h-40 lg:w-60 xl:mb-4 xl:h-48 xl:w-72"
                aria-hidden="true"
              >
                <Image
                  src={HERO_LOGO_SRC}
                  alt=""
                  fill
                  sizes={HERO_LOGO_SIZES}
                  className="hero-logo-fallback absolute inset-0 h-full w-full object-contain"
                  priority
                  unoptimized
                />
              </div>

              <h1 className="hero-logo-handoff-copy mb-0 max-w-[min(100%,23rem)] text-[clamp(1.55rem,7vw,2.7rem)] font-extrabold leading-[1.04] tracking-tight text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] transition-colors duration-300 dark:text-[var(--ek-dark-text)] dark:drop-shadow-none sm:max-w-[min(100%,34rem)] sm:text-[clamp(2rem,5.7vw,3rem)] md:text-5xl xl:max-w-[13ch] xl:text-5xl 2xl:text-6xl">
                Real Estate!{" "}
                <span className="block whitespace-nowrap">
                  Ekpratishat{" "}
                  <span className="inline-flex rounded-lg bg-gold-gradient px-2 py-0.5 text-secondary-950 shadow-lg shadow-gold-800/15 sm:px-3 sm:py-1">
                    भए पुग्छ।
                  </span>
                </span>
              </h1>
            </div>

            <div className="order-2 xl:order-3 xl:col-start-2 xl:row-span-2 xl:row-start-1">
              <HeroCardStack cards={displayCards} />
            </div>

            <div className="relative z-20 order-3 mx-auto w-full max-w-xl sm:max-w-2xl xl:order-2 xl:col-start-1 xl:row-start-2 xl:mx-0 xl:max-w-[39rem]">
              <HeroSearchForm categories={categories} />
            </div>
          </div>
        </div>
      </section>

      <div
        className="h-1 w-full bg-gold-gradient dark:opacity-80"
        aria-hidden="true"
      />
    </div>
  );
};

export default HeroSection;

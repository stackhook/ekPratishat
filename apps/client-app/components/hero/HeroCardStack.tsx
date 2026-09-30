"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useHeroPerformanceMode } from "./useHeroPerformanceMode";
import { getStackLayout, type StackLayout } from "./getStackLayout";

export type HeroDisplayCard = {
  heading: string;
  href: string;
  image: string;
  alt: string;
};

type HeroCardStackProps = { cards: HeroDisplayCard[] };

const INTERVAL = 3000;
const TAB_POSITION_CLASSES = [
  "left-4 sm:left-6",
  "left-1/2 -translate-x-1/2",
  "right-4 sm:right-6",
] as const;
const CARD_WIDTH_CLASSES =
  "w-[min(70vw,250px)] min-[360px]:w-[min(72vw,330px)] min-[375px]:w-[min(74vw,340px)] sm:w-[min(66vw,520px)] md:w-[min(50vw,480px)] lg:w-[min(50vw,650px)] xl:w-[min(48vw,720px)] 2xl:w-[min(46vw,790px)]";

export default function HeroCardStack({ cards }: HeroCardStackProps) {
  const [activeCard, setActiveCard] = useState(0);
  const [stackLayout, setStackLayout] = useState<StackLayout>({
    x: 22,
    y: -28,
    rotateY: -7,
    rotateZ: -0.6,
  });
  const shouldReduceMotion = useReducedMotion();
  const { mode } = useHeroPerformanceMode();
  const shouldAutoRotate = !shouldReduceMotion && mode !== "lite";

  const isPausedRef = useRef(false);
  const isInViewportRef = useRef(true);
  const intervalRef = useRef<number | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cardsLengthRef = useRef(cards.length);

  const stopTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    stopTicker();
    intervalRef.current = window.setInterval(() => {
      if (isPausedRef.current) return;
      setActiveCard((current) => (current + 1) % cardsLengthRef.current);
    }, INTERVAL);
  }, [stopTicker]);

  useEffect(() => {
    cardsLengthRef.current = cards.length;
  }, [cards.length]);

  useEffect(() => {
    const updateStackLayout = () => setStackLayout(getStackLayout(mode));
    updateStackLayout();
    window.addEventListener("resize", updateStackLayout);
    return () => window.removeEventListener("resize", updateStackLayout);
  }, [mode]);

  useEffect(() => {
    if (mode === "lite") {
      setActiveCard(0);
    }
  }, [mode]);

  useEffect(() => {
    if (!shouldAutoRotate) {
      stopTicker();
      return;
    }

    const stackNode = stackRef.current;

    const syncTicker = () => {
      if (document.hidden || !isInViewportRef.current || isPausedRef.current) {
        stopTicker();
        return;
      }

      startTicker();
    };

    let observer: IntersectionObserver | null = null;

    if (stackNode && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInViewportRef.current = Boolean(entry?.isIntersecting);
          syncTicker();
        },
        { rootMargin: "160px 0px", threshold: 0.05 },
      );
      observer.observe(stackNode);
    } else {
      isInViewportRef.current = true;
      syncTicker();
    }

    document.addEventListener("visibilitychange", syncTicker);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncTicker);
      stopTicker();
    };
  }, [shouldAutoRotate, startTicker, stopTicker]);

  const handlePause = useCallback(() => {
    isPausedRef.current = true;
    stopTicker();
  }, [stopTicker]);
  const handleResume = useCallback(() => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    if (shouldAutoRotate && isInViewportRef.current && !document.hidden) startTicker();
  }, [shouldAutoRotate, startTicker]);

  const transitionDuration = shouldReduceMotion
    ? 0
    : mode === "full"
      ? 0.8
      : mode === "balanced"
        ? 0.68
        : 0;
  const tabEffectClass = mode === "full" ? "shadow-lg" : "shadow-md";
  const cardShadowClass = mode === "full" ? "shadow-2xl" : "shadow-xl";

  return (
    <div
      ref={stackRef}
      className="relative z-10 mx-auto w-full max-w-[1120px] overflow-visible pb-2 xl:h-[clamp(180px,38vw,520px)] xl:max-w-none xl:-translate-x-4 xl:pb-0 2xl:translate-x-4 min-[1680px]:translate-x-12 min-[1880px]:translate-x-36"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
    >
      {/* Reserves the real stacked-layout height while animated cards stay absolute. */}
      <div
        className={`mx-auto pt-10 sm:pt-14 md:pt-16 xl:hidden ${CARD_WIDTH_CLASSES}`}
        aria-hidden="true"
      >
        <div className="aspect-[16/10]" />
      </div>

      {mode === "full" ? (
        <div
          className="absolute inset-x-8 bottom-4 h-16 rounded-full bg-black/25 blur-3xl sm:bottom-6 sm:h-20 xl:bottom-12 xl:h-24"
          aria-hidden="true"
        />
      ) : mode === "balanced" ? (
        <div
          className="absolute inset-x-10 bottom-5 h-12 rounded-full bg-black/12 sm:bottom-7 sm:h-14 xl:bottom-14 xl:h-16"
          aria-hidden="true"
        />
      ) : null}
      <div
        className="absolute inset-0 w-full [perspective:1200px]"
        aria-label="Featured property options"
      >
        {cards.map((card, index) => {
          const offset = (index - activeCard + cards.length) % cards.length;
          const isActive = offset === 0;
          const tabPositionClass =
            TAB_POSITION_CLASSES[index % TAB_POSITION_CLASSES.length] ??
            TAB_POSITION_CLASSES[0];

          return (
            <motion.article
              key={card.heading}
              className={`absolute left-1/2 top-[59%] aspect-[16/10] overflow-visible xl:top-[56%] ${CARD_WIDTH_CLASSES}`}
              initial={false}
              animate={{
                x: `calc(-50% + ${offset * stackLayout.x}px)`,
                y: `calc(-50% + ${offset * stackLayout.y}px)`,
                rotateY: stackLayout.rotateY,
                rotateZ: stackLayout.rotateZ,
                scale: 1,
                opacity: offset > 2 ? 0 : 1,
              }}
              style={{ zIndex: cards.length - offset }}
              transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={card.href}
                className="group relative block h-full w-full overflow-visible focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-500"
                aria-label={`View ${card.heading.toLowerCase()} properties`}
                prefetch={false}
              >
                <span
                  className={`absolute top-0 z-20 -translate-y-[65%] rounded-t-lg border border-b-0 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] transition-colors sm:-translate-y-[calc(100%-1px)] sm:px-5 sm:py-2 sm:text-base ${tabEffectClass} ${tabPositionClass} ${
                    isActive
                      ? "border-gold-300/80 bg-gold-gradient text-secondary-950 shadow-gold-900/20"
                      : "border-white/50 bg-white/80 text-secondary-900 shadow-secondary-950/10"
                  }`}
                  aria-hidden="true"
                >
                  {card.heading}
                </span>

                <div className={`relative h-full w-full overflow-hidden rounded-lg border border-white/20 bg-secondary-950 ${cardShadowClass}`}>
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    priority={isActive}
                    sizes="(min-width: 1536px) 46vw, (min-width: 1280px) 48vw, (min-width: 1024px) 50vw, (min-width: 768px) 50vw, (min-width: 640px) 66vw, 74vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/10 to-transparent"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Home,
  HousePlus,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { ToggleTheme } from "@repo/components/toggleTheme";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClientLogOut, useGetUserInfo, useLogOut } from "@repo/query-hook";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ScrollLogoTransition from "./hero/ScrollLogoTransition";
import { HERO_LOGO_SRC, NAV_LOGO_SIZES } from "./hero/logoAssets";
import { useHeroPerformanceMode } from "./hero/useHeroPerformanceMode";

const primaryLinks = [
  {
    label: "Properties",
    href: "/properties",
    description: "Browse available homes and spaces.",
  },
  {
    label: "About",
    href: "/about",
    description: "Meet the standard behind the brand.",
  },
  {
    label: "Services",
    href: "/services",
    description: "See how we support property moves.",
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Start a real property conversation.",
  },
];

const propertyLinks = [
  { label: "Buy", href: "/properties?type=sale" },
  { label: "Rent", href: "/properties?type=rent" },
  { label: "Sell", href: "/user/add-property" },
];

const NAV_HEIGHT_MOBILE = 96;
const NAV_HEIGHT_DESKTOP = 112;
const SM_BREAKPOINT = 640;
// Hysteresis sentinel selectors. The actual <div>s are rendered by
// HeroSection (home page) or layout fallbacks for non-home pages.
// Two sentinels create the same enter/exit asymmetry the old scroll
// listener used (40px to enter solid, 12px to exit) without a
// per-frame JS scroll handler.
const NAV_ENTER_SENTINEL_SELECTOR = '[data-nav-sentinel="enter"]';
const NAV_EXIT_SENTINEL_SELECTOR = '[data-nav-sentinel="exit"]';
// Fallback hysteresis values used when sentinels are not present
// (e.g. routes that don't render HeroSection). The thin scroll
// fallback below honors the same numbers as the legacy listener.
const NAV_SOLID_ENTER_Y = 40;
const NAV_SOLID_EXIT_Y = 12;
const LOGO_HANDOFF_MS = 200;
type HomeLogoOwner = "hero" | "transitioning" | "navbar";

const getUserInitials = (name?: string | null) => {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetUserInfo();
  console.log("userData", user);
  const {mutate,isPending} = useLogOut();
  const { mode, isMounted: isHeroPerformanceMounted } = useHeroPerformanceMode();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  /**
   * True for one frame after a route change (and on initial mount).
   * Suppresses the forward hero→navbar handoff when its target was
   * computed from stale `hasScrolled` carried in from the previous
   * route. Without this gate, navigating from a scrolled non-home
   * page (e.g. /about) to / triggers the cross-fade unconditionally
   * — the logo ends up stuck in the navbar slot with no navbar bg,
   * because hasScrolled gets reset to false before the handoff
   * completes, leaving the contradictory state (homeLogoOwner =
   * "navbar" while isSolid = false). After one RAF the IO observer
   * has settled and any real scroll-driven handoff proceeds normally.
   */
  const isFreshNavigationRef = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [homeLogoOwner, setHomeLogoOwner] = useState<HomeLogoOwner>("hero");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) setIsAccountOpen(false);
  }, [user]);

  /**
   * Route-change reset. Two jobs:
   *
   *   1. Force visual state back to "at top of page": hasScrolled =
   *      false, homeLogoOwner = "hero", no docked attribute. Scroll
   *      position is restored to top by the router on forward nav,
   *      so the navbar must match — otherwise stale state from the
   *      previous page leaks into the new one.
   *
   *   2. Raise the `isFreshNavigationRef` gate for one frame so the
   *      homeLogoOwner effect skips the forward (hero→navbar)
   *      handoff. Reason: that effect runs in the same React batch
   *      as this reset, and its closure captures the OLD render's
   *      targetHomeLogoOwner (still "navbar" because hasScrolled
   *      hasn't propagated yet). Without the gate, the forward
   *      handoff fires, sets a 200ms timeout to write "navbar" into
   *      homeLogoOwner, and the second Effect 7 run that should
   *      undo it doesn't reliably win the race on iPad Brave.
   *      Result: the contradictory "navbar logo visible but no
   *      navbar bg" state observed in real-device testing.
   *
   * The RAF clears the gate after one paint, by which point the IO
   * observer (or scroll fallback) has settled the real hasScrolled
   * value. After that, any forward handoff is intentional.
   */
  useEffect(() => {
    isFreshNavigationRef.current = true;
    setHasScrolled(false);
    setHomeLogoOwner("hero");
    delete document.documentElement.dataset.docked;

    const rafId = window.requestAnimationFrame(() => {
      isFreshNavigationRef.current = false;
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    if (!isAccountOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        accountMenuRef.current?.contains(target)
      ) {
        return;
      }

      setIsAccountOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    const syncNavHeight = () => {
      const height =
        window.innerWidth >= SM_BREAKPOINT
          ? NAV_HEIGHT_DESKTOP
          : NAV_HEIGHT_MOBILE;

      document.documentElement.style.setProperty(
        "--site-nav-height",
        `${height}px`,
      );
    };

    syncNavHeight();
    window.addEventListener("resize", syncNavHeight);
    return () => window.removeEventListener("resize", syncNavHeight);
  }, []);

  /**
   * Drives `hasScrolled` (navbar background fade) AND `<html data-docked>`
   * (snap-dock CSS trigger). Two strategies, picked at runtime:
   *
   *   1. PRIMARY — IntersectionObserver on two sentinel <div>s
   *      rendered by HeroSection at document Y = 40px (enter) and 12px
   *      (exit). The asymmetry preserves the original hysteresis
   *      without any per-frame JS during scroll. This path runs on
   *      every page that mounts HeroSection (today: home only).
   *
   *   2. FALLBACK — a thin scroll listener with the same 40/12 numbers.
   *      Used on routes that don't render the sentinels (every page
   *      except home). Cheap; only adjusts a single boolean.
   *
   * Both paths also keep <html data-docked="true|absent"> in sync, so
   * the snap-dock overlay stays in lockstep with the navbar's solid
   * background — single source of truth, no drift.
   */
  useEffect(() => {
    const enterEl = document.querySelector(NAV_ENTER_SENTINEL_SELECTOR);
    const exitEl = document.querySelector(NAV_EXIT_SENTINEL_SELECTOR);
    const supportsIntersectionObserver = typeof IntersectionObserver !== "undefined";

    const applyDockedAttr = (next: boolean) => {
      if (next) {
        document.documentElement.dataset.docked = "true";
      } else {
        delete document.documentElement.dataset.docked;
      }
    };

    if (enterEl && exitEl && supportsIntersectionObserver) {
      // Sentinel observers run on the compositor thread — they don't
      // compete with iOS Safari's native scroll, which is the whole
      // reason for moving away from the per-frame scroll listener.
      let isPastEnter = false;
      let isPastExit = false;

      const computeAndApply = () => {
        // Solid when scrolled past the enter line; un-solid only after
        // scrolling back above the exit line. Both must be checked
        // because the observers fire independently.
        const next = isPastEnter && isPastExit;
        setHasScrolled(next);
        applyDockedAttr(next);
      };

      const enterObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          // Sentinel sits above the viewport top (scrolled past) when
          // it's NOT intersecting. boundingClientRect.top < 0 confirms
          // the direction (above, not below) for safety.
          isPastEnter = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          computeAndApply();
        },
        { threshold: 0 },
      );

      const exitObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isPastExit = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          computeAndApply();
        },
        { threshold: 0 },
      );

      enterObserver.observe(enterEl);
      exitObserver.observe(exitEl);

      return () => {
        enterObserver.disconnect();
        exitObserver.disconnect();
        applyDockedAttr(false);
      };
    }

    // ---- Fallback path: thin scroll listener for non-home routes -------
    let frameId: number | null = null;

    const updateScrolledState = () => {
      frameId = null;
      setHasScrolled((current) => {
        const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
        const next = current
          ? scrollY > NAV_SOLID_EXIT_Y
          : scrollY > NAV_SOLID_ENTER_Y;
        applyDockedAttr(next);
        return next;
      });
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrolledState);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      applyDockedAttr(false);
    };
    // pathname is in the dep array so the effect re-runs after
    // route change (sentinels may appear/disappear with the page).
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.overscrollBehavior =
        originalHtmlOverscrollBehavior;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.body.style.paddingRight = originalBodyPaddingRight;
      const originalScrollBehavior =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    };
  }, [isOpen]);

  const isHomePage = pathname === "/";
  const closeMenu = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
  };
  const isSolid = hasScrolled || isOpen;

  // Two logo paths, one per device class:
  //
  //   shouldUseScrollLogo         → cinematic JS overlay (full tier).
  //                                 Strong devices that handle scroll-tied JS
  //                                 animation smoothly (desktop, S21+, modern
  //                                 Pixels, modern iPhones, etc).
  //
  //   shouldUseStaticLogoHandoff  → cross-fade between the in-flow hero logo
  //                                 and the static navbar logo (balanced + lite).
  //                                 Used for iPad / iPadOS WebKit (where JS
  //                                 scroll-tied jitters), older iPhones, and
  //                                 weak/preference-constrained devices.
  //                                 No fixed-position overlay → no risk of
  //                                 visually colliding with the headline.
  const shouldUseScrollLogo =
    isHomePage && isHeroPerformanceMounted && mode === "full";
  const shouldUseStaticLogoHandoff =
    isHomePage &&
    isHeroPerformanceMounted &&
    (mode === "balanced" || mode === "lite");

  // The cross-fade handoff is driven by the existing `homeLogoOwner`
  // state machine: when scrolled past the dock threshold (`isSolid`
  // is true via the navbar's IntersectionObserver), target the
  // "navbar" owner; the 160ms hold in the transitioning state gives
  // the double-fade a graceful beat between the hero and navbar
  // static logos.
  const targetHomeLogoOwner: HomeLogoOwner =
    shouldUseStaticLogoHandoff && isSolid ? "navbar" : "hero";

  // Static navbar logo visibility:
  //   - With the cinematic overlay rendered, the JS overlay covers
  //     the visible logo — only show the static one when the mobile
  //     menu is open (the overlay is hidden then).
  //   - With the static handoff (balanced/lite), follow `homeLogoOwner`
  //     exactly: visible once the handoff state machine has settled
  //     into "navbar".
  //   - On non-home routes, always show the logo (there's no hero to
  //     hand off from); only the navbar background reacts to scroll.
  const showStaticNavLogo = isHomePage
    ? shouldUseScrollLogo
      ? isOpen
      : homeLogoOwner === "navbar"
    : true;
  const showHandoffNavLogo =
    isHomePage && shouldUseStaticLogoHandoff && homeLogoOwner === "transitioning";
  const shouldShowAuthControl = mounted && !isLoading;
  const userInitials = getUserInitials(user?.name);

  useEffect(() => {
    if (!shouldUseStaticLogoHandoff) {
      setHomeLogoOwner("hero");
      return;
    }

    let timeoutId: number | null = null;

    setHomeLogoOwner((current) => {
      if (current === targetHomeLogoOwner) return current;

      // Fresh-navigation gate. If pathname JUST changed (within the
      // current frame), `targetHomeLogoOwner` may be "navbar" only
      // because hasScrolled hasn't yet been reset by the route-change
      // effect — there was no real scroll event on this page. Force
      // back to "hero" instead of firing the forward handoff timer
      // that would otherwise leave the logo stuck in the navbar slot
      // with no navbar bg. RAF in the reset effect lowers this gate
      // after the IO observer / scroll fallback settles.
      if (isFreshNavigationRef.current && targetHomeLogoOwner === "navbar") {
        return "hero";
      }

      // Asymmetric handoff.
      //
      // Forward (hero → navbar): the in-flow hero logo has scrolled
      // out of viewport by the time we cross the dock threshold, so
      // we go through "transitioning" to let the handoff nav logo
      // fade in BEFORE the static nav logo settles. That bridge
      // prevents a one-frame gap in the navbar slot.
      //
      // Reverse (* → hero): the in-flow hero logo is already back in
      // view from natural scroll, so the nav slot doesn't need a
      // bridge — anything we cross-fade through there just lingers
      // visibly while the hero logo is also visible below the navbar.
      // Skip "transitioning" entirely and let the static nav logo
      // fade out cleanly in 100ms (its closed-state CSS duration).
      //
      // This is the iOS Safari pull-back fix: on momentum scroll the
      // IntersectionObserver fires late; adding our own 160ms timer
      // + 100ms delay + 100ms fade on top produced a visible ~360ms
      // window where both logos overlapped. The straight-to-"hero"
      // path collapses that to a single 100ms fade aligned with the
      // moment the observer fires.
      if (targetHomeLogoOwner === "hero") {
        return "hero";
      }

      timeoutId = window.setTimeout(() => {
        setHomeLogoOwner(targetHomeLogoOwner);
      }, LOGO_HANDOFF_MS);

      return "transitioning";
    });

    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [shouldUseStaticLogoHandoff, targetHomeLogoOwner]);

  useLayoutEffect(() => {
    if (!isHomePage || shouldUseScrollLogo) {
      delete document.documentElement.dataset.homeLogoOwner;
      return;
    }

    document.documentElement.dataset.homeLogoOwner = homeLogoOwner;

    return () => {
      delete document.documentElement.dataset.homeLogoOwner;
    };
  }, [homeLogoOwner, isHomePage, shouldUseScrollLogo]);

  const handleLogout = async () => {
    mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message || "Logout Successfully");
        // queryClient.clear();
        // router.replace("/");
      }
    })
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-transparent">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[rgba(247,243,234,0.84)] backdrop-blur-none transition-opacity duration-150 ease-out dark:bg-[var(--ek-dark-nav)] sm:backdrop-blur-sm lg:backdrop-blur-md ${
          isSolid ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[rgba(154,106,0,0.12)] transition-opacity duration-150 ease-out dark:bg-[rgba(229,184,62,0.10)] ${
          isSolid ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-opacity duration-150 ease-out dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)] ${
          isSolid ? "opacity-100" : "opacity-0"
        }`}
      />
      {/*
        Tier-routed logo. The full tier (capable devices: desktop,
        S21+, modern Pixels, modern iPhones, etc) renders the
        scroll-tied JS overlay. Balanced + lite tiers render no
        overlay — the cross-fade between the in-flow hero logo and
        the static navbar logo (driven by `homeLogoOwner` above)
        handles the visual handoff cleanly with zero risk of
        colliding with the headline mid-scroll.
      */}
      {shouldUseScrollLogo ? <ScrollLogoTransition isMenuOpen={isOpen} /> : null}

      <div className="relative z-50 mx-auto flex h-24 w-full max-w-[1500px] items-center justify-between px-5 sm:h-28 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center rounded-lg focus:outline-none focus-visible:outline-none"
          onClick={closeMenu}
          aria-label="Go to Ekpratishat home"
        >
          <span
            data-logo-slot="navbar"
            className="relative block h-14 w-20 sm:h-16 sm:w-24 lg:h-[4.5rem] lg:w-28 xl:h-20 xl:w-32"
            aria-hidden="true"
          >
            <Image
              src={HERO_LOGO_SRC}
              alt=""
              fill
              sizes={NAV_LOGO_SIZES}
              className={`object-contain transition-opacity ${
                showStaticNavLogo ? "opacity-100 duration-300" : "opacity-0 duration-200"
              }`}
              priority
              unoptimized
            />
            <Image
              src={HERO_LOGO_SRC}
              alt=""
              fill
              sizes={NAV_LOGO_SIZES}
              className={`object-contain transition-opacity ${
                showHandoffNavLogo
                  ? "opacity-100 duration-200"
                  : "opacity-0 delay-75 duration-200"
              }`}
              priority
              unoptimized
            />
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/user/add-property"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold-gradient text-[#100d08] shadow-lg shadow-gold-800/15 transition hover:bg-gold-gradient-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-auto sm:w-auto sm:px-4 sm:py-3 lg:px-5"
            onClick={closeMenu}
            aria-label="List your property"
            prefetch={false}
          >
            <HousePlus className="h-5 w-5 sm:hidden" aria-hidden="true" />
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] sm:inline lg:hidden">
              List
            </span>
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] lg:inline">
              List Property
            </span>
          </Link>
          

          <div ref={accountMenuRef} className="relative">
            {shouldShowAuthControl ? (
              user ? (
                <>
                  <button
                    type="button"
                    aria-expanded={isAccountOpen}
                    aria-controls="account-menu"
                    aria-label="Open account menu"
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(154,106,0,0.16)] bg-[rgba(255,253,248,0.86)] px-2 text-secondary-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md transition-colors hover:border-[var(--ek-border-strong)] hover:bg-[rgba(255,253,248,0.96)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:border-white/[0.12] dark:bg-white/[0.055] dark:text-[var(--ek-dark-text)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:hover:border-[rgba(229,184,62,0.24)] dark:hover:bg-white/[0.085] sm:px-2.5"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAccountOpen((current) => !current);
                    }}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-[rgba(154,106,0,0.18)] bg-[rgba(214,169,54,0.16)] text-[11px] font-black uppercase tracking-[0.02em] text-[var(--ek-gold-text)] shadow-inner shadow-white/50 dark:border-[rgba(239,199,90,0.24)] dark:bg-[rgba(239,199,90,0.14)] dark:text-[var(--ek-dark-gold)] dark:shadow-none">
                      {userInitials}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-secondary-500 transition-transform dark:text-[var(--ek-dark-muted)] ${
                        isAccountOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id="account-menu"
                    className={`absolute right-0 top-full z-[70] mt-3 w-64 overflow-hidden rounded-xl border border-[#e5d8c7] bg-[rgba(255,253,248,0.98)] text-secondary-950 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.42)] transition-[opacity,transform,visibility] duration-150 ease-out dark:border-[rgba(239,199,90,0.18)] dark:bg-[#28231a] dark:text-[var(--ek-dark-text)] dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.9)] ${
                      isAccountOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="border-b border-[#e5d8c7] px-4 py-3 dark:border-[rgba(239,199,90,0.14)] dark:bg-[#2f291f]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary-500 dark:text-[var(--ek-dark-muted)]">
                        Account
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-secondary-950 dark:text-[var(--ek-dark-text)]">
                        {user.name}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/user/my-listings"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-[#f8f1e3] hover:text-secondary-950 focus:outline-none focus-visible:bg-[#f8f1e3] dark:text-[var(--ek-dark-muted)] dark:hover:bg-[rgba(239,199,90,0.10)] dark:hover:text-[var(--ek-dark-text)]"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Home className="h-4 w-4" aria-hidden="true" />
                        My Listings
                      </Link>
                      <Link
                        href="/user/my-favourites"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-[#f8f1e3] hover:text-secondary-950 focus:outline-none focus-visible:bg-[#f8f1e3] dark:text-[var(--ek-dark-muted)] dark:hover:bg-[rgba(239,199,90,0.10)] dark:hover:text-[var(--ek-dark-text)]"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Heart className="h-4 w-4" aria-hidden="true" />
                        My Favourites
                      </Link>
                    </div>

                    <div className="border-t border-[#e5d8c7] p-2 dark:border-[rgba(239,199,90,0.14)] dark:bg-[#2f291f]">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10"
                        onClick={handleLogout}
                        disabled = {isPending}
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {isPending ? "Logging Out" : "LogOut"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-lg border border-[rgba(154,106,0,0.18)] bg-[rgba(255,253,248,0.9)] text-secondary-950 shadow-lg shadow-black/10 transition-colors hover:border-[var(--ek-border-strong)] hover:bg-[rgba(255,253,248,0.98)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:border-white/[0.12] dark:bg-white/[0.045] dark:text-[var(--ek-dark-text)] dark:hover:border-[rgba(229,184,62,0.22)] dark:hover:bg-white/[0.075] sm:w-auto sm:px-4"
                  onClick={() => {
                    setIsOpen(false);
                    setIsAccountOpen(false);
                  }}
                  aria-label="Sign in"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden text-xs font-bold uppercase tracking-[0.16em] sm:inline">
                    Sign In
                  </span>
                </Link>
              )
            ) : (
              <button
                type="button"
                className="inline-flex h-10 w-10 cursor-default items-center justify-center gap-2 rounded-lg border border-[rgba(154,106,0,0.16)] bg-[rgba(255,253,248,0.72)] text-secondary-500 shadow-lg shadow-black/5 transition-none dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-[var(--ek-dark-muted)] sm:w-auto sm:px-4"
                aria-label="Checking account status"
                disabled
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span className="hidden text-xs font-bold uppercase tracking-[0.16em] sm:inline">
                  Account
                </span>
              </button>
            )}
          </div>

          <div className="hidden sm:block">
            <ToggleTheme />
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="site-menu-panel"
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-lg shadow-black/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 sm:px-4 ${
              isSolid
                ? "border border-[rgba(154,106,0,0.18)] bg-[rgba(255,253,248,0.9)] text-secondary-950 hover:border-[var(--ek-border-strong)] hover:bg-[rgba(255,253,248,0.98)] dark:border-white/[0.12] dark:bg-white/[0.045] dark:text-[var(--ek-dark-text)] dark:hover:border-[rgba(229,184,62,0.22)] dark:hover:bg-white/[0.075]"
                : "border border-[rgba(154,106,0,0.16)] bg-[rgba(255,253,248,0.78)] text-secondary-950 hover:border-[var(--ek-border-strong)] hover:bg-[rgba(255,253,248,0.94)] dark:border-white/[0.12] dark:bg-white/[0.045] dark:text-[var(--ek-dark-text)] dark:hover:border-[rgba(229,184,62,0.22)] dark:hover:bg-white/[0.075]"
            }`}
            onClick={() => {
              setIsAccountOpen(false);
              setIsOpen((current) => !current);
            }}
          >
            <span className="hidden sm:inline">
              {isOpen ? "Close" : "Menu"}
            </span>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="site-menu-panel"
        aria-hidden={!isOpen}
        className={`fixed inset-x-0 top-[var(--site-nav-height)] z-40 overflow-y-auto border-b border-white/45 bg-[#f8f5ef] px-5 pt-5 shadow-2xl shadow-secondary-900/10 backdrop-blur-none transition-[opacity,transform,visibility] duration-300 ease-out dark:border-[rgba(229,184,62,0.10)] dark:bg-[#171512] dark:shadow-black/40 sm:px-6 sm:pt-6 sm:backdrop-blur-sm lg:px-8 lg:backdrop-blur-md ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-6 opacity-0"
        }`}
        style={{
          maxHeight: "calc(100dvh - var(--site-nav-height))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(229,184,62,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_48%)] opacity-0 dark:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#dfd2c0] dark:bg-[var(--ek-dark-border-strong)]" />

        <div className="relative mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#dfd2c0] pb-6 dark:border-[var(--ek-dark-border)] sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold-700">
                Navigation
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-secondary-950 dark:text-[var(--ek-dark-text)] sm:text-4xl">
                Choose your path.
              </p>
            </div>
            <p className="max-w-sm text-sm font-medium leading-6 text-secondary-600 dark:text-[var(--ek-dark-muted)]">
              Find, list, or talk with the team without losing the premium calm.
            </p>
          </div>

          <div className="grid min-h-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] lg:items-start">
            <div className="grid min-h-0 gap-2">
              {primaryLinks.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative overflow-hidden rounded-lg border border-transparent px-2 py-4 text-secondary-950 transition hover:border-white/60 hover:bg-white/45 hover:shadow-[0_20px_70px_-48px_rgba(15,23,42,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:text-[var(--ek-dark-text)] dark:hover:border-[var(--ek-dark-border)] dark:hover:bg-[rgba(40,35,26,0.80)] sm:px-5 sm:py-5"
                  onClick={closeMenu}
                >
                  <span className="absolute inset-y-4 left-0 w-[3px] origin-top scale-y-0 bg-gold-gradient transition duration-300 group-hover:scale-y-100" />

                  <span className="flex items-center justify-between gap-4">
                    <span className="flex min-w-0 items-baseline gap-3 sm:gap-4">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-gold-700">
                        0{index + 1}
                      </span>
                      <span className="truncate text-2xl font-black tracking-tight min-[360px]:text-3xl sm:text-5xl">
                        {item.label}
                      </span>
                    </span>

                    <ArrowUpRight className="h-4 w-4 flex-none text-secondary-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-700 sm:h-5 sm:w-5" />
                  </span>

                  <span className="mt-2 block pl-[2.8rem] text-sm font-medium text-secondary-500 transition group-hover:text-secondary-700 dark:text-[var(--ek-dark-soft)] dark:group-hover:text-[var(--ek-dark-muted)] sm:pl-[3.6rem]">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-lg border border-white/65 bg-white/70 p-5 text-secondary-950 shadow-[0_24px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur-md dark:border-[rgba(229,184,62,0.22)] dark:bg-[linear-gradient(160deg,rgba(40,35,26,0.98),rgba(29,26,22,0.96))] dark:text-[var(--ek-dark-text)] dark:shadow-[0_28px_90px_-52px_rgba(0,0,0,0.72)] sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary-500 dark:text-[var(--ek-dark-gold)]">
                Property Pathways
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-secondary-950 dark:text-[var(--ek-dark-text)]">
                Buy, rent, or list with clarity.
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {propertyLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-lg border border-white/65 bg-white/60 px-3 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-secondary-900 transition hover:border-gold-500/70 hover:bg-white/85 hover:text-gold-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:border-[var(--ek-dark-border)] dark:bg-[rgba(247,241,227,0.08)] dark:text-[var(--ek-dark-text)] dark:hover:border-[var(--ek-dark-border-strong)] dark:hover:bg-[rgba(229,184,62,0.14)] dark:hover:text-[var(--ek-dark-text)]"
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                    <span className="mx-auto mt-2 block h-px w-5 bg-gold-500 transition group-hover:w-8" />
                  </Link>
                ))}
              </div>

              <div className="mt-5 border-t border-[#e5d8c7] pt-5 dark:border-[var(--ek-dark-border)] sm:hidden">
                <ToggleTheme />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloudLightning,
  Radio,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

// isMobile is checked once at module level to avoid per-render overhead
const isMobileDevice =
  typeof window !== "undefined" && window.innerWidth < 768;

function AnimatedTitle({ title }) {
  const headingRef = useRef(null);

  // On mobile: skip the whole character-by-character interval storm.
  // Start as "visible" immediately so we use a single CSS fadeIn instead.
  const [isVisible, setIsVisible] = useState(
    () =>
      isMobileDevice ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window),
  );
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(
    // On mobile render all chars at once from the start
    () => (isMobileDevice ? Array.from(title).length : 0),
  );
  const characters = Array.from(title);

  // Intersection observer — only needed on desktop path
  useEffect(() => {
    if (isMobileDevice) return; // mobile already shows text immediately
    const heading = headingRef.current;
    if (!heading || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, [isVisible]);

  // Character-reveal loop — desktop only, uses RAF-batched setTimeout
  useEffect(() => {
    if (isMobileDevice) return;
    if (!isVisible || characters.length === 0) return;

    let nextCharacter = 0;
    let timeoutId;

    const revealNextCharacter = () => {
      nextCharacter += 1;
      setVisibleCharacterCount(nextCharacter);
      if (nextCharacter < characters.length) {
        // 34ms ≈ ~2 frames at 60fps — acceptable on desktop, skip on mobile
        timeoutId = window.setTimeout(revealNextCharacter, 34);
      }
    };

    revealNextCharacter();
    return () => window.clearTimeout(timeoutId);
  }, [characters.length, isVisible]);

  // Mobile: render plain text with a single lightweight CSS animation
  if (isMobileDevice) {
    return (
      <h3
        ref={headingRef}
        className="text-xl sm:text-2xl font-black text-white tracking-tight animate-fadeIn"
      >
        {title}
      </h3>
    );
  }

  // Desktop: character-by-character reveal
  return (
    <h3
      ref={headingRef}
      aria-label={title}
      className="text-xl sm:text-2xl font-black text-white group-hover:text-white transition-colors tracking-tight"
    >
      {characters.slice(0, visibleCharacterCount).map((character, index) => (
        <span
          aria-hidden="true"
          className="bento-title-character is-visible"
          key={`${index}-${character}`}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </h3>
  );
}

export default function V4BentoGrid() {
  const { t } = useTranslation();

  const capabilities = [
    {
      id: "edge",
      icon: CloudLightning,
      title: t("v4.bento.items.edge.title"),
      tag: t("v4.bento.items.edge.tag"),
      description: t("v4.bento.items.edge.description"),
      badge: t("v4.bento.items.edge.badge"),
      gradient: "from-cyan-500/10 via-violet-500/5 to-transparent",
      glowColor: "rgba(6, 182, 212, 0.15)",
      border: "hover:border-cyan-400/50",
      accent: "text-cyan-400",
      span: "lg:col-span-8",
    },
    {
      id: "realtime",
      icon: Radio,
      title: t("v4.bento.items.realtime.title"),
      tag: t("v4.bento.items.realtime.tag"),
      description: t("v4.bento.items.realtime.description"),
      badge: t("v4.bento.items.realtime.badge"),
      gradient: "from-fuchsia-500/10 via-purple-500/5 to-transparent",
      glowColor: "rgba(217, 70, 239, 0.15)",
      border: "hover:border-fuchsia-400/50",
      accent: "text-fuchsia-400",
      span: "lg:col-span-4",
    },
    {
      id: "ai",
      icon: Cpu,
      title: t("v4.bento.items.ai.title"),
      tag: t("v4.bento.items.ai.tag"),
      description: t("v4.bento.items.ai.description"),
      badge: t("v4.bento.items.ai.badge"),
      gradient: "from-violet-500/10 via-indigo-500/5 to-transparent",
      glowColor: "rgba(139, 92, 246, 0.15)",
      border: "hover:border-violet-400/50",
      accent: "text-violet-400",
      span: "lg:col-span-4",
    },
    {
      id: "db",
      icon: Database,
      title: t("v4.bento.items.db.title"),
      tag: t("v4.bento.items.db.tag"),
      description: t("v4.bento.items.db.description"),
      badge: t("v4.bento.items.db.badge"),
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      glowColor: "rgba(16, 185, 129, 0.15)",
      border: "hover:border-emerald-400/50",
      accent: "text-emerald-400",
      span: "lg:col-span-4",
    },
    {
      id: "frontend",
      icon: ShieldCheck,
      title: t("v4.bento.items.frontend.title"),
      tag: t("v4.bento.items.frontend.tag"),
      description: t("v4.bento.items.frontend.description"),
      badge: t("v4.bento.items.frontend.badge"),
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      glowColor: "rgba(245, 158, 11, 0.15)",
      border: "hover:border-amber-400/50",
      accent: "text-amber-400",
      span: "lg:col-span-4",
    },
  ];

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Background Ambient Glow — desktop only (heavy GPU cost on mobile) */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-violet-600/10 to-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span>{t("v4.bento.badge")}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("v4.bento.title")}{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            {t("v4.bento.titleHighlight")}
          </span>
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mt-3 font-normal leading-relaxed">
          {t("v4.bento.description")}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {capabilities.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={`${c.span} relative rounded-2xl sm:rounded-3xl bg-gradient-to-br ${c.gradient} bg-gray-950/80 border border-white/10 ${c.border} p-5 sm:p-8 sm:backdrop-blur-2xl shadow-xl sm:shadow-2xl sm:transition-all sm:duration-500 sm:hover:scale-[1.01] sm:hover:-translate-y-1.5 group overflow-hidden`}
            >
              {/* Subtle Ambient Radial Glow — hidden on mobile to avoid GPU layer */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-0 sm:opacity-20 sm:group-hover:opacity-60 sm:transition-opacity duration-700"
                style={{ backgroundColor: c.glowColor }}
              />

              {/* Shimmer sweep — desktop only */}
              <div className="hidden sm:block pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

              {/* Top shimmer line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-center justify-between mb-5 sm:mb-6 relative z-10">
                <div
                  className={`p-3 rounded-2xl bg-gray-900/90 border border-white/10 ${c.accent} shadow-lg shadow-black/40 sm:group-hover:scale-110 sm:group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] sm:transition-all duration-300`}
                >
                  <Icon size={24} />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/15 text-gray-200 shadow-sm">
                  {c.badge}
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  {c.tag}
                </div>
                <AnimatedTitle key={`${c.id}-${c.title}`} title={c.title} />
                <p className="text-gray-300 text-sm leading-relaxed pt-1 font-normal">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

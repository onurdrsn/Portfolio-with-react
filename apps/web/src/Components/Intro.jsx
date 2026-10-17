import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Copy, Check } from "lucide-react";

export default function Intro() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("onurdrsn@gmail.com");
    setCopied(true);
    toast.success(t("hero.copied") || "E-posta adresi kopyalandı!");
    setTimeout(() => setCopied(false), 2200);
  };

  const techStack = [
    "Cloudflare Workers",
    "TypeScript",
    "React 19",
    "Hono.js",
    "Neon Postgres",
    "Drizzle ORM",
    "WebSockets",
    "Workers AI",
  ];

  return (
    <header className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-ink-line text-paper">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Typographic Name & Title */}
        <motion.div
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          transition={springTransition}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-paper">
            Onur Dursun
          </h1>

          <p className="text-lg sm:text-2xl font-medium text-paper tracking-tight">
            {t("hero.title") || "Senior Full Stack & Distributed Systems Architect"}
          </p>

          <p className="text-base sm:text-lg text-paper-muted leading-relaxed max-w-2xl pt-2 font-normal">
            {t("hero.description") ||
              "Modern web mimarileri, Cloudflare Workers sunucusuz sistemler, yüksek eşzamanlı WebSocket altyapıları ve uç zeka modelleri tasarlayan sistem mimarı."}
          </p>
        </motion.div>

        {/* Action Controls with Spring Micro-interactions */}
        <motion.div
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          transition={{ ...springTransition, delay: shouldReduceMotion ? 0 : 0.08 }}
          className="mt-10 flex flex-wrap gap-4 items-center"
        >
          <motion.a
            href="#projects"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            transition={springTransition}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-paper text-ink font-semibold text-sm hover:bg-white transition-colors border border-transparent shadow-sm cursor-pointer"
          >
            <span>{t("hero.viewWork") || "Projelerimi Keşfet"}</span>
            <ArrowUpRight size={16} />
          </motion.a>

          <motion.button
            type="button"
            onClick={handleCopyEmail}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            transition={springTransition}
            aria-label="onurdrsn@gmail.com"
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-md bg-ink-raised hover:bg-ink-hover border border-ink-line text-paper font-medium text-sm transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-signal" />
                <span className="text-signal font-semibold">
                  {t("hero.copied") || "Kopyalandı!"}
                </span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-paper-subtle" />
                <span className="font-code text-xs sm:text-sm">onurdrsn@gmail.com</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Architecture Stack Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springTransition, delay: shouldReduceMotion ? 0 : 0.12 }}
          className="mt-12 pt-8 border-t border-ink-line flex flex-wrap gap-2 items-center"
        >
          <span className="text-xs text-paper-subtle font-medium mr-2">
            Engine Stack:
          </span>
          {techStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-2.5 py-1 rounded border border-ink-line bg-ink-raised text-paper-muted text-xs font-code"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* Minimalist Metrics Grid (Zero Layout Shift) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...springTransition, delay: shouldReduceMotion ? 0 : 0.16 }}
          className="grid grid-cols-3 gap-6 mt-8 max-w-xl"
        >
          <div className="border-l-2 border-ink-line-strong pl-4">
            <div className="text-2xl sm:text-3xl font-bold font-code text-paper">35+</div>
            <div className="text-xs text-paper-subtle uppercase tracking-wider mt-1">
              {t("hero.stats.projects") || "Tamamlanan Proje"}
            </div>
          </div>
          <div className="border-l-2 border-ink-line-strong pl-4">
            <div className="text-2xl sm:text-3xl font-bold font-code text-signal">&lt;15ms</div>
            <div className="text-xs text-paper-subtle uppercase tracking-wider mt-1">
              {t("hero.stats.experience") || "Edge Gecikmesi"}
            </div>
          </div>
          <div className="border-l-2 border-ink-line-strong pl-4">
            <div className="text-2xl sm:text-3xl font-bold font-code text-paper">100%</div>
            <div className="text-xs text-paper-subtle uppercase tracking-wider mt-1">
              {t("hero.stats.quality") || "Uptime & Kalite"}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
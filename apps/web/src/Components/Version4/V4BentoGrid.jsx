import React from "react";
import { useTranslation } from "react-i18next";
import {
  CloudLightning,
  Radio,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-violet-600/10 to-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {capabilities.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={`${c.span} relative rounded-3xl bg-gradient-to-br ${c.gradient} bg-gray-950/70 border border-white/10 ${c.border} p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1.5 group overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`}
            >
              {/* Subtle Ambient Radial Glow on Hover */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700"
                style={{ backgroundColor: c.glowColor }}
              />

              {/* Shimmer Light Reflection Sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div
                  className={`p-3 rounded-2xl bg-gray-900/90 border border-white/10 ${c.accent} shadow-lg shadow-black/40 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 backdrop-blur-md`}
                >
                  <Icon size={24} />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/15 text-gray-200 backdrop-blur-md shadow-sm">
                  {c.badge}
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  {c.tag}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-white transition-colors tracking-tight">
                  {c.title}
                </h3>
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

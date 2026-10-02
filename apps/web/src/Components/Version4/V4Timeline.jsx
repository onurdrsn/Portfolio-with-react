import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { Briefcase, Calendar, Building, ChevronRight } from "lucide-react";

export default function V4Timeline() {
  const { t } = useTranslation();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiGet("/api/timeline", { silent: true })
      .then((data) => {
        if (isMounted) {
          setTimeline(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setTimeline([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative scroll-mt-20" id="experience">
      {/* Background Ambient Glow — desktop only */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <Briefcase size={13} className="text-violet-400" />
          <span>{t("v4.timeline.badge")}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("v4.timeline.title")}{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            {t("v4.timeline.titleHighlight")}
          </span>
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto mt-3 font-normal leading-relaxed">
          {t("v4.timeline.description")}
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-violet-900/40 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative group">
            {/* Glowing Node on Axis */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-gray-950 border-2 border-violet-500 flex items-center justify-center shadow-lg shadow-violet-950/60 sm:group-hover:scale-125 sm:group-hover:border-cyan-400 sm:group-hover:bg-violet-600 sm:transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>

            {/* Content Card (Morphism Style) */}
            <div className="relative rounded-2xl sm:rounded-3xl bg-gray-900/90 sm:bg-gray-950/70 border border-white/10 hover:border-violet-500/40 p-5 sm:p-8 sm:backdrop-blur-2xl shadow-lg sm:shadow-xl sm:hover:shadow-[0_8px_30px_rgba(139,92,246,0.18)] sm:transition-all duration-300 sm:group-hover:-translate-y-1 overflow-hidden">
              {/* Top shimmer line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Shimmer sweep — desktop only */}
              <div className="hidden sm:block pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-mono font-bold bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full backdrop-blur-md">
                    {item.year}
                  </span>
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Calendar size={12} /> {item.duration}
                  </span>
                </div>
                {item.company && (
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 bg-white/[0.04] px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                    <Building size={12} className="text-violet-400" /> {item.company}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors tracking-tight relative z-10">
                {item.title}
              </h3>

              {Array.isArray(item.details) && item.details.length > 0 && (
                <ul className="space-y-2 text-sm text-gray-300 relative z-10 font-normal">
                  {item.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5">
                      <ChevronRight size={15} className="text-violet-400 mt-1 shrink-0" />
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

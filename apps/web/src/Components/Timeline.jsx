import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { apiGet } from "../lib/api";
import TimelineItem from "./TimelineItem";
import { Briefcase, RefreshCw, Milestone } from "lucide-react";

// Zero-CLS Skeleton for Timeline
function TimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="relative pl-8 sm:pl-10 pb-8">
          <div className="absolute left-3 sm:left-3.5 top-3 bottom-0 w-px bg-ink-line" />
          <div className="absolute left-3 sm:left-3.5 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-ink-line-strong" />
          <div className="rounded-lg border border-ink-line bg-ink-raised p-6 space-y-3">
            <div className="h-4 w-28 bg-ink rounded" />
            <div className="h-6 w-1/2 bg-ink rounded" />
            <div className="h-4 w-5/6 bg-ink rounded" />
            <div className="h-4 w-2/3 bg-ink rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Timeline() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const fetchTimeline = useCallback(() => {
    setLoading(true);
    setError(null);
    apiGet("/api/timeline", { silent: true })
      .then((data) => {
        setTimeline(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching timeline:", err);
        setError("Kariyer geçmişi yüklenirken bir bağlantı hatası oluştu.");
        setTimeline([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-paper" id="experience">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 pb-6 border-b border-ink-line">
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-paper">
            {t("experience.title") || "Kariyer &"} {t("experience.titleHighlight") || "Zaman Çizelgesi"}
          </h2>
        </div>
        <p className="text-sm text-paper-muted max-w-sm font-normal">
          {t("experience.subtitle") ||
            "Geliştirdiğim sistemler, yazılım mimarileri ve mühendislik kilometre taşları."}
        </p>
      </div>

      {/* Main Timeline Content */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="timeline-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TimelineSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="timeline-error"
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-danger/30 bg-ink-raised p-8 text-center space-y-4"
          >
            <p className="text-sm font-code text-danger">{error}</p>
            <button
              type="button"
              onClick={fetchTimeline}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink border border-ink-line text-xs font-code text-paper hover:bg-ink-hover transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Yeniden Dene / Retry</span>
            </button>
          </motion.div>
        ) : timeline.length === 0 ? (
          <motion.div
            key="timeline-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-ink-line bg-ink-raised p-12 text-center space-y-3"
          >
            <Milestone size={32} className="mx-auto text-paper-subtle" />
            <h3 className="text-base font-bold text-paper">
              Henüz kariyer kaydı bulunamadı
            </h3>
            <p className="text-xs text-paper-muted">
              Kariyer zaman çizelgesi verileri henüz eklenmemiş.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="timeline-list"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.04,
                },
              },
            }}
            className="relative"
          >
            {timeline.map((item, index) => (
              <motion.div
                key={item.id || index}
                variants={{
                  hidden: { opacity: 0, transform: "translateY(12px)" },
                  visible: { opacity: 1, transform: "translateY(0)" },
                }}
                transition={springTransition}
              >
                <TimelineItem
                  year={item.year}
                  company={item.company}
                  title={item.title}
                  duration={item.duration}
                  details={item.details}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Building2, Calendar, CheckCircle2 } from "lucide-react";

export default function TimelineItem({ year, company, title, duration, details = [] }) {
  const detailsList = Array.isArray(details) ? details : [details].filter(Boolean);
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  return (
    <div className="relative pl-8 sm:pl-10 pb-12 group last:pb-4">
      {/* Editorial Vertical Timeline Rule */}
      <div className="absolute left-3 sm:left-3.5 top-3 bottom-0 w-px bg-ink-line-strong group-last:bg-transparent" />

      {/* Monochromatic Status Node */}
      <div className="absolute left-3 sm:left-3.5 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-paper border-2 border-ink group-hover:scale-125 group-hover:bg-signal transition-transform duration-200" />

      {/* Editorial Card with Spring Micro-interaction */}
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        transition={springTransition}
        className="rounded-lg border border-ink-line bg-ink-raised p-6 hover:border-ink-line-strong transition-colors text-paper"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[11px] font-code font-bold bg-ink border border-ink-line text-signal rounded flex items-center gap-1">
                <Calendar size={11} /> {year}
              </span>
              {duration && (
                <span className="text-xs text-paper-subtle font-code">
                  · {duration}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-paper tracking-tight">
              {title}
            </h3>
          </div>

          {company && (
            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-xs font-code text-paper-muted border border-ink-line rounded">
                <Building2 size={13} className="text-paper-subtle" />
                {company}
              </span>
            </div>
          )}
        </div>

        {/* Details list */}
        {detailsList.length > 0 && (
          <ul className="space-y-2 pt-2 border-t border-ink-line">
            {detailsList.map((detail, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs sm:text-sm text-paper-muted leading-relaxed font-normal"
              >
                <CheckCircle2 size={14} className="text-signal mt-0.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

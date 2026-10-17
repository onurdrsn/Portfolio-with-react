import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { Calendar, Building, ChevronRight } from "lucide-react";
import { Container, Section, SectionHeader } from "./V4Primitives";

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
    <Section id="experience" labelledBy="timeline-title" className="bg-ink text-paper scroll-mt-20">
      <Container>
        {/* Section Header */}
        <div className="mb-12">
          <SectionHeader
            index="03"
            eyebrow={t("v4.timeline.badge")}
            title={
              <>
                {t("v4.timeline.title")}{" "}
                <span className="text-paper-muted">{t("v4.timeline.titleHighlight")}</span>
              </>
            }
            description={t("v4.timeline.description")}
            titleId="timeline-title"
          />
        </div>

        {/* Clean Swiss Timeline Stream */}
        <div className="border-l border-ink-line ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-8 sm:space-y-10">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Minimal Node on Axis */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-ink border-2 border-paper-subtle group-hover:border-paper transition-colors"
                aria-hidden="true"
              />

              {/* Card */}
              <div className="rounded-lg border border-ink-line bg-ink-raised p-5 sm:p-7 hover:border-ink-line-strong transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-code text-xs px-2.5 py-0.5 rounded bg-ink border border-ink-line text-signal">
                      {item.year}
                    </span>
                    {item.duration && (
                      <span className="text-xs text-paper-subtle flex items-center gap-1 font-code">
                        <Calendar size={12} aria-hidden="true" /> {item.duration}
                      </span>
                    )}
                  </div>
                  {item.company && (
                    <span className="text-xs font-medium text-paper flex items-center gap-1.5">
                      <Building size={13} className="text-paper-subtle" aria-hidden="true" /> {item.company}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-paper mb-3 tracking-tight">
                  {item.title}
                </h3>

                {Array.isArray(item.details) && item.details.length > 0 && (
                  <ul className="space-y-2 text-sm text-paper-muted font-normal">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2.5 leading-relaxed">
                        <ChevronRight size={15} className="text-paper-subtle mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

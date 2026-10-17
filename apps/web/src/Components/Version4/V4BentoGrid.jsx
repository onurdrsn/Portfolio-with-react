import React from "react";
import { useTranslation } from "react-i18next";
import {
  CloudLightning,
  Radio,
  Cpu,
  Database,
  ShieldCheck,
} from "lucide-react";
import { Container, Section, SectionHeader } from "./V4Primitives";

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
      span: "lg:col-span-7",
    },
    {
      id: "realtime",
      icon: Radio,
      title: t("v4.bento.items.realtime.title"),
      tag: t("v4.bento.items.realtime.tag"),
      description: t("v4.bento.items.realtime.description"),
      badge: t("v4.bento.items.realtime.badge"),
      span: "lg:col-span-5",
    },
    {
      id: "ai",
      icon: Cpu,
      title: t("v4.bento.items.ai.title"),
      tag: t("v4.bento.items.ai.tag"),
      description: t("v4.bento.items.ai.description"),
      badge: t("v4.bento.items.ai.badge"),
      span: "lg:col-span-4",
    },
    {
      id: "db",
      icon: Database,
      title: t("v4.bento.items.db.title"),
      tag: t("v4.bento.items.db.tag"),
      description: t("v4.bento.items.db.description"),
      badge: t("v4.bento.items.db.badge"),
      span: "lg:col-span-4",
    },
    {
      id: "frontend",
      icon: ShieldCheck,
      title: t("v4.bento.items.frontend.title"),
      tag: t("v4.bento.items.frontend.tag"),
      description: t("v4.bento.items.frontend.description"),
      badge: t("v4.bento.items.frontend.badge"),
      span: "lg:col-span-4",
    },
  ];

  return (
    <Section id="capabilities" labelledBy="capabilities-title" className="bg-ink text-paper">
      <Container>
        {/* Section Header */}
        <div className="mb-12">
          <SectionHeader
            index="01"
            eyebrow={t("v4.bento.badge")}
            title={
              <>
                {t("v4.bento.title")}{" "}
                <span className="text-paper-muted">{t("v4.bento.titleHighlight")}</span>
              </>
            }
            description={t("v4.bento.description")}
            titleId="capabilities-title"
          />
        </div>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`${c.span} rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-7 flex flex-col justify-between hover:border-ink-line-strong transition-colors duration-200`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-10 h-10 rounded border border-ink-line bg-ink flex items-center justify-center text-paper">
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-code text-xs text-paper-subtle">
                        {c.badge}
                      </span>
                    </div>
                  </div>

                  <div className="font-code text-xs text-signal uppercase tracking-wider mb-2">
                    {c.tag}
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-paper mb-3">
                    {c.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-paper-muted font-normal">
                    {c.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

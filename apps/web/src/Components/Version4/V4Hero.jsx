import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiGet } from "../../lib/api";
import {
  Terminal,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import { Container, buttonStyles } from "./V4Primitives";

// Lightweight, accessible morphing role display
const MorphingRole = React.memo(function MorphingRole({ roles }) {
  const [index, setIndex] = useState(0);

  React.useEffect(() => {
    if (!roles || roles.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [roles]);

  const currentRole = roles[index % roles.length];

  return (
    <div className="flex items-center gap-2 font-code text-sm sm:text-base text-paper-muted my-3">
      <span className="text-signal font-bold">&gt;</span>
      <span className="text-paper font-medium tracking-tight">
        {currentRole}
      </span>
      <span className="w-2 h-4 bg-paper-subtle animate-pulse inline-block" />
    </div>
  );
});

export default function V4Hero() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("architecture");

  // Dynamic system health, architecture, and live latency from backend API
  const [systemStatus, setSystemStatus] = useState({
    ok: true,
    status: 200,
    uptime: "99.99%",
    server: "cloudflare",
    cfRay: "928bf2a091a-IST",
    runtime: "Cloudflare Workers V8",
    database: "Neon Serverless Postgres",
    messaging: "Resend API Service",
    stateSync: "Real-time WebSockets",
    aiEngine: "Cloudflare Workers AI",
    latency: 12,
  });

  const [measuredLatency, setMeasuredLatency] = useState(12);

  useEffect(() => {
    let isMounted = true;
    const start = performance.now();
    apiGet("/api/health", { silent: true })
      .then((data) => {
        if (!isMounted) return;
        const roundtrip = Math.max(1, Math.round(performance.now() - start));
        setMeasuredLatency(roundtrip);
        if (data && typeof data === "object") {
          setSystemStatus((prev) => ({
            ...prev,
            ...data,
            latency: data.latency ? Number(data.latency) : roundtrip,
          }));
        }
      })
      .catch(() => {
        // Fallback to static defaults on network error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const defaultRoles = useMemo(
    () => [
      "Senior Full Stack Architect",
      "Cloudflare Edge & Serverless Specialist",
      "AI & Neural Systems Engineer",
      "High-Concurrency Web Developer",
    ],
    []
  );

  const translatedRoles = t("v4.hero.roles", { returnObjects: true });
  const roles = useMemo(() => {
    return Array.isArray(translatedRoles) && translatedRoles.length > 0
      ? translatedRoles
      : defaultRoles;
  }, [translatedRoles, defaultRoles]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("onurdrsn55@gmail.com");
    setCopied(true);
    toast.success(t("v4.hero.copySuccessToast"));
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-ink-line bg-ink text-paper">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Typography, Hierarchy, Identity */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Live Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ink-line-strong bg-ink-raised text-paper-muted text-xs font-code mb-6 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal"></span>
              </span>
              <span>{t("v4.hero.status")}</span>
              <span className="text-paper-subtle">•</span>
              <span className="text-paper-subtle">{t("v4.hero.badge")}</span>
            </div>

            {/* Main Name Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-paper mb-2">
              {t("v4.hero.nameFirst")}{" "}
              <span className="text-paper-muted">{t("v4.hero.nameLast")}</span>
            </h1>

            {/* Dynamic Role */}
            <MorphingRole roles={roles} />

            {/* Lead Narrative */}
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-paper-muted max-w-xl font-normal">
              {t("v4.hero.description")}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a
                href="#projects"
                className={buttonStyles.primary}
              >
                <span>{t("v4.hero.viewProjects")}</span>
                <ArrowRight size={16} />
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className={buttonStyles.secondary}
                aria-label={t("v4.hero.copyEmail")}
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-signal" />
                    <span className="text-signal font-medium">{t("v4.hero.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-paper-subtle" />
                    <span>{t("v4.hero.copyEmail")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Metrics / System Overview Bar */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-ink-line max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-code text-paper">
                  {t("v4.hero.stats.projectsCount")}
                </div>
                <div className="text-xs text-paper-subtle mt-0.5">
                  {t("v4.hero.stats.projectsLabel")}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-code text-paper">
                  {t("v4.hero.stats.latencyValue")}
                </div>
                <div className="text-xs text-paper-subtle mt-0.5">
                  {t("v4.hero.stats.latencyLabel")}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-code text-signal">
                  {t("v4.hero.stats.liveValue")}
                </div>
                <div className="text-xs text-paper-subtle mt-0.5">
                  {t("v4.hero.stats.liveLabel")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Swiss Engineering Inspector (Tabbed Card) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-lg border border-ink-line bg-ink-raised overflow-hidden shadow-2xl">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-line bg-ink/50 text-xs font-code text-paper-subtle">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-line-strong inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-line-strong inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-line-strong inline-block"></span>
                  </div>
                  <span className="ml-2 font-mono">{t("v4.hero.terminal.title")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-signal">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {t("v4.hero.terminal.online")}
                  </span>
                </div>
              </div>

              {/* Terminal Tabs */}
              <div className="flex border-b border-ink-line text-xs font-code bg-ink/30">
                <button
                  type="button"
                  aria-pressed={activeTab === "architecture"}
                  onClick={() => setActiveTab("architecture")}
                  className={`px-4 py-2 flex items-center gap-1.5 border-r border-ink-line transition-colors cursor-pointer ${
                    activeTab === "architecture"
                      ? "bg-ink-raised text-paper font-medium border-b-2 border-b-paper"
                      : "text-paper-subtle hover:text-paper hover:bg-ink-hover"
                  }`}
                >
                  <Cpu size={13} />
                  <span>{t("v4.hero.terminal.tabArchitecture")}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === "stack"}
                  onClick={() => setActiveTab("stack")}
                  className={`px-4 py-2 flex items-center gap-1.5 border-r border-ink-line transition-colors cursor-pointer ${
                    activeTab === "stack"
                      ? "bg-ink-raised text-paper font-medium border-b-2 border-b-paper"
                      : "text-paper-subtle hover:text-paper hover:bg-ink-hover"
                  }`}
                >
                  <Layers size={13} />
                  <span>{t("v4.hero.terminal.tabStack")}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === "metrics"}
                  onClick={() => setActiveTab("metrics")}
                  className={`px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "metrics"
                      ? "bg-ink-raised text-paper font-medium border-b-2 border-b-paper"
                      : "text-paper-subtle hover:text-paper hover:bg-ink-hover"
                  }`}
                >
                  <Terminal size={13} />
                  <span>{t("v4.hero.terminal.tabHealth")}</span>
                </button>
              </div>

              {/* Code Content - Auto-wrap enabled, zero horizontal scrollbar */}
              <pre className="p-5 font-code text-xs leading-relaxed min-h-[260px] bg-ink/80 text-paper-muted font-mono m-0 whitespace-pre-wrap break-words break-all overflow-hidden">
                <code className="block whitespace-pre-wrap break-words break-all">
                  {activeTab === "architecture" && (
                    <div className="space-y-1">
                      <p className="text-paper-subtle">// Edge Cloud Architecture 2026</p>
                      <p><span className="text-paper">export const</span> <span className="text-signal">SystemProfile</span> = &#123;</p>
                      <p className="pl-4"><span className="text-paper-muted">engineer</span>: <span className="text-paper">"Onur Dursun"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">runtime</span>: <span className="text-paper">"{systemStatus.runtime}"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">database</span>: <span className="text-paper">"{systemStatus.database}"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">messaging</span>: <span className="text-paper">"{systemStatus.messaging}"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">stateSync</span>: <span className="text-paper">"{systemStatus.stateSync}"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">latency</span>: <span className="text-signal">{systemStatus.latency || measuredLatency}</span> <span className="text-paper-subtle">/* ms edge roundtrip */</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">status</span>: <span className="text-signal">"{systemStatus.status === 200 || systemStatus.ok ? 'OPTIMAL_HEALTH' : 'DEGRADED'}"</span></p>
                      <p>&#125;;</p>
                      <p className="pt-2 text-paper-subtle">// Serving requests across 300+ global edge locations</p>
                    </div>
                  )}

                  {activeTab === "stack" && (
                    <div className="space-y-1">
                      <p className="text-paper-subtle">&#123;</p>
                      <p className="pl-4"><span className="text-paper-muted">"frontend"</span>: [<span className="text-paper">"React 19"</span>, <span className="text-paper">"TypeScript"</span>, <span className="text-paper">"TailwindCSS"</span>],</p>
                      <p className="pl-4"><span className="text-paper-muted">"backend"</span>: [<span className="text-paper">"Hono.js"</span>, <span className="text-paper">"Cloudflare Workers"</span>],</p>
                      <p className="pl-4"><span className="text-paper-muted">"orm"</span>: <span className="text-paper">"Drizzle ORM"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">"email"</span>: <span className="text-paper">"Resend SDK"</span>,</p>
                      <p className="pl-4"><span className="text-paper-muted">"aiEngine"</span>: <span className="text-paper">"{systemStatus.aiEngine || 'Cloudflare Workers AI'}"</span></p>
                      <p>&#125;</p>
                    </div>
                  )}

                  {activeTab === "metrics" && (
                    <div className="space-y-2 whitespace-pre-wrap break-words break-all">
                      <p className="text-paper font-semibold break-all">$ curl -I https://portfolio-worker.onurd.com.tr/api/health</p>
                      <p className="text-paper-subtle">HTTP/2 {systemStatus.status || 200} OK</p>
                      <p className="text-paper-subtle">content-type: application/json; charset=UTF-8</p>
                      <p className="text-paper-subtle">server: {systemStatus.server || 'cloudflare'}</p>
                      <p className="text-paper-muted break-all">cf-ray: {systemStatus.cfRay || '928bf2a091a-IST'}</p>
                      <p className="text-signal font-semibold break-all">&#123; "ok": {String(systemStatus.ok)}, "status": "{systemStatus.status || 200}", "uptime": "{systemStatus.uptime || '99.99%'}" &#125;</p>
                    </div>
                  )}
                </code>
              </pre>

              {/* Card Footer */}
              <div className="px-4 py-2 border-t border-ink-line bg-ink/40 flex items-center justify-between text-[11px] font-code text-paper-subtle">
                <span className="flex items-center gap-1.5 text-paper-muted">
                  <Sparkles size={11} className="text-signal" />
                  <span>{t("v4.hero.terminal.engineReady")}</span>
                </span>
                <span>{t("v4.hero.terminal.engineSpecs")}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

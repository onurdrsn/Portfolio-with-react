import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Terminal,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Zap,
  Globe,
  Code2,
  Database,
  Layers,
} from "lucide-react";

export default function V4Hero() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("architecture");

  // Dynamic typing role
  const defaultRoles = [
    "Senior Full Stack Architect",
    "Cloudflare Edge & Serverless Specialist",
    "AI & Neural Systems Engineer",
    "High-Concurrency Web Developer",
  ];
  const translatedRoles = t("v4.hero.roles", { returnObjects: true });
  const roles = Array.isArray(translatedRoles) && translatedRoles.length > 0 ? translatedRoles : defaultRoles;

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFull = roles[roleIndex % roles.length];
    let speed = isDeleting ? 35 : 70;

    if (!isDeleting && displayText === currentFull) {
      speed = 2200; // Pause at full text
      const timeout = setTimeout(() => setIsDeleting(true), speed);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
      speed = 400;
    }

    const timer = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? currentFull.substring(0, displayText.length - 1)
          : currentFull.substring(0, displayText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("onurdrsn55@gmail.com");
    setCopied(true);
    toast.success(t("v4.hero.copySuccessToast"));
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
      {/* Background Aura Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-violet-600/20 via-purple-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Live Availability Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-violet-950/50 backdrop-blur-xl hover:border-violet-400/60 transition-all cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{t("v4.hero.status")}</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-violet-400"></span>
              <span className="hidden sm:inline-block text-violet-400 text-xs font-mono font-bold">
                {t("v4.hero.badge")}
              </span>
            </div>

            {/* Name Heading with Radiant Cyber Glow */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.08] mb-4">
              {t("v4.hero.nameFirst")}{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                {t("v4.hero.nameLast")}
              </span>
            </h1>

            {/* Dynamic Morphing Role */}
            <div className="h-10 sm:h-12 flex items-center justify-center lg:justify-start mb-6">
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text">
                {displayText}
              </span>
              <span className="w-0.5 h-6 sm:h-7 bg-violet-400 ml-1.5 animate-pulse inline-block"></span>
            </div>

            {/* Lead Narrative */}
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal mb-8">
              {t("v4.hero.description")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center mb-10">
              <a
                href="#projects-v4"
                className="group relative px-7 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 text-white font-bold text-sm sm:text-base rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/40 hover:scale-[1.03] active:scale-95 border border-violet-400/30 flex items-center gap-2"
              >
                <span>{t("v4.hero.viewProjects")}</span>
                <ArrowRight size={17} className="group-hover:translate-x-1.5 transition-transform" />
              </a>

              <button
                onClick={handleCopyEmail}
                className="px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl border border-white/10 hover:border-violet-400/50 text-gray-200 font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 flex items-center gap-2.5 hover:shadow-xl active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-300 font-bold">{t("v4.hero.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-violet-400" />
                    <span>{t("v4.hero.copyEmail")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0 pt-4 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center backdrop-blur-md hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text">
                  {t("v4.hero.stats.projectsCount")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-0.5">
                  {t("v4.hero.stats.projectsLabel")}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center backdrop-blur-md hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text">
                  {t("v4.hero.stats.latencyValue")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-0.5">
                  {t("v4.hero.stats.latencyLabel")}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center backdrop-blur-md hover:scale-105 transition-transform duration-200">
                <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text">
                  {t("v4.hero.stats.liveValue")}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-0.5">
                  {t("v4.hero.stats.liveLabel")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code & Architecture Window (Morphism Style) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gray-950/80 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden group/box before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 text-xs font-mono text-gray-400">
                    {t("v4.hero.terminal.title")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    {t("v4.hero.terminal.online")}
                  </span>
                </div>
              </div>

              {/* Code Tabs */}
              <div className="flex border-b border-white/10 bg-white/[0.02] text-xs font-mono">
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`px-4 py-2.5 flex items-center gap-1.5 transition-all border-r border-white/10 cursor-pointer ${
                    activeTab === "architecture"
                      ? "bg-violet-950/40 text-violet-300 border-b-2 border-b-violet-500 font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Cpu size={13} />
                  <span>{t("v4.hero.terminal.tabArchitecture")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("stack")}
                  className={`px-4 py-2.5 flex items-center gap-1.5 transition-all border-r border-white/10 cursor-pointer ${
                    activeTab === "stack"
                      ? "bg-violet-950/40 text-violet-300 border-b-2 border-b-violet-500 font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Layers size={13} />
                  <span>{t("v4.hero.terminal.tabStack")}</span>
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={`px-4 py-2.5 flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "metrics"
                      ? "bg-violet-950/40 text-violet-300 border-b-2 border-b-violet-500 font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Terminal size={13} />
                  <span>{t("v4.hero.terminal.tabHealth")}</span>
                </button>
              </div>

              {/* Code Content */}
              <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto min-h-[290px] bg-gray-950/70 text-gray-300">
                {activeTab === "architecture" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <p className="text-gray-500">// Edge Cloud Architecture 2026</p>
                    <p><span className="text-pink-400">export const</span> <span className="text-cyan-300">SystemProfile</span> = &#123;</p>
                    <p className="pl-4"><span className="text-violet-400">engineer</span>: <span className="text-emerald-300">"Onur Dursun"</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">runtime</span>: <span className="text-emerald-300">"Cloudflare Workers V8"</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">database</span>: <span className="text-emerald-300">"Neon Serverless Postgres"</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">messaging</span>: <span className="text-emerald-300">"Resend API Service"</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">stateSync</span>: <span className="text-emerald-300">"Real-time WebSockets"</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">latency</span>: <span className="text-amber-300">12</span> <span className="text-gray-500">/* ms edge roundtrip */</span>,</p>
                    <p className="pl-4"><span className="text-violet-400">status</span>: <span className="text-emerald-400">"OPTIMAL_HEALTH"</span></p>
                    <p>&#125;;</p>
                    <p className="pt-2 text-violet-400/80 animate-pulse">// 🚀 Serving requests from 300+ global data centers</p>
                  </div>
                )}

                {activeTab === "stack" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <p className="text-gray-500">&#123;</p>
                    <p className="pl-4"><span className="text-cyan-400">"frontend"</span>: [<span className="text-emerald-300">"React 19"</span>, <span className="text-emerald-300">"TypeScript"</span>, <span className="text-emerald-300">"TailwindCSS"</span>],</p>
                    <p className="pl-4"><span className="text-cyan-400">"backend"</span>: [<span className="text-emerald-300">"Hono.js"</span>, <span className="text-emerald-300">"Cloudflare Workers"</span>],</p>
                    <p className="pl-4"><span className="text-cyan-400">"orm"</span>: <span className="text-emerald-300">"Drizzle ORM"</span>,</p>
                    <p className="pl-4"><span className="text-cyan-400">"email"</span>: <span className="text-emerald-300">"Resend SDK"</span>,</p>
                    <p className="pl-4"><span className="text-cyan-400">"aiEngine"</span>: <span className="text-emerald-300">"Cloudflare Workers AI"</span></p>
                    <p>&#125;</p>
                  </div>
                )}

                {activeTab === "metrics" && (
                  <div className="space-y-2 animate-fadeIn">
                    <p className="text-emerald-400 font-bold">$ curl -I https://portfolio-worker.onurd.com.tr/api/health</p>
                    <p className="text-gray-400">HTTP/2 200 OK</p>
                    <p className="text-gray-400">content-type: application/json; charset=UTF-8</p>
                    <p className="text-gray-400">server: cloudflare</p>
                    <p className="text-cyan-300">cf-ray: 928bf2a091a-IST</p>
                    <p className="text-emerald-300 font-bold">&#123; "ok": true, "status": "200", "uptime": "99.99%" &#125;</p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Status Bar */}
              <div className="px-4 py-2.5 bg-white/[0.03] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1.5 text-violet-400 font-bold">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{t("v4.hero.terminal.engineReady")}</span>
                </span>
                <span>{t("v4.hero.terminal.engineSpecs")}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

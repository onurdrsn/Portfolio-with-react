import React from "react";
import {
  CloudLightning,
  Radio,
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  Globe2,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react";

export default function V4BentoGrid() {
  const capabilities = [
    {
      icon: CloudLightning,
      title: "Cloudflare Edge & Serverless",
      tag: "Zero Cold Start",
      description:
        "Dünyanın 300+ noktasında çalışan Cloudflare Workers & Hono.js mimarileri ile kullanıcılara milisaniyeler içinde yanıt veren global altyapılar.",
      badge: "< 15ms Latency",
      gradient: "from-cyan-500/10 via-violet-500/5 to-transparent",
      border: "hover:border-cyan-500/40",
      accent: "text-cyan-400",
      span: "lg:col-span-8",
    },
    {
      icon: Radio,
      title: "Realtime WebSocket Hub",
      tag: "Live Concurrency",
      description:
        "Çok oyunculu web oyunları, anlık mesajlaşma ve ortak çalışma platformları için düşük gecikmeli WebSocket protokolleri.",
      badge: "Realtime Sync",
      gradient: "from-fuchsia-500/10 via-purple-500/5 to-transparent",
      border: "hover:border-fuchsia-500/40",
      accent: "text-fuchsia-400",
      span: "lg:col-span-4",
    },
    {
      icon: Cpu,
      title: "AI & Neural Vector Intelligence",
      tag: "Workers AI",
      description:
        "Cloudflare Workers AI, Llama-3, embedding modelleri ve anlamsal arama motorları entegrasyonu.",
      badge: "Edge AI Inferences",
      gradient: "from-violet-500/10 via-indigo-500/5 to-transparent",
      border: "hover:border-violet-500/40",
      accent: "text-violet-400",
      span: "lg:col-span-4",
    },
    {
      icon: Database,
      title: "Neon Serverless Postgres & Drizzle",
      tag: "Full Type Safety",
      description:
        "Drizzle ORM ile uçtan uca tip güvenliği sağlanan, Neon Serverless PostgreSQL üzerinde ölçeklenebilir veritabanı şemaları.",
      badge: "Branchable DB",
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      border: "hover:border-emerald-500/40",
      accent: "text-emerald-400",
      span: "lg:col-span-4",
    },
    {
      icon: ShieldCheck,
      title: "Modern React & Frontend Excellence",
      tag: "Smooth Motion & UX",
      description:
        "Vite, TailwindCSS, interaktif Three.js canvasları ve mobil uyumlu akıcı mikro animasyonlarla zenginleştirilmiş kullanıcı deneyimleri.",
      badge: "60+ FPS Motion",
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      border: "hover:border-amber-500/40",
      accent: "text-amber-400",
      span: "lg:col-span-4",
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles size={13} className="text-amber-400" />
          <span>Mühendislik Standartları</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Modern Teknoloji & <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Mimari Matrisi</span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
          Sadece kod yazmıyor; yüksek hacimli, güvenli ve sürdürülebilir sistemler inşa ediyorum.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {capabilities.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`${c.span} relative rounded-3xl bg-gradient-to-br ${c.gradient} bg-gray-950/70 border border-gray-800/80 ${c.border} p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 group`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-gray-900/90 border border-gray-800 ${c.accent} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {c.badge}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  {c.tag}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-white transition-colors">
                  {c.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed pt-1">
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

import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function Intro() {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('onurdrsn@gmail.com');
        setCopied(true);
        toast.success(t('hero.copied') || 'E-posta adresi kopyalandı!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative flex items-center justify-center flex-col text-center pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
            {/* Ambient Animated Cyber Glow Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/25 via-purple-600/20 to-pink-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-10 left-1/3 w-[450px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px]"></div>
            </div>

            {/* Z-Index Wrapper */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-950/80 to-purple-950/80 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium mb-6 shadow-xl shadow-violet-950/50 backdrop-blur-md hover:border-violet-400/50 transition-all cursor-default">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>{t('hero.welcome') || "👋 Hoş Geldiniz — Projeler için Aktif & Hazır"}</span>
                </div>

                {/* Name Heading with Futuristic Cyber Gradient */}
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-4 text-white">
                    <span className="bg-gradient-to-r from-white via-violet-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                        Onur Dursun
                    </span>
                </h1>

                {/* Subtitle & Role */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <span className="text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                        {t('hero.title') || "Senior Full Stack & AI Systems Architect"}
                    </span>
                </div>

                {/* Description */}
                <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                    {t('hero.description') || "Modern web mimarileri, Cloudflare Worker sunucusuz sistemler, real-time WebSocket uygulamaları ve makine öğrenimi modelleri üreten tutkulu geliştirici."}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 justify-center items-center mb-12">
                    <a
                        href="#projects"
                        className="group relative px-8 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold text-sm sm:text-base rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/40 hover:scale-[1.03] active:scale-95 border border-violet-400/30"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t('hero.viewWork') || "Projelerimi Keşfet"}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </a>

                    <button
                        onClick={handleCopyEmail}
                        className="px-6 py-3.5 bg-gray-900/60 hover:bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 hover:border-violet-500/50 text-gray-200 font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 flex items-center gap-2 hover:shadow-lg active:scale-95"
                    >
                        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copied ? (t('hero.copied') || 'Kopyalandı!') : (t('hero.getInTouch') || 'İletişime Geç')}
                    </button>
                </div>

                {/* Tech Chips Matrix */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-xl">
                    {['React 19', 'TypeScript', 'Cloudflare Workers', 'Hono', 'Neon PostgreSQL', 'Python ML', 'Docker'].map((tech) => (
                        <span key={tech} className="px-3 py-1 text-xs font-semibold bg-violet-950/40 text-violet-300 border border-violet-500/20 rounded-full hover:bg-violet-900/60 hover:border-violet-400/40 transition-all cursor-default shadow-sm">
                            ⚡ {tech}
                        </span>
                    ))}
                </div>

                {/* Quick Stat Counters */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl w-full p-4 sm:p-6 bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <div className="text-2xl sm:text-4xl font-extrabold text-white bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">35+</div>
                        <div className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{t('hero.stats.projects') || "Tamamlanan Proje"}</div>
                    </div>
                    <div className="text-center border-x border-gray-800/80 px-2">
                        <div className="text-2xl sm:text-4xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">3+ Yıl</div>
                        <div className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{t('hero.stats.experience') || "Geliştirme Deneyimi"}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl sm:text-4xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">100%</div>
                        <div className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{t('hero.stats.quality') || "Canlı & Performanslı"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
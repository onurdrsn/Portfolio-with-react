import React from "react";
import { useTranslation } from 'react-i18next';

export default function Intro() {
    const { t } = useTranslation();
    return (
        <div className="relative flex items-center justify-center flex-col text-center pt-20 pb-16 px-6">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                        {t('hero.welcome')}
                    </span>
                </div>

                {/* Name with Gradient */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6">
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                        Onur Dursun
                    </span>
                </h1>

                {/* Title */}
                <p className="text-xl md:text-2xl lg:text-3xl mb-6 font-semibold text-gray-300">
                    {t('hero.title')}
                </p>

                {/* Description */}
                <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                    {t('hero.description')}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <a
                        href="#projects"
                        className="group relative px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t('hero.viewWork')}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </a>
                    <a
                        href="#contact"
                        className="px-8 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-700/50 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg"
                    >
                        {t('hero.getInTouch')}
                    </a>
                </div>

                {/* Social Links */}
                <div className="flex gap-6 justify-center items-center">
                    <a
                        href="https://github.com/onurdrsn"
                        target="_blank"
                        rel="noreferrer"
                        className="group p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:border-violet-500/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                        aria-label="GitHub"
                    >
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </a>
                    <a
                        href="https://linkedin.com/in/odursun"
                        target="_blank"
                        rel="noreferrer"
                        className="group p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:border-violet-500/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                        aria-label="LinkedIn"
                    >
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>
                    <a
                        href="mailto:onur@example.com"
                        className="group p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:border-violet-500/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                        aria-label="Email"
                    >
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
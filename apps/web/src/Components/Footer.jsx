import React from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="py-10 border-t border-gray-800/80 text-center mt-12 bg-gray-950/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-300">{t('footer.tagline') || 'Onur Dursun Portfolio Systems'}</span>
                </div>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    &copy; {new Date().getFullYear()} {t('footer.rights') || 'Onur Dursun. All rights reserved.'} {t('footer.builtWith') || 'Built with'} <Heart size={13} className="text-red-500 inline fill-red-500" /> & React + Cloudflare.
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                    <a href="#projects" className="hover:text-violet-300 transition-colors">{t('nav.projects') || 'Projeler'}</a>
                    <a href="#experience" className="hover:text-violet-300 transition-colors">{t('nav.experience') || 'Deneyim'}</a>
                    <a href="/blog" className="hover:text-violet-300 transition-colors">{t('nav.blog') || 'Blog'}</a>
                </div>
            </div>
        </footer>
    );
}
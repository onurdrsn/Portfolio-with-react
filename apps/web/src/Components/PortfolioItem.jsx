import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Github, Sparkles, ArrowRight, Eye } from 'lucide-react';

export default function PortfolioItem({ title, imgUrl, stack = [], link, github, description, category, featured, onSelect }) {
    const { t } = useTranslation();

    const getCategoryTranslation = (cat) => {
        const categoryMap = {
            'Full Stack': t('projects.categories.fullStack') || 'Full Stack',
            'Frontend': t('projects.categories.frontend') || 'Frontend',
            'Machine Learning': t('projects.categories.machineLearning') || 'Machine Learning',
            'AI': 'AI & Sinir Ağları',
            'Game Dev': 'Oyun Geliştirme'
        };
        return categoryMap[cat] || cat;
    };

    return (
        <div 
            onClick={() => onSelect && onSelect()}
            className="group relative bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-gray-950/90 backdrop-blur-xl border border-gray-800/80 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
        >
            {/* Ambient Top Light Beam */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg border border-violet-400/30 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-300 animate-pulse" />
                    <span>{t('projects.featured') || 'Öne Çıkan'}</span>
                </div>
            )}

            {/* Image Container with Cyber Overlay */}
            <div className="relative w-full aspect-video overflow-hidden bg-gray-950">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400/0f172a/8b5cf6?text=' + encodeURIComponent(title);
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent opacity-75 group-hover:opacity-60 transition-opacity duration-300"></div>

                {/* Category Pill */}
                {category && (
                    <div className="absolute bottom-3 left-3 bg-gray-950/90 backdrop-blur-md text-violet-300 text-[11px] font-bold px-3 py-1 rounded-full border border-violet-500/30 shadow-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                        {getCategoryTranslation(category)}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors duration-300 line-clamp-1">
                        {title}
                    </h3>

                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4 font-normal">
                        {description}
                    </p>
                </div>

                <div>
                    {/* Tech Stack Chips */}
                    {stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {stack.slice(0, 3).map((item, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-md"
                                >
                                    {item}
                                </span>
                            ))}
                            {stack.length > 3 && (
                                <span className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-800/40 rounded-md">
                                    +{stack.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800/80" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onSelect && onSelect()}
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 group/btn"
                        >
                            <Eye size={13} />
                            <span>Detaylar</span>
                            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center gap-2">
                            {github && (
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                                    title="GitHub Deposu"
                                >
                                    <Github size={14} />
                                </a>
                            )}
                            {link && link !== '#' && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 transition-all"
                                    title="Canlı Demo"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
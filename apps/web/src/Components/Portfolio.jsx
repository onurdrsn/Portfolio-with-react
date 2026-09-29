import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';
import { apiGet } from "../lib/api";
import PortfolioItem from "./PortfolioItem";
import { Search, Sparkles, ChevronLeft, ChevronRight, LayoutGrid, Layers, ExternalLink, Github, X as XIcon, Code2, ArrowRight } from 'lucide-react';

export default function Portfolio() {
    const { t } = useTranslation();
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & view states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('deck'); // 'deck' or 'grid'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Deck slider state
    const [deckIndex, setDeckIndex] = useState(0);

    // Touch swipe support for mobile
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const handleTouchStart = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const currentTouch = e.changedTouches ? e.changedTouches[0] : null;
        if (!currentTouch) return;
        const deltaX = touchStartX.current - currentTouch.clientX;
        const deltaY = touchStartY.current - currentTouch.clientY;

        // If horizontal swipe distance > 40px and dominant over vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40 && featuredProjects.length > 0) {
            if (deltaX > 0) {
                // Swiped left -> next slide
                setDeckIndex((prev) => (prev + 1) % featuredProjects.length);
            } else {
                // Swiped right -> previous slide
                setDeckIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    // Modal state
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        apiGet("/api/portfolio", { silent: true })
            .then((data) => {
                if (isMounted) {
                    setPortfolioData(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                console.error("Error fetching portfolio from DB:", err);
                if (isMounted) setPortfolioData([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    // Categories array
    const categories = ['All', 'Full Stack', 'Machine Learning', 'Frontend', 'Game Dev', 'AI'];

    const getCategoryLabel = (cat) => {
        if (cat === 'All') return t('projects.categories.all') || 'Tümü';
        if (cat === 'Full Stack') return t('projects.categories.fullStack') || 'Full Stack';
        if (cat === 'Frontend') return t('projects.categories.frontend') || 'Frontend';
        if (cat === 'Machine Learning') return t('projects.categories.machineLearning') || 'Makine Öğrenmesi';
        if (cat === 'AI') return t('projects.categories.ai') || 'Yapay Zeka';
        if (cat === 'Game Dev') return t('projects.categories.gameDev') || 'Oyun Geliştirme';
        return cat;
    };

    // Featured projects for the Spotlight Deck (only items allowed on home)
    const featuredProjects = useMemo(() => {
        const homeVisible = portfolioData.filter(p => p.showOnHome !== false);
        const featured = homeVisible.filter(p => p.featured);
        return featured.length > 0 ? featured : homeVisible.slice(0, 6);
    }, [portfolioData]);

    // Auto rotate deck slider
    useEffect(() => {
        if (viewMode !== 'deck' || featuredProjects.length === 0) return;
        const timer = setInterval(() => {
            setDeckIndex((prev) => (prev + 1) % featuredProjects.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [viewMode, featuredProjects.length]);

    // Filtered projects for the Bento Grid (only items allowed on home)
    const filteredProjects = useMemo(() => {
        const homeVisible = portfolioData.filter(p => p.showOnHome !== false);
        return homeVisible.filter((item) => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (Array.isArray(item.stack) && item.stack.some(s => s.toLowerCase().includes(query)));
            return matchesCategory && matchesSearch;
        });
    }, [portfolioData, selectedCategory, searchQuery]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    // Paginated items
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProjects.slice(start, start + itemsPerPage);
    }, [filteredProjects, currentPage]);

    const activeDeckItem = featuredProjects[deckIndex] || featuredProjects[0];

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="projects">
            {/* Section Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <Sparkles size={13} className="animate-spin text-amber-400" />
                    <span>{t('projects.badge') || "Gelecek Nesil Mimari"}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                    {t('projects.title') || "Öne Çıkan"} <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{t('projects.titleHighlight') || "Projeler & Eserler"}</span>
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-3">
                    {t('projects.subtitle') || "Sayfayı uzatmayan, filtrelenebilir ve etkileşimli modern proje vitrini."}
                </p>
            </div>

            {/* View Mode & Filter Controls */}
            <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('projects.searchPlaceholder') || "Proje veya teknoloji ara..."}
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                            <XIcon size={14} />
                        </button>
                    )}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50 border border-violet-400/40"
                                    : "bg-gray-950/50 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-800/80"
                                }`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-gray-950/80 p-1 rounded-xl border border-gray-800">
                    <button
                        onClick={() => setViewMode('deck')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'deck'
                                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                                : "text-gray-400 hover:text-white"
                            }`}
                        title={t('projects.viewMode.deck') || "Spotlight Showcase Deck"}
                    >
                        <Layers size={14} />
                        <span className="hidden sm:inline">{t('projects.viewMode.deck') || "Spotlight"}</span>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'grid'
                                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                                : "text-gray-400 hover:text-white"
                            }`}
                        title={t('projects.viewMode.grid') || "Bento Grid"}
                    >
                        <LayoutGrid size={14} />
                        <span className="hidden sm:inline">{t('projects.viewMode.grid') || "Bento Grid"}</span>
                    </button>
                </div>
            </div>

            {/* VIEW 1: 3D SPOTLIGHT SHOWCASE DECK */}
            {viewMode === 'deck' && activeDeckItem && (
                <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'pan-y' }}
                    className="relative mb-16 bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-950/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden group select-none transition-all"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Interactive Project Cover & Visual Preview */}
                        <div className="lg:col-span-7 relative group/img overflow-hidden rounded-2xl border border-gray-800 aspect-video bg-gray-950 shadow-2xl cursor-pointer" onClick={() => setSelectedProject(activeDeckItem)}>
                            <img
                                src={activeDeckItem.imgUrl}
                                alt={activeDeckItem.title}
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/800x450/0f172a/8b5cf6?text=' + encodeURIComponent(activeDeckItem.title || 'Project');
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80 group-hover/img:opacity-50 transition-opacity"></div>
                            <div className="absolute top-4 left-4 bg-violet-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-violet-400/30 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-amber-300" /> {t('projects.featured') || 'Öne Çıkan Vitrin'}
                            </div>
                        </div>

                        {/* Project Info & Controls */}
                        <div className="lg:col-span-5 flex flex-col justify-between h-full">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold border border-violet-500/20 mb-3">
                                    {getCategoryLabel(activeDeckItem.category)}
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                                    {activeDeckItem.title}
                                </h3>
                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                                    {activeDeckItem.description}
                                </p>

                                {/* Tech Stack Chips */}
                                {Array.isArray(activeDeckItem.stack) && activeDeckItem.stack.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {activeDeckItem.stack.map((tech) => (
                                            <span key={tech} className="px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons & Deck Controls */}
                            <div>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <button
                                        onClick={() => setSelectedProject(activeDeckItem)}
                                        className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2"
                                    >
                                        {t('projects.details') || 'Detayları İncele'} <ArrowRight size={16} />
                                    </button>
                                    {activeDeckItem.link && activeDeckItem.link !== '#' && (
                                        <a
                                            href={activeDeckItem.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={16} /> {t('projects.liveDemo') || 'Live Demo'}
                                        </a>
                                    )}
                                    {activeDeckItem.github && (
                                        <a
                                            href={activeDeckItem.github}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Github size={16} /> {t('projects.viewGithub') || 'GitHub'}
                                        </a>
                                    )}
                                </div>

                                {/* Slider Navigation Indicators */}
                                <div className="flex items-center justify-between border-t border-gray-800/80 pt-4">
                                    <div className="flex items-center gap-1.5">
                                        {featuredProjects.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setDeckIndex(idx)}
                                                className={`h-2 rounded-full transition-all ${idx === deckIndex ? "w-8 bg-violet-500" : "w-2 bg-gray-700 hover:bg-gray-500"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="sm:hidden text-[10px] text-violet-400/80 font-medium flex items-center gap-1 animate-pulse">
                                        {t('projects.swipeHint') || "👈 Sağa / Sola Kaydır 👉"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDeckIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length)}
                                            className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-300 transition-all"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="text-xs font-mono text-gray-400">{deckIndex + 1} / {featuredProjects.length}</span>
                                        <button
                                            onClick={() => setDeckIndex((prev) => (prev + 1) % featuredProjects.length)}
                                            className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-300 transition-all"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: BENTO GRID WITH PAGINATION */}
            {(viewMode === 'grid' || searchQuery || selectedCategory !== 'All') && (
                <div>
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl">
                            <Code2 size={48} className="mx-auto mb-4 text-gray-600" />
                            <h3 className="text-lg font-bold text-white mb-1">{t('projects.noProjectsFound') || 'Proje Bulunamadı'}</h3>
                            <p className="text-sm text-gray-400">{t('projects.noProjectsDesc') || 'Arama kriterlerinize uyan proje bulunamadı.'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {paginatedProjects.map((project) => (
                                    <PortfolioItem
                                        key={project.id || project.title}
                                        {...project}
                                        onSelect={() => setSelectedProject(project)}
                                    />
                                ))}
                            </div>

                            {/* Pagination Control */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 py-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <ChevronLeft size={14} /> {t('projects.pagination.prev') || 'Önceki'}
                                    </button>
                                    <span className="text-xs font-semibold text-gray-400 px-3 py-2 bg-gray-950 rounded-xl border border-gray-800">
                                        {t('projects.pagination.page') || 'Sayfa'} <span className="text-violet-400 font-bold">{currentPage}</span> / {totalPages}
                                    </span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        {t('projects.pagination.next') || 'Sonraki'} <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* PROJECT DETAIL GLASSMORPHIC MODAL */}
            {selectedProject && createPortal(
                <div className="fixed inset-0 z-[9999] w-screen h-screen bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fadeIn">
                    <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-left flex flex-col max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-10"
                        >
                            <XIcon size={20} />
                        </button>

                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-gray-950 border border-gray-800">
                            <img
                                src={selectedProject.imgUrl}
                                alt={selectedProject.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/800x450/0f172a/8b5cf6?text=' + encodeURIComponent(selectedProject.title || 'Project');
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
                            <span className="absolute bottom-4 left-4 px-3 py-1 bg-violet-600/90 text-white font-bold text-xs rounded-full border border-violet-400/30">
                                {getCategoryLabel(selectedProject.category)}
                            </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">{selectedProject.title}</h3>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">{selectedProject.description}</p>

                        {Array.isArray(selectedProject.stack) && selectedProject.stack.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('projects.modal.usedTech') || 'Kullanılan Teknolojiler'}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.stack.map((tech) => (
                                        <span key={tech} className="px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                            {selectedProject.link && selectedProject.link !== '#' && (
                                <a
                                    href={selectedProject.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40"
                                >
                                    <ExternalLink size={16} /> {t('projects.modal.openLiveApp') || 'Canlı Uygulamayı Aç'}
                                </a>
                            )}
                            {selectedProject.github && (
                                <a
                                    href={selectedProject.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Github size={16} /> {t('projects.modal.viewCode') || 'GitHub Kodları'}
                                </a>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
}

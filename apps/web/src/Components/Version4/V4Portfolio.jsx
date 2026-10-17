import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import {
  Search,
  Layers,
  LayoutGrid,
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Code2,
  ArrowRight,
} from "lucide-react";
import { Container, Section, SectionHeader, buttonStyles } from "./V4Primitives";

export default function V4Portfolio() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("deck"); // 'deck' or 'grid'
  const [deckIndex, setDeckIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Touch Swipe for mobile carousel/deck
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

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > 40 &&
      featuredProjects.length > 0
    ) {
      if (deltaX > 0) {
        setDeckIndex((prev) => (prev + 1) % featuredProjects.length);
      } else {
        setDeckIndex(
          (prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length
        );
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiGet("/api/portfolio", { silent: true })
      .then((data) => {
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setProjects([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Accessible Modal Keyboard & Scroll Handling (A11y WCAG 2.1)
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  const categoryConfigs = [
    { key: "all", filterVal: "All", labelKey: "v4.portfolio.categories.all" },
    { key: "fullStack", filterVal: "Full Stack", labelKey: "v4.portfolio.categories.fullStack" },
    { key: "ml", filterVal: "Machine Learning", labelKey: "v4.portfolio.categories.ml" },
    { key: "frontend", filterVal: "Frontend", labelKey: "v4.portfolio.categories.frontend" },
    { key: "gameDev", filterVal: "Game Dev", labelKey: "v4.portfolio.categories.gameDev" },
    { key: "ai", filterVal: "AI", labelKey: "v4.portfolio.categories.ai" },
  ];

  const getCategoryLabel = (cat) => {
    const found = categoryConfigs.find(
      (c) => c.filterVal.toLowerCase() === (cat || "").toLowerCase()
    );
    return found ? t(found.labelKey) : cat;
  };

  // Filter only projects marked to be shown on home
  const visibleProjects = useMemo(() => {
    return projects.filter((p) => p.showOnHome !== false);
  }, [projects]);

  // Featured projects for the Spotlight Deck
  const featuredProjects = useMemo(() => {
    const featured = visibleProjects.filter((p) => p.featured);
    return featured.length > 0 ? featured : visibleProjects.slice(0, 6);
  }, [visibleProjects]);

  // Filtered projects based on Category & Search Query
  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((item) => {
      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (Array.isArray(item.stack) &&
          item.stack.some((s) => s.toLowerCase().includes(query)));
      return matchesCat && matchesSearch;
    });
  }, [visibleProjects, selectedCategory, searchQuery]);

  const activeItem = featuredProjects[deckIndex] || featuredProjects[0];

  return (
    <Section id="projects" labelledBy="portfolio-title" className="bg-ink text-paper scroll-mt-20">
      <Container>
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <SectionHeader
            index="02"
            eyebrow={t("v4.portfolio.badge")}
            title={
              <>
                {t("v4.portfolio.title")}{" "}
                <span className="text-paper-muted">{t("v4.portfolio.titleHighlight")}</span>
              </>
            }
            description={t("v4.portfolio.description")}
            titleId="portfolio-title"
          />
        </div>

        {/* Swiss Control Bar: Search + Category + View Switcher */}
        <div className="rounded-lg border border-ink-line bg-ink-raised p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-subtle pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("v4.portfolio.searchPlaceholder")}
              aria-label={t("v4.portfolio.searchPlaceholder")}
              className="w-full bg-ink border border-ink-line rounded-md pl-10 pr-9 py-2 text-xs sm:text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                title={t("v4.portfolio.clearSearch")}
                aria-label={t("v4.portfolio.clearSearch")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-subtle hover:text-paper transition-colors"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto" role="group" aria-label="Project categories">
            {categoryConfigs.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.filterVal)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.filterVal
                    ? "bg-paper text-ink font-semibold"
                    : "border border-ink-line text-paper-muted hover:text-paper hover:bg-ink-hover"
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 border border-ink-line p-1 rounded-md bg-ink">
            <button
              type="button"
              onClick={() => setViewMode("deck")}
              aria-label={t("v4.portfolio.views.spotlight")}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "deck"
                  ? "bg-ink-raised text-paper font-semibold shadow-sm"
                  : "text-paper-subtle hover:text-paper"
              }`}
            >
              <Layers size={13} />
              <span>{t("v4.portfolio.views.spotlight")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label={t("v4.portfolio.views.grid")}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-ink-raised text-paper font-semibold shadow-sm"
                  : "text-paper-subtle hover:text-paper"
              }`}
            >
              <LayoutGrid size={13} />
              <span>{t("v4.portfolio.views.grid")}</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: SPOTLIGHT DECK (Touch-Swipe Enabled) */}
        {viewMode === "deck" && activeItem && (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "pan-y" }}
            className="mb-12 rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-8 transition-all duration-300"
          >
            <div
              key={activeItem.id || deckIndex}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Project Image Preview */}
              <div
                className="lg:col-span-7 relative overflow-hidden rounded-md border border-ink-line aspect-video bg-ink cursor-pointer group"
                onClick={() => setSelectedProject(activeItem)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProject(activeItem);
                  }
                }}
                aria-label={`${activeItem.title} - ${t("v4.portfolio.inspectDetails")}`}
              >
                <img
                  src={activeItem.imgUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/800x450/121214/ededef?text=" +
                      encodeURIComponent(activeItem.title || "Project");
                  }}
                />
                <div className="absolute top-3 left-3 bg-ink/90 border border-ink-line text-paper font-code text-xs px-2.5 py-1 rounded">
                  {t("v4.portfolio.featuredBadge")}
                </div>
              </div>

              {/* Project Info & Controls */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block font-code text-xs text-signal uppercase tracking-wider mb-2">
                    {getCategoryLabel(activeItem.category)}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-paper mb-3 tracking-tight">
                    {activeItem.title}
                  </h3>
                  <p className="text-paper-muted text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    {activeItem.description}
                  </p>

                  {/* Tech Stack Chips */}
                  {Array.isArray(activeItem.stack) && activeItem.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {activeItem.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-xs font-code bg-ink border border-ink-line text-paper-muted rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions & Carousel Navigation */}
                <div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(activeItem)}
                      className={buttonStyles.primary + " flex-1"}
                    >
                      <span>{t("v4.portfolio.inspectDetails")}</span>
                      <ArrowRight size={15} />
                    </button>
                    {activeItem.link && activeItem.link !== "#" && (
                      <a
                        href={activeItem.link}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles.secondary}
                      >
                        <ExternalLink size={15} />
                        <span>{t("v4.portfolio.demo")}</span>
                      </a>
                    )}
                    {activeItem.github && (
                      <a
                        href={activeItem.github}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles.secondary}
                      >
                        <Github size={15} />
                        <span>{t("v4.portfolio.github")}</span>
                      </a>
                    )}
                  </div>

                  {/* Deck / Carousel Status */}
                  <div className="flex items-center justify-between border-t border-ink-line pt-4">
                    <div className="flex items-center gap-1.5">
                      {featuredProjects.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDeckIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === deckIndex
                              ? "w-6 bg-paper"
                              : "w-2 bg-ink-line-strong hover:bg-paper-subtle"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="sm:hidden text-[10px] text-paper-subtle font-code">
                      {t("v4.portfolio.swipeHint")}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDeckIndex(
                            (prev) =>
                              (prev - 1 + featuredProjects.length) %
                              featuredProjects.length
                          )
                        }
                        aria-label="Previous slide"
                        className="p-1.5 rounded border border-ink-line bg-ink text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-code text-paper-subtle">
                        {deckIndex + 1} / {featuredProjects.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDeckIndex(
                            (prev) => (prev + 1) % featuredProjects.length
                          )
                        }
                        aria-label="Next slide"
                        className="p-1.5 rounded border border-ink-line bg-ink text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CLEAN GRID VIEW */}
        {(viewMode === "grid" || searchQuery || selectedCategory !== "All") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-ink-line rounded-lg bg-ink-raised">
                <Code2 size={40} className="mx-auto mb-3 text-paper-subtle" aria-hidden="true" />
                <h3 className="text-base font-semibold text-paper mb-1">
                  {t("v4.portfolio.emptyTitle")}
                </h3>
                <p className="text-xs text-paper-muted">
                  {t("v4.portfolio.emptyDescription")}
                </p>
              </div>
            ) : (
              filteredProjects.map((p) => (
                <div
                  key={p.id || p.title}
                  onClick={() => setSelectedProject(p)}
                  className="rounded-lg border border-ink-line bg-ink-raised overflow-hidden flex flex-col justify-between hover:border-ink-line-strong transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-ink border-b border-ink-line">
                      <img
                        src={p.imgUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/400x225/121214/ededef?text=" +
                            encodeURIComponent(p.title);
                        }}
                      />
                      <span className="absolute top-2.5 right-2.5 font-code text-[10px] px-2 py-0.5 rounded bg-ink/90 border border-ink-line text-paper-muted">
                        {getCategoryLabel(p.category)}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-paper mb-2 tracking-tight group-hover:text-white transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-paper-muted line-clamp-3 mb-4 leading-relaxed font-normal">
                        {p.description}
                      </p>

                      {Array.isArray(p.stack) && p.stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.stack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-code px-2 py-0.5 rounded bg-ink border border-ink-line text-paper-subtle"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-ink-line flex items-center justify-between bg-ink/30 text-xs">
                    <span className="font-medium text-paper flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{t("v4.portfolio.inspect")}</span>
                      <ArrowRight size={13} />
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {p.link && p.link !== "#" && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${p.title} ${t("v4.portfolio.demo")}`}
                          className="p-1.5 rounded border border-ink-line text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {p.github && (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${p.title} ${t("v4.portfolio.github")}`}
                          className="p-1.5 rounded border border-ink-line text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors"
                        >
                          <Github size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ACCESSIBLE PROJECT DETAILS MODAL */}
        {selectedProject &&
          createPortal(
            <div
              className="fixed inset-0 z-[99999] w-screen h-screen bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn"
              onClick={() => setSelectedProject(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div
                className="relative w-full max-w-2xl bg-ink-raised border border-ink-line rounded-lg p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl text-paper"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="font-code text-xs text-signal uppercase tracking-wider">
                      {getCategoryLabel(selectedProject.category)}
                    </span>
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-paper mt-1 tracking-tight">
                      {selectedProject.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    aria-label={t("v4.portfolio.close")}
                    className="p-2 rounded border border-ink-line bg-ink text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors cursor-pointer"
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                <div className="rounded-md overflow-hidden aspect-video mb-6 border border-ink-line bg-ink">
                  <img
                    src={selectedProject.imgUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-paper-muted text-sm sm:text-base leading-relaxed font-normal">
                    {selectedProject.description}
                  </p>

                  {Array.isArray(selectedProject.stack) &&
                    selectedProject.stack.length > 0 && (
                      <div>
                        <h4 className="font-code text-xs text-paper-subtle uppercase tracking-wider mb-2">
                          {t("v4.portfolio.usedTech")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 text-xs font-code bg-ink border border-ink-line text-paper-muted rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-ink-line">
                  {selectedProject.link && selectedProject.link !== "#" && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles.primary + " flex-1 text-center"}
                    >
                      <ExternalLink size={15} />
                      <span>{t("v4.portfolio.openLive")}</span>
                    </a>
                  )}
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles.secondary}
                    >
                      <Github size={15} />
                      <span>{t("v4.portfolio.viewSource")}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className={buttonStyles.secondary}
                  >
                    {t("v4.portfolio.close")}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </Container>
    </Section>
  );
}

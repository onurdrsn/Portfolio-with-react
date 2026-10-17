import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  Castle,
  Router,
  Keyboard,
  Target,
  BrainCircuit,
  Swords,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";

export default function Games() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const games = [
    {
      path: "/games/space-ace-3d",
      titleKey: "games.gameNames.spaceAce3D",
      badge: "3D WebGL",
      icon: <Rocket size={24} className="text-paper" />,
    },
    {
      path: "/games/neon-duel",
      titleKey: "games.gameNames.neonDuel",
      badge: "Action",
      icon: <Swords size={24} className="text-paper" />,
    },
    {
      path: "/games/storypuzzle",
      titleKey: "games.gameNames.storyPuzzle",
      badge: "Puzzle / AI",
      icon: <BrainCircuit size={24} className="text-paper" />,
    },
    {
      path: "/games/minesweeper",
      titleKey: "games.gameNames.minesweeper",
      badge: "Classic",
      icon: <span className="text-2xl leading-none">🧨</span>,
    },
    {
      path: "/games/tictactoe",
      titleKey: "games.gameNames.tictactoe",
      badge: "Mini",
      icon: <span className="text-2xl leading-none">✕◯</span>,
    },
    {
      path: "/games/hangman",
      titleKey: "games.gameNames.hangman",
      badge: "Wordplay",
      icon: <span className="text-2xl leading-none">🔤</span>,
    },
    {
      path: "/games/memory",
      titleKey: "games.gameNames.memory",
      badge: "Cognitive",
      icon: <span className="text-2xl leading-none">🧠</span>,
    },
    {
      path: "/games/router",
      titleKey: "games.gameNames.router",
      badge: "Simulation",
      icon: <Router size={24} className="text-paper" />,
    },
    {
      path: "/games/towerdefense",
      titleKey: "games.gameNames.towerDefense",
      badge: "Strategy",
      icon: <Castle size={24} className="text-paper" />,
    },
    {
      path: "/games/typingspeed",
      titleKey: "games.gameNames.typingSpeed",
      badge: "Benchmark",
      icon: <Keyboard size={24} className="text-paper" />,
    },
    {
      path: "/games/flappybird",
      titleKey: "games.gameNames.flappyBird",
      badge: "Arcade",
      icon: <span className="text-2xl leading-none">🐦</span>,
    },
    {
      path: "/games/breakout",
      titleKey: "games.gameNames.breakout",
      badge: "Retro",
      icon: <Target size={24} className="text-paper" />,
    },
  ];

  return (
    <div className="min-h-screen bg-ink text-paper py-16 px-5 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Section Header */}
        <header className="mb-14 pb-8 border-b border-ink-line">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-signal"></span>
                <span className="text-xs font-code tracking-widest uppercase text-paper-muted">
                  Interactive Lab / 04
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-paper">
                {t("games.title") || "Web Games &"}{" "}
                <span className="text-paper-muted font-normal italic font-serif">
                  {t("games.titleHighlight") || "Canvas Experiments"}
                </span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-paper-muted max-w-md font-sans leading-relaxed">
              {t("games.subtitle") ||
                "A curated playground of interactive mini-games, algorithmic puzzles, and browser canvas simulations built with vanilla JS and React."}
            </p>
          </div>
        </header>

        {/* Games Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game, idx) => (
            <motion.div
              key={game.path}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={springTransition}
              className="h-full"
            >
              <Link
                to={game.path}
                className="group flex flex-col justify-between h-full p-6 rounded-lg bg-ink-raised border border-ink-line hover:border-paper/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-md bg-ink border border-ink-line flex items-center justify-center group-hover:border-paper/30 transition-colors">
                      {game.icon}
                    </div>
                    <span className="text-[10px] font-code uppercase tracking-wider text-paper-muted px-2 py-1 rounded bg-ink border border-ink-line">
                      {game.badge}
                    </span>
                  </div>

                  <span className="text-xs font-code text-paper-muted block mb-1">
                    [0{idx + 1}]
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-paper tracking-tight group-hover:text-white transition-colors">
                    {t(game.titleKey) || game.titleKey.split(".").pop()}
                  </h2>
                </div>

                <div className="mt-8 pt-4 border-t border-ink-line flex items-center justify-between">
                  <span className="text-xs font-code text-paper-muted group-hover:text-paper transition-colors">
                    {t("games.playNow") || "Launch Simulation"}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-paper-muted group-hover:text-paper group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-ink-line flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-code text-paper-muted hover:text-paper transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t("games.backToHome") || "Return to Portfolio"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

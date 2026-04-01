import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Castle, Router, Keyboard, Target } from 'lucide-react';

function Games() {
  const { t } = useTranslation();
  const games = [
    {
      path: "/games/minesweeper",
      icon: "🧨",
      titleKey: "games.gameNames.minesweeper",
      color: "from-red-500/20 to-orange-500/20",
      hoverColor: "hover:border-red-500/50"
    },
    {
      path: "/games/tictactoe",
      icon: "❌⭕",
      titleKey: "games.gameNames.tictactoe",
      color: "from-blue-500/20 to-cyan-500/20",
      hoverColor: "hover:border-blue-500/50"
    },
    {
      path: "/games/hangman",
      icon: "🧍‍♂️",
      titleKey: "games.gameNames.hangman",
      color: "from-purple-500/20 to-pink-500/20",
      hoverColor: "hover:border-purple-500/50"
    },
    {
      path: "/games/memory",
      icon: "🧠",
      titleKey: "games.gameNames.memory",
      color: "from-green-500/20 to-emerald-500/20",
      hoverColor: "hover:border-green-500/50"
    },
    {
      path: "/games/router",
      iconComponent: <Router size={64} className="text-violet-400" />,
      titleKey: "games.gameNames.router",
      color: "from-violet-500/20 to-purple-500/20",
      hoverColor: "hover:border-violet-500/50"
    },
    {
      path: "/games/towerdefense",
      iconComponent: <Castle size={64} className="text-purple-400" />,
      titleKey: "games.gameNames.towerDefense",
      color: "from-purple-500/20 to-indigo-500/20",
      hoverColor: "hover:border-purple-500/50"
    },
    {
      path: "/games/typingspeed",
      iconComponent: <Keyboard size={64} className="text-cyan-400" />,
      titleKey: "games.gameNames.typingSpeed",
      color: "from-cyan-500/20 to-blue-500/20",
      hoverColor: "hover:border-cyan-500/50"
    },
    {
      path: "/games/flappybird",
      icon: "🐦",
      titleKey: "games.gameNames.flappyBird",
      color: "from-yellow-500/20 to-orange-500/20",
      hoverColor: "hover:border-yellow-500/50"
    },
    {
      path: "/games/breakout",
      iconComponent: <Target size={64} className="text-pink-400" />,
      titleKey: "games.gameNames.breakout",
      color: "from-pink-500/20 to-rose-500/20",
      hoverColor: "hover:border-pink-500/50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white py-16 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t('games.title')} <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{t('games.titleHighlight')}</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t('games.subtitle')}
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid gap-6 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <Link
            key={index}
            to={game.path}
            className={`group relative bg-gradient-to-br ${game.color} backdrop-blur-sm border border-gray-700/50 ${game.hoverColor} rounded-xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-2`}
          >
            {/* Icon Container */}
            <div className="flex items-center justify-center mb-4 h-24">
              {game.iconComponent ? (
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {game.iconComponent}
                </div>
              ) : (
                <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors duration-300">
              {t(game.titleKey)}
            </h3>

            {/* Play Button Indicator */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="inline-flex items-center gap-2 text-violet-400 text-sm font-semibold">
                {t('games.playNow')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('games.backToHome')}
        </Link>
      </div>
    </div>
  );
}

export default Games;

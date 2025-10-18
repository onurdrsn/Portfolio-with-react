import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, Server, Router, Trophy, Clock, Zap, Target, Menu, X, Volume2, VolumeX, RotateCcw, Sparkles, Crown, Award } from 'lucide-react';

const RouterGame = () => {
  const [gridSize, setGridSize] = useState(12);
  const [difficulty, setDifficulty] = useState('medium');
  const [servers, setServers] = useState([]);
  const [router, setRouter] = useState(null);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [connectedServers, setConnectedServers] = useState(new Set());
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState('cyberpunk');
  const [particles, setParticles] = useState([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [hintPath, setHintPath] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [gameMode, setGameMode] = useState('classic');
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [totalWins, setTotalWins] = useState(0);

  const timerRef = useRef(null);
  const comboTimerRef = useRef(null);

  const themes = {
    cyberpunk: {
      bg: 'from-slate-900 via-purple-900 to-slate-900',
      router: 'bg-cyan-400 shadow-cyan-400/50',
      server: 'bg-pink-500 shadow-pink-500/50',
      connected: 'bg-purple-500 shadow-purple-500/50',
      path: 'bg-cyan-400',
      grid: 'bg-slate-800/50',
      accent: 'from-cyan-500 to-purple-500'
    },
    neon: {
      bg: 'from-black via-pink-950 to-black',
      router: 'bg-yellow-400 shadow-yellow-400/50',
      server: 'bg-pink-400 shadow-pink-400/50',
      connected: 'bg-green-400 shadow-green-400/50',
      path: 'bg-yellow-400',
      grid: 'bg-gray-900/50',
      accent: 'from-pink-500 to-yellow-500'
    },
    matrix: {
      bg: 'from-black via-green-950 to-black',
      router: 'bg-green-400 shadow-green-400/50',
      server: 'bg-lime-500 shadow-lime-500/50',
      connected: 'bg-emerald-500 shadow-emerald-500/50',
      path: 'bg-green-400',
      grid: 'bg-gray-900/50',
      accent: 'from-green-500 to-lime-500'
    },
    ocean: {
      bg: 'from-blue-950 via-cyan-900 to-blue-950',
      router: 'bg-white shadow-white/50',
      server: 'bg-blue-400 shadow-blue-400/50',
      connected: 'bg-teal-400 shadow-teal-400/50',
      path: 'bg-cyan-300',
      grid: 'bg-blue-900/30',
      accent: 'from-blue-500 to-cyan-500'
    }
  };

  const currentTheme = themes[theme];

  const difficultySettings = {
    easy: { size: 10, servers: 5, obstacles: 0, timeLimit: 0 },
    medium: { size: 12, servers: 8, obstacles: 3, timeLimit: 0 },
    hard: { size: 15, servers: 12, obstacles: 6, timeLimit: 180 },
    expert: { size: 18, servers: 16, obstacles: 10, timeLimit: 120 }
  };

  useEffect(() => {
    if (isPlaying && !gameWon) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, gameWon]);

  useEffect(() => {
    if (gameWon) {
      createParticles();
      checkAchievements();
      updateStats();
    }
  }, [gameWon]);

  const updateStats = () => {
    setTotalGames(prev => prev + 1);
    setTotalWins(prev => prev + 1);
    
    const xpGain = Math.floor(100 + (servers.length * 10) - (time * 0.5) + (combo * 20));
    setExperience(prev => {
      const newXp = prev + xpGain;
      const newLevel = Math.floor(newXp / 500) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        showAchievementPopup({
          icon: <Crown className="text-yellow-400" />,
          title: 'Seviye Atladınız!',
          description: `Seviye ${newLevel} olarak yükseldiniz!`
        });
      }
      return newXp;
    });
  };

  const createParticles = () => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    if (time < 30 && servers.length >= 8) {
      newAchievements.push({
        icon: <Zap className="text-yellow-400" />,
        title: 'Hız Şampiyonu',
        description: '30 saniyeden kısa sürede tamamladınız!'
      });
    }
    
    if (moves === servers.length) {
      newAchievements.push({
        icon: <Target className="text-green-400" />,
        title: 'Mükemmel Oyun',
        description: 'Minimum hamle ile tamamladınız!'
      });
    }
    
    if (combo >= 5) {
      newAchievements.push({
        icon: <Sparkles className="text-purple-400" />,
        title: 'Combo Master',
        description: '5x combo yaptınız!'
      });
    }

    if (newAchievements.length > 0) {
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          showAchievementPopup(achievement);
        }, index * 1000);
      });
    }
  };

  const showAchievementPopup = (achievement) => {
    setShowAchievement(achievement);
    setTimeout(() => setShowAchievement(null), 3000);
  };

  const generateGrid = useCallback((size, diff) => {
    const settings = difficultySettings[diff];
    const serverCount = settings.servers;
    
    const routerPos = { x: Math.floor(size / 2), y: Math.floor(size / 2) };
    
    const newObstacles = [];
    if (gameMode === 'obstacles' || diff === 'hard' || diff === 'expert') {
      for (let i = 0; i < settings.obstacles; i++) {
        let pos;
        let attempts = 0;
        do {
          pos = {
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size)
          };
          attempts++;
        } while (
          ((pos.x === routerPos.x && pos.y === routerPos.y) ||
          newObstacles.some(o => o.x === pos.x && o.y === pos.y)) &&
          attempts < 100
        );
        newObstacles.push(pos);
      }
    }
    
    const newServers = [];
    for (let i = 0; i < serverCount; i++) {
      let pos;
      let attempts = 0;
      do {
        pos = {
          x: Math.floor(Math.random() * size),
          y: Math.floor(Math.random() * size),
          id: i
        };
        attempts++;
      } while (
        ((pos.x === routerPos.x && pos.y === routerPos.y) ||
        newServers.some(s => s.x === pos.x && s.y === pos.y) ||
        newObstacles.some(o => o.x === pos.x && o.y === pos.y)) &&
        attempts < 100
      );
      newServers.push(pos);
    }
    
    const newPowerUps = [];
    if (gameMode === 'powerup') {
      for (let i = 0; i < 3; i++) {
        let pos;
        let attempts = 0;
        do {
          pos = {
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size),
            type: ['hint', 'clear', 'freeze'][i % 3],
            id: i
          };
          attempts++;
        } while (
          ((pos.x === routerPos.x && pos.y === routerPos.y) ||
          newServers.some(s => s.x === pos.x && s.y === pos.y) ||
          newObstacles.some(o => o.x === pos.x && o.y === pos.y) ||
          newPowerUps.some(p => p.x === pos.x && p.y === pos.y)) &&
          attempts < 100
        );
        newPowerUps.push(pos);
      }
    }
    
    setRouter(routerPos);
    setServers(newServers);
    setObstacles(newObstacles);
    setPowerUps(newPowerUps);
    setPaths([]);
    setCurrentPath([]);
    setConnectedServers(new Set());
    setGameWon(false);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setCombo(0);
    setShowCombo(false);
    setHintPath(null);
    setShowHint(false);
  }, [gameMode]);

  useEffect(() => {
    generateGrid(difficultySettings[difficulty].size, difficulty);
  }, []);

  const getCellKey = (x, y) => `${x},${y}`;

  const isAdjacent = (cell1, cell2) => {
    return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y) === 1;
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    // Sound effects placeholder - in real app would play actual sounds
  };

  const handleCellClick = (x, y) => {
    if (gameWon || !isPlaying) return;

    const clickedCell = { x, y };
    
    // Check if it's an obstacle
    if (obstacles.some(o => o.x === x && o.y === y)) {
      playSound('error');
      return;
    }

    // Check if it's a power-up
    const powerUp = powerUps.find(p => p.x === x && p.y === y);
    if (powerUp && !activePowerUp) {
      activatePowerUp(powerUp);
      setPowerUps(powerUps.filter(p => p.id !== powerUp.id));
      return;
    }
    
    if (!isDrawing) {
      if ((x === router.x && y === router.y) || 
          connectedServers.has(getCellKey(x, y))) {
        setIsDrawing(true);
        setCurrentPath([clickedCell]);
        playSound('start');
      }
    } else {
      const lastCell = currentPath[currentPath.length - 1];
      
      if (isAdjacent(lastCell, clickedCell)) {
        const pathKey = getCellKey(x, y);
        if (currentPath.some(cell => getCellKey(cell.x, cell.y) === pathKey)) {
          return;
        }
        
        const crossesOtherPath = paths.some(path => 
          path.some(cell => getCellKey(cell.x, cell.y) === pathKey)
        );
        
        if (crossesOtherPath) {
          playSound('error');
          return;
        }

        if (obstacles.some(o => o.x === x && o.y === y)) {
          playSound('error');
          return;
        }

        const newPath = [...currentPath, clickedCell];
        
        const reachedServer = servers.find(s => s.x === x && s.y === y);
        if (reachedServer && !connectedServers.has(getCellKey(x, y))) {
          setPaths([...paths, newPath]);
          setConnectedServers(new Set([...connectedServers, getCellKey(x, y)]));
          setCurrentPath([]);
          setIsDrawing(false);
          setMoves(prev => prev + 1);
          
          setCombo(prev => prev + 1);
          setShowCombo(true);
          clearTimeout(comboTimerRef.current);
          comboTimerRef.current = setTimeout(() => {
            setCombo(0);
            setShowCombo(false);
          }, 3000);
          
          playSound('connect');
          
          if (connectedServers.size + 1 === servers.length) {
            setGameWon(true);
            setIsPlaying(false);
            playSound('win');
            
            const score = {
              time,
              moves,
              servers: servers.length,
              difficulty,
              combo
            };
            
            if (!bestScore || time < bestScore.time) {
              setBestScore(score);
            }
          }
        } else if (!reachedServer && !(x === router.x && y === router.y)) {
          setCurrentPath(newPath);
          playSound('move');
        }
      }
    }
  };

  const activatePowerUp = (powerUp) => {
    setActivePowerUp(powerUp.type);
    playSound('powerup');
    
    switch(powerUp.type) {
      case 'hint':
        setHints(prev => prev + 1);
        showAchievementPopup({
          icon: <Sparkles className="text-yellow-400" />,
          title: 'İpucu Kazandınız!',
          description: '+1 İpucu eklendi'
        });
        break;
      case 'clear':
        if (paths.length > 0) {
          setPaths([]);
          setConnectedServers(new Set());
          showAchievementPopup({
            icon: <RotateCcw className="text-blue-400" />,
            title: 'Sıfırlama Gücü!',
            description: 'Tüm yollar temizlendi'
          });
        }
        break;
      case 'freeze':
        const frozenTime = time;
        setTimeout(() => {
          setTime(frozenTime);
        }, 10000);
        showAchievementPopup({
          icon: <Clock className="text-cyan-400" />,
          title: 'Zaman Durduruldu!',
          description: '10 saniye zaman kazandınız'
        });
        break;
    }
    
    setTimeout(() => setActivePowerUp(null), 500);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentPath([]);
      playSound('cancel');
    }
  };

  const useHint = () => {
    if (hints <= 0 || gameWon) return;
    
    const unconnectedServers = servers.filter(s => 
      !connectedServers.has(getCellKey(s.x, s.y))
    );
    
    if (unconnectedServers.length === 0) return;
    
    const targetServer = unconnectedServers[0];
    const path = findPath(router, targetServer, paths);
    
    if (path) {
      setHintPath(path);
      setShowHint(true);
      setHints(prev => prev - 1);
      playSound('hint');
      
      setTimeout(() => {
        setShowHint(false);
        setHintPath(null);
      }, 3000);
    }
  };

  const solveGrid = () => {
    const newPaths = [];
    const newConnected = new Set();

    servers.forEach(server => {
      const path = findPath(router, server, newPaths);
      if (path) {
        newPaths.push(path);
        newConnected.add(getCellKey(server.x, server.y));
      }
    });

    setPaths(newPaths);
    setConnectedServers(newConnected);
    setGameWon(true);
    setIsPlaying(false);
    playSound('win');
  };

  const findPath = (start, end, existingPaths) => {
    const queue = [[start]];
    const visited = new Set();
    visited.add(getCellKey(start.x, start.y));

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current.x === end.x && current.y === end.y) {
        return path;
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= difficultySettings[difficulty].size || 
            neighbor.y < 0 || neighbor.y >= difficultySettings[difficulty].size) continue;

        const key = getCellKey(neighbor.x, neighbor.y);
        if (visited.has(key)) continue;

        if (obstacles.some(o => o.x === neighbor.x && o.y === neighbor.y)) continue;

        const crosses = existingPaths.some(p => 
          p.some(cell => getCellKey(cell.x, cell.y) === key)
        );
        if (crosses && !(neighbor.x === end.x && neighbor.y === end.y)) continue;

        visited.add(key);
        queue.push([...path, neighbor]);
      }
    }

    return null;
  };

  const isInPath = (x, y) => {
    return paths.some(path => 
      path.some(cell => cell.x === x && cell.y === y)
    ) || currentPath.some(cell => cell.x === x && cell.y === y);
  };

  const isInHintPath = (x, y) => {
    return showHint && hintPath && hintPath.some(cell => cell.x === x && cell.y === y);
  };

  const isServer = (x, y) => servers.some(s => s.x === x && s.y === y);
  const isRouter = (x, y) => router && router.x === x && router.y === y;
  const isConnected = (x, y) => connectedServers.has(getCellKey(x, y));
  const isObstacle = (x, y) => obstacles.some(o => o.x === x && o.y === y);
  const isPowerUp = (x, y) => powerUps.some(p => p.x === x && p.y === y);

  const getPowerUpIcon = (x, y) => {
    const powerUp = powerUps.find(p => p.x === x && p.y === y);
    if (!powerUp) return null;
    
    switch(powerUp.type) {
      case 'hint': return <Sparkles size={16} className="text-yellow-400" />;
      case 'clear': return <RotateCcw size={16} className="text-blue-400" />;
      case 'freeze': return <Clock size={16} className="text-cyan-400" />;
      default: return null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewGame = () => {
    setTotalGames(prev => prev + 1);
    generateGrid(difficultySettings[difficulty].size, difficulty);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4 md:p-8 relative overflow-hidden transition-all duration-500`}>
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-70 animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 shadow-2xl border-2 border-yellow-300 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{showAchievement.icon}</div>
              <div>
                <h3 className="text-white font-bold text-lg">{showAchievement.title}</h3>
                <p className="text-yellow-100 text-sm">{showAchievement.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combo Display */}
      {showCombo && combo > 1 && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-8 py-4 shadow-2xl border-4 border-white">
            <p className="text-white font-bold text-4xl">{combo}x COMBO!</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Wifi className={`text-cyan-400 animate-pulse`} size={32} />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Router Master</h1>
                <p className="text-gray-300 text-sm">Seviye {level} • XP: {experience % 500}/500</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-black/40 rounded-lg px-4 py-2 flex items-center gap-2">
                <Clock size={20} className="text-cyan-400" />
                <span className="text-white font-mono font-bold">{formatTime(time)}</span>
              </div>
              
              <div className="bg-black/40 rounded-lg px-4 py-2 flex items-center gap-2">
                <Target size={20} className="text-pink-400" />
                <span className="text-white font-bold">{moves} Hamle</span>
              </div>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                {showMenu ? <X className="text-white" /> : <Menu className="text-white" />}
              </button>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${currentTheme.accent} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${(experience % 500) / 5}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div 
              className={`bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/10 relative`}
              onContextMenu={handleRightClick}
            >
              {/* Game Status Overlay */}
              {gameWon && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <Trophy className="text-yellow-400 mx-auto animate-bounce" size={80} />
                    <h2 className="text-4xl font-bold text-white">Tebrikler! 🎉</h2>
                    <div className="space-y-2 text-lg">
                      <p className="text-cyan-400">⏱️ Süre: {formatTime(time)}</p>
                      <p className="text-pink-400">🎯 Hamle: {moves}</p>
                      <p className="text-purple-400">🔥 Combo: {combo}x</p>
                      <p className="text-green-400">⭐ XP: +{Math.floor(100 + (servers.length * 10))}</p>
                    </div>
                    <button
                      onClick={handleNewGame}
                      className={`mt-6 px-8 py-3 bg-gradient-to-r ${currentTheme.accent} text-white rounded-lg font-bold text-lg hover:scale-105 transition-all shadow-lg`}
                    >
                      Yeni Oyun Başlat
                    </button>
                  </div>
                </div>
              )}

              <div 
                className="grid gap-1 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${difficultySettings[difficulty].size}, minmax(0, 1fr))`,
                  maxWidth: '700px'
                }}
              >
                {Array.from({ length: difficultySettings[difficulty].size * difficultySettings[difficulty].size }).map((_, idx) => {
                  const x = idx % difficultySettings[difficulty].size;
                  const y = Math.floor(idx / difficultySettings[difficulty].size);
                  const inPath = isInPath(x, y);
                  const inHint = isInHintPath(x, y);
                  const server = isServer(x, y);
                  const routerCell = isRouter(x, y);
                  const connected = isConnected(x, y);
                  const obstacle = isObstacle(x, y);
                  const powerUp = isPowerUp(x, y);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(x, y)}
                      className={`
                        aspect-square rounded-sm cursor-pointer transition-all duration-200 relative
                        ${routerCell ? `${currentTheme.router} shadow-lg animate-pulse` : ''}
                        ${server && connected ? `${currentTheme.connected} shadow-lg` : ''}
                        ${server && !connected ? `${currentTheme.server} shadow-lg` : ''}
                        ${obstacle ? 'bg-red-500/30 border-2 border-red-500' : ''}
                        ${powerUp ? 'bg-yellow-400/30 border-2 border-yellow-400 animate-pulse' : ''}
                        ${!server && !routerCell && !obstacle && !powerUp && inPath ? currentTheme.path : ''}
                        ${!server && !routerCell && !obstacle && !powerUp && !inPath ? `${currentTheme.grid} hover:bg-white/10` : ''}
                        ${inHint ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
                      `}
                    >
                      {server && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Server size={difficultySettings[difficulty].size > 15 ? 12 : 16} className="text-white" />
                        </div>
                      )}
                      {routerCell && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Router size={difficultySettings[difficulty].size > 15 ? 14 : 18} className="text-slate-900" />
                        </div>
                      )}
                      {obstacle && (
                        <div className="w-full h-full flex items-center justify-center">
                          <X size={difficultySettings[difficulty].size > 15 ? 12 : 16} className="text-red-500" />
                        </div>
                      )}
                      {powerUp && (
                        <div className="w-full h-full flex items-center justify-center">
                          {getPowerUpIcon(x, y)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center space-y-2">
                {isDrawing && (
                  <p className="text-cyan-400 font-medium animate-pulse">
                    🖱️ Sağ tık ile iptal edin
                  </p>
                )}
                {!isDrawing && !gameWon && (
                  <p className="text-gray-300">
                    💡 {connectedServers.size}/{servers.length} Sunucu Bağlandı
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="text-yellow-400" />
                İstatistikler
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Bağlı:</span>
                  <span className="text-cyan-400 font-bold text-xl">{connectedServers.size}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Kalan:</span>
                  <span className="text-pink-400 font-bold text-xl">{servers.length - connectedServers.size}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">İpucu:</span>
                  <span className="text-yellow-400 font-bold text-xl">{hints}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Toplam Oyun:</span>
                  <span className="text-purple-400 font-bold">{totalGames}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Kazanma:</span>
                  <span className="text-green-400 font-bold">{totalWins}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${currentTheme.accent} h-4 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white`}
                      style={{ width: `${(connectedServers.size / servers.length) * 100}%` }}
                    >
                      {Math.round((connectedServers.size / servers.length) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Kontroller</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleNewGame}
                  className={`w-full py-3 px-4 bg-gradient-to-r ${currentTheme.accent} hover:scale-105 text-white rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
                >
                  <Sparkles size={20} />
                  Yeni Oyun
                </button>

                <button
                  onClick={useHint}
                  disabled={hints <= 0 || gameWon}
                  className={`w-full py-3 px-4 ${hints > 0 && !gameWon ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 cursor-not-allowed'} text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2`}
                >
                  <Sparkles size={20} />
                  İpucu ({hints})
                </button>

                <button
                  onClick={solveGrid}
                  className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  Otomatik Çöz
                </button>

                <button
                  onClick={() => {
                    setPaths([]);
                    setConnectedServers(new Set());
                    setCurrentPath([]);
                    setIsDrawing(false);
                    setMoves(0);
                  }}
                  className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Sıfırla
                </button>
              </div>
            </div>

            {/* Settings Card */}
            {showMenu && (
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-slide-in-right">
                <h2 className="text-xl font-bold text-white mb-4">Ayarlar</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Zorluk</label>
                    <select
                      value={difficulty}
                      onChange={(e) => {
                        setDifficulty(e.target.value);
                        generateGrid(difficultySettings[e.target.value].size, e.target.value);
                      }}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border border-white/20"
                    >
                      <option value="easy">Kolay</option>
                      <option value="medium">Orta</option>
                      <option value="hard">Zor</option>
                      <option value="expert">Uzman</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Oyun Modu</label>
                    <select
                      value={gameMode}
                      onChange={(e) => {
                        setGameMode(e.target.value);
                        generateGrid(difficultySettings[difficulty].size, difficulty);
                      }}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border border-white/20"
                    >
                      <option value="classic">Klasik</option>
                      <option value="obstacles">Engelli</option>
                      <option value="powerup">Güçlendirmeli</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Tema</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border border-white/20"
                    >
                      <option value="cyberpunk">Cyberpunk</option>
                      <option value="neon">Neon</option>
                      <option value="matrix">Matrix</option>
                      <option value="ocean">Okyanus</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    Ses {soundEnabled ? 'Açık' : 'Kapalı'}
                  </button>
                </div>
              </div>
            )}

            {/* Best Score Card */}
            {bestScore && (
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border-2 border-yellow-400/50">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="text-yellow-400" />
                  En İyi Skor
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-white">⏱️ {formatTime(bestScore.time)}</p>
                  <p className="text-white">🎯 {bestScore.moves} Hamle</p>
                  <p className="text-white">🔥 {bestScore.combo}x Combo</p>
                  <p className="text-white">📊 {bestScore.difficulty}</p>
                </div>
              </div>
            )}

            {/* How to Play */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Nasıl Oynanır?</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 ${currentTheme.router} rounded mt-1`} />
                  <div>
                    <p className="text-white font-medium">Router</p>
                    <p className="text-gray-400 text-xs">Merkezi bağlantı noktası</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 ${currentTheme.server} rounded mt-1`} />
                  <div>
                    <p className="text-white font-medium">Sunucu</p>
                    <p className="text-gray-400 text-xs">Bağlanması gereken cihaz</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 ${currentTheme.connected} rounded mt-1`} />
                  <div>
                    <p className="text-white font-medium">Bağlı</p>
                    <p className="text-gray-400 text-xs">Router'a bağlanmış sunucu</p>
                  </div>
                </div>

                {gameMode === 'obstacles' && (
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-red-500/30 border-2 border-red-500 rounded mt-1" />
                    <div>
                      <p className="text-white font-medium">Engel</p>
                      <p className="text-gray-400 text-xs">Üzerinden geçilemez</p>
                    </div>
                  </div>
                )}

                {gameMode === 'powerup' && (
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-yellow-400/30 border-2 border-yellow-400 rounded mt-1" />
                    <div>
                      <p className="text-white font-medium">Güçlendirme</p>
                      <p className="text-gray-400 text-xs">Özel yetenekler</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 space-y-1 text-gray-300 text-xs">
                  <p>• Router'dan başlayarak yol çizin</p>
                  <p>• Sunuculara komşu karelerle ulaşın</p>
                  <p>• Yollar kesişemez!</p>
                  <p>• Combo yaparak bonus kazanın</p>
                  <p>• Tüm sunucuları bağlayarak kazanın</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RouterGame;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Castle, Skull, Coins, Heart, Zap, Shield, Target, Play, Pause, RotateCcw, Crown, Swords } from 'lucide-react';

const TowerDefense = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, victory
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedTower, setSelectedTower] = useState(null);
  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(null);

  const GRID_SIZE = 50;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const COLS = Math.floor(CANVAS_WIDTH / GRID_SIZE);
  const ROWS = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

  // Path coordinates
  const PATH = [
    { x: 0, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 1 },
    { x: 6, y: 1 },
    { x: 6, y: 4 },
    { x: 9, y: 4 },
    { x: 9, y: 2 },
    { x: 12, y: 2 },
    { x: 12, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 3 },
    { x: 16, y: 3 }
  ];

  const TOWER_TYPES = {
    arrow: {
      name: 'Ok Kulesi',
      cost: 100,
      damage: 20,
      range: 150,
      fireRate: 1000,
      color: '#10b981',
      icon: '🏹',
      upgradeCost: 150
    },
    cannon: {
      name: 'Top Kulesi',
      cost: 200,
      damage: 50,
      range: 120,
      fireRate: 2000,
      color: '#ef4444',
      icon: '💣',
      upgradeCost: 250
    },
    magic: {
      name: 'Büyü Kulesi',
      cost: 300,
      damage: 30,
      range: 180,
      fireRate: 800,
      color: '#8b5cf6',
      icon: '⚡',
      upgradeCost: 350
    },
    freeze: {
      name: 'Dondurucu',
      cost: 250,
      damage: 10,
      range: 160,
      fireRate: 1500,
      color: '#06b6d4',
      icon: '❄️',
      upgradeCost: 300
    }
  };

  const ENEMY_TYPES = {
    basic: {
      health: 100,
      speed: 1,
      reward: 25,
      color: '#f87171',
      size: 20
    },
    fast: {
      health: 60,
      speed: 2,
      reward: 30,
      color: '#fbbf24',
      size: 15
    },
    tank: {
      health: 300,
      speed: 0.5,
      reward: 50,
      color: '#6366f1',
      size: 30
    },
    boss: {
      health: 1000,
      speed: 0.3,
      reward: 200,
      color: '#dc2626',
      size: 40
    }
  };

  const getPathPoint = (index, progress) => {
    if (index >= PATH.length - 1) {
      return PATH[PATH.length - 1];
    }
    
    const start = PATH[index];
    const end = PATH[index + 1];
    
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress
    };
  };

  const spawnWave = useCallback(() => {
    const newEnemies = [];
    const enemiesCount = 5 + wave * 2;
    
    for (let i = 0; i < enemiesCount; i++) {
      let type = 'basic';
      
      if (wave >= 3 && Math.random() < 0.3) type = 'fast';
      if (wave >= 5 && Math.random() < 0.2) type = 'tank';
      if (wave % 5 === 0 && i === enemiesCount - 1) type = 'boss';
      
      const enemy = {
        id: Date.now() + i,
        type,
        health: ENEMY_TYPES[type].health * (1 + wave * 0.1),
        maxHealth: ENEMY_TYPES[type].health * (1 + wave * 0.1),
        speed: ENEMY_TYPES[type].speed,
        reward: ENEMY_TYPES[type].reward,
        pathIndex: 0,
        pathProgress: -i * 0.2,
        frozen: false,
        freezeTime: 0
      };
      
      newEnemies.push(enemy);
    }
    
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave]);

  const placeTower = (gridX, gridY) => {
    if (!selectedTower || gold < TOWER_TYPES[selectedTower].cost) return;
    
    const isOnPath = PATH.some(p => p.x === gridX && p.y === gridY);
    if (isOnPath) return;
    
    const existingTower = towers.find(t => t.gridX === gridX && t.gridY === gridY);
    if (existingTower) return;
    
    const newTower = {
      id: Date.now(),
      type: selectedTower,
      gridX,
      gridY,
      x: gridX * GRID_SIZE + GRID_SIZE / 2,
      y: gridY * GRID_SIZE + GRID_SIZE / 2,
      lastFire: 0,
      level: 1,
      kills: 0
    };
    
    setTowers(prev => [...prev, newTower]);
    setGold(prev => prev - TOWER_TYPES[selectedTower].cost);
    setSelectedTower(null);
  };

  const upgradeTower = (towerId) => {
    const tower = towers.find(t => t.id === towerId);
    if (!tower) return;
    
    const upgradeCost = TOWER_TYPES[tower.type].upgradeCost * tower.level;
    if (gold < upgradeCost) return;
    
    setTowers(prev => prev.map(t => 
      t.id === towerId ? { ...t, level: t.level + 1 } : t
    ));
    setGold(prev => prev - upgradeCost);
    setShowUpgrade(null);
  };

  const sellTower = (towerId) => {
    const tower = towers.find(t => t.id === towerId);
    if (!tower) return;
    
    const sellValue = Math.floor(TOWER_TYPES[tower.type].cost * 0.7 * tower.level);
    setGold(prev => prev + sellValue);
    setTowers(prev => prev.filter(t => t.id !== towerId));
    setShowUpgrade(null);
  };

  const createParticle = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color,
        life: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = '#1e293b';
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Draw path
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = GRID_SIZE * 0.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    PATH.forEach((point, i) => {
      const x = point.x * GRID_SIZE + GRID_SIZE / 2;
      const y = point.y * GRID_SIZE + GRID_SIZE / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Update and draw enemies
    setEnemies(prev => {
      const updated = prev.map(enemy => {
        if (enemy.pathProgress < 0) {
          return { ...enemy, pathProgress: enemy.pathProgress + 0.02 };
        }

        const speed = enemy.frozen ? enemy.speed * 0.3 : enemy.speed;
        let newProgress = enemy.pathProgress + speed * 0.02;
        let newIndex = enemy.pathIndex;
        
        if (newProgress >= 1) {
          newProgress = 0;
          newIndex++;
          
          if (newIndex >= PATH.length - 1) {
            setLives(l => l - 1);
            return null;
          }
        }
        
        if (enemy.frozen && enemy.freezeTime > 0) {
          return {
            ...enemy,
            pathIndex: newIndex,
            pathProgress: newProgress,
            freezeTime: enemy.freezeTime - 1
          };
        }
        
        return {
          ...enemy,
          pathIndex: newIndex,
          pathProgress: newProgress,
          frozen: enemy.freezeTime > 0,
          freezeTime: Math.max(0, enemy.freezeTime - 1)
        };
      }).filter(e => e !== null && e.health > 0);
      
      // Draw enemies
      updated.forEach(enemy => {
        if (enemy.pathProgress >= 0) {
          const pos = getPathPoint(enemy.pathIndex, enemy.pathProgress);
          const x = pos.x * GRID_SIZE + GRID_SIZE / 2;
          const y = pos.y * GRID_SIZE + GRID_SIZE / 2;
          
          const enemyData = ENEMY_TYPES[enemy.type];
          
          // Enemy body
          ctx.fillStyle = enemy.frozen ? '#06b6d4' : enemyData.color;
          ctx.beginPath();
          ctx.arc(x, y, enemyData.size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Health bar
          const healthBarWidth = enemyData.size;
          const healthPercentage = enemy.health / enemy.maxHealth;
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(x - healthBarWidth / 2, y - enemyData.size / 2 - 8, healthBarWidth, 4);
          ctx.fillStyle = healthPercentage > 0.5 ? '#10b981' : healthPercentage > 0.25 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(x - healthBarWidth / 2, y - enemyData.size / 2 - 8, healthBarWidth * healthPercentage, 4);
        }
      });
      
      return updated;
    });
    
    // Draw towers
    towers.forEach(tower => {
      const towerData = TOWER_TYPES[tower.type];
      
      // Range circle (if selected)
      if (showUpgrade === tower.id) {
        ctx.strokeStyle = towerData.color + '40';
        ctx.fillStyle = towerData.color + '10';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, towerData.range * tower.level * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      // Tower base
      ctx.fillStyle = '#334155';
      ctx.fillRect(tower.x - 20, tower.y - 20, 40, 40);
      
      // Tower top
      ctx.fillStyle = towerData.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 15 + tower.level * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Tower icon
      ctx.font = `${20 + tower.level * 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(towerData.icon, tower.x, tower.y);
      
      // Level indicator
      if (tower.level > 1) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`★${tower.level}`, tower.x, tower.y - 25);
      }
    });
    
    // Update and draw projectiles
    setProjectiles(prev => {
      const updated = prev.map(proj => {
        const target = enemies.find(e => e.id === proj.targetId);
        if (!target || target.health <= 0) return null;
        
        const targetPos = getPathPoint(target.pathIndex, target.pathProgress);
        const tx = targetPos.x * GRID_SIZE + GRID_SIZE / 2;
        const ty = targetPos.y * GRID_SIZE + GRID_SIZE / 2;
        
        const dx = tx - proj.x;
        const dy = ty - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10) {
          // Hit target
          setEnemies(e => e.map(enemy => {
            if (enemy.id === proj.targetId) {
              const newHealth = enemy.health - proj.damage;
              
              if (proj.type === 'freeze') {
                enemy.frozen = true;
                enemy.freezeTime = 60;
              }
              
              if (newHealth <= 0) {
                setGold(g => g + enemy.reward);
                setScore(s => s + enemy.reward);
                setTowers(t => t.map(tower => 
                  tower.id === proj.towerId ? { ...tower, kills: tower.kills + 1 } : tower
                ));
                createParticle(tx, ty, ENEMY_TYPES[enemy.type].color);
              }
              
              return { ...enemy, health: newHealth };
            }
            return enemy;
          }));
          return null;
        }
        
        const speed = 5;
        const angle = Math.atan2(dy, dx);
        
        return {
          ...proj,
          x: proj.x + Math.cos(angle) * speed,
          y: proj.y + Math.sin(angle) * speed
        };
      }).filter(p => p !== null);
      
      // Draw projectiles
      updated.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        ctx.fillStyle = proj.color + '40';
        ctx.beginPath();
        ctx.arc(proj.x - proj.vx, proj.y - proj.vy, proj.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
      
      return updated;
    });
    
    // Update and draw particles
    setParticles(prev => {
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1,
        vy: particle.vy + 0.1
      })).filter(p => p.life > 0);
      
      updated.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        ctx.globalAlpha = 1;
      });
      
      return updated;
    });
    
    // Tower shooting logic
    const now = Date.now();
    towers.forEach(tower => {
      const towerData = TOWER_TYPES[tower.type];
      const fireRate = towerData.fireRate / (1 + (tower.level - 1) * 0.2);
      
      if (now - tower.lastFire < fireRate) return;
      
      const range = towerData.range * (1 + (tower.level - 1) * 0.15);
      const damage = towerData.damage * tower.level;
      
      const target = enemies.find(enemy => {
        if (enemy.health <= 0 || enemy.pathProgress < 0) return false;
        
        const pos = getPathPoint(enemy.pathIndex, enemy.pathProgress);
        const ex = pos.x * GRID_SIZE + GRID_SIZE / 2;
        const ey = pos.y * GRID_SIZE + GRID_SIZE / 2;
        
        const dist = Math.sqrt(
          Math.pow(ex - tower.x, 2) + Math.pow(ey - tower.y, 2)
        );
        
        return dist <= range;
      });
      
      if (target) {
        const proj = {
          id: Date.now() + Math.random(),
          towerId: tower.id,
          targetId: target.id,
          x: tower.x,
          y: tower.y,
          damage,
          color: towerData.color,
          size: 5 + tower.level,
          type: tower.type
        };
        
        setProjectiles(prev => [...prev, proj]);
        tower.lastFire = now;
      }
    });
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, towers, enemies, projectiles, particles, showUpgrade]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
  }, [lives, gameState]);

  useEffect(() => {
    if (enemies.length === 0 && gameState === 'playing' && wave > 0) {
      setTimeout(() => {
        setWave(w => w + 1);
        setGold(g => g + 50 * wave);
      }, 2000);
    }
  }, [enemies.length, gameState, wave]);

  useEffect(() => {
    if (wave > 1 && gameState === 'playing') {
      spawnWave();
    }
  }, [wave, spawnWave, gameState]);

  const startGame = () => {
    setGameState('playing');
    setGold(200);
    setLives(20);
    setWave(1);
    setScore(0);
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setParticles([]);
    setTimeout(() => spawnWave(), 1000);
  };

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    
    const clickedTower = towers.find(t => t.gridX === gridX && t.gridY === gridY);
    
    if (clickedTower) {
      setShowUpgrade(showUpgrade === clickedTower.id ? null : clickedTower.id);
      setSelectedTower(null);
    } else if (selectedTower) {
      placeTower(gridX, gridY);
    } else {
      setShowUpgrade(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Castle className="text-purple-400" size={48} />
            Tower Defense
            <Swords className="text-red-400" size={48} />
          </h1>
          <p className="text-slate-300 text-lg">Düşmanları durdurun, kaleyi koruyun!</p>
        </div>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-purple-500/30 text-center max-w-2xl mx-auto">
            <Castle className="text-purple-400 mx-auto mb-6" size={80} />
            <h2 className="text-4xl font-bold text-white mb-6">Tower Defense</h2>
            <p className="text-slate-300 text-lg mb-8">
              Yolu boyunca kuleler yerleştirin ve düşman dalgalarını durdurun!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-3xl mb-2">{tower.icon}</div>
                  <h3 className="text-white font-bold mb-1">{tower.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">Maliyet: {tower.cost} altın</p>
                  <p className="text-xs text-slate-500">
                    Hasar: {tower.damage} | Menzil: {tower.range} | Hız: {(1000/tower.fireRate).toFixed(1)}/s
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Play size={24} />
              Oyuna Başla
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-red-500/30 text-center max-w-2xl mx-auto">
            <Skull className="text-red-400 mx-auto mb-6 animate-pulse" size={80} />
            <h2 className="text-4xl font-bold text-white mb-6">Oyun Bitti!</h2>
            <div className="space-y-3 text-2xl mb-8">
              <p className="text-purple-400">Dalga: {wave}</p>
              <p className="text-yellow-400">Skor: {score}</p>
            </div>
            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-xl transition-all shadow-lg hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <RotateCcw size={24} />
              Tekrar Oyna
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Canvas */}
            <div className="lg:col-span-3">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                      <Coins className="text-yellow-400" size={24} />
                      <span className="text-white font-bold text-xl">{gold}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg">
                      <Heart className="text-red-400" size={24} />
                      <span className="text-white font-bold text-xl">{lives}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg">
                      <Crown className="text-purple-400" size={24} />
                      <span className="text-white font-bold text-xl">Dalga {wave}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      {gameState === 'playing' ? 
                        <Pause className="text-white" size={24} /> : 
                        <Play className="text-white" size={24} />
                      }
                    </button>
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onClick={handleCanvasClick}
                  className="w-full border-2 border-purple-500/30 rounded-lg cursor-crosshair"
                  style={{ imageRendering: 'pixelated' }}
                />

                {selectedTower && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                    <p className="text-green-300 font-medium">
                      {TOWER_TYPES[selectedTower].icon} {TOWER_TYPES[selectedTower].name} yerleştirmek için tıklayın
                    </p>
                  </div>
                )}

                {gameState === 'paused' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Pause className="text-white mx-auto mb-4" size={64} />
                      <h3 className="text-3xl font-bold text-white">Oyun Duraklatıldı</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tower Selection */}
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="text-purple-400" />
                  Kule Seçimi
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(TOWER_TYPES).map(([key, tower]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTower(selectedTower === key ? null : key)}
                      disabled={gold < tower.cost}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedTower === key
                          ? 'border-green-400 bg-green-500/20'
                          : gold >= tower.cost
                          ? 'border-white/20 bg-white/5 hover:bg-white/10'
                          : 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{tower.icon}</div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-bold">{tower.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Coins className="text-yellow-400" size={14} />
                            <span className="text-yellow-400">{tower.cost}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-black/30 rounded p-1">
                          <p className="text-gray-400">Hasar</p>
                          <p className="text-white font-bold">{tower.damage}</p>
                        </div>
                        <div className="bg-black/30 rounded p-1">
                          <p className="text-gray-400">Menzil</p>
                          <p className="text-white font-bold">{tower.range}</p>
                        </div>
                        <div className="bg-black/30 rounded p-1">
                          <p className="text-gray-400">Hız</p>
                          <p className="text-white font-bold">{(1000/tower.fireRate).toFixed(1)}/s</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tower Info */}
              {showUpgrade && (
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
                  {(() => {
                    const tower = towers.find(t => t.id === showUpgrade);
                    if (!tower) return null;
                    const towerData = TOWER_TYPES[tower.type];
                    const upgradeCost = towerData.upgradeCost * tower.level;
                    const sellValue = Math.floor(towerData.cost * 0.7 * tower.level);

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-4xl">{towerData.icon}</div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{towerData.name}</h3>
                            <p className="text-yellow-400 text-sm">Seviye {tower.level}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Hasar:</span>
                            <span className="text-white font-bold">{towerData.damage * tower.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Menzil:</span>
                            <span className="text-white font-bold">{Math.floor(towerData.range * (1 + (tower.level - 1) * 0.15))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Öldürülen:</span>
                            <span className="text-red-400 font-bold">{tower.kills}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => upgradeTower(tower.id)}
                            disabled={gold < upgradeCost}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                              gold >= upgradeCost
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Zap size={16} />
                            Yükselt ({upgradeCost} <Coins size={14} />)
                          </button>

                          <button
                            onClick={() => sellTower(tower.id)}
                            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Coins size={16} />
                            Sat ({sellValue} altın)
                          </button>

                          <button
                            onClick={() => setShowUpgrade(null)}
                            className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                          >
                            Kapat
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Stats */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="text-cyan-400" />
                  İstatistikler
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-400">Toplam Skor:</span>
                    <span className="text-purple-400 font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-400">Aktif Düşman:</span>
                    <span className="text-red-400 font-bold">{enemies.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-400">Toplam Kule:</span>
                    <span className="text-green-400 font-bold">{towers.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-400">Toplam Öldürme:</span>
                    <span className="text-yellow-400 font-bold">
                      {towers.reduce((sum, t) => sum + t.kills, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-bold text-white mb-3">💡 Nasıl Oynanır?</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Kule seçin ve haritaya yerleştirin</p>
                  <p>• Yol üzerine kule yerleştiremezsiniz</p>
                  <p>• Kulelere tıklayarak yükseltin</p>
                  <p>• Her dalga daha zor olur</p>
                  <p>• Düşmanları durdurun, canınızı koruyun!</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Düşman Tipleri:</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-red-300">🔴 Temel - Orta hız ve can</p>
                    <p className="text-yellow-300">🟡 Hızlı - Düşük can, yüksek hız</p>
                    <p className="text-blue-300">🔵 Tank - Yüksek can, yavaş</p>
                    <p className="text-red-500">🔴 Boss - Her 5 dalgada bir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowerDefense;
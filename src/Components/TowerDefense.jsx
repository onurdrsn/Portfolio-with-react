import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Castle, Skull, Coins, Heart, Zap, Shield, Target, Play, Pause, RotateCcw, Crown, Swords
} from 'lucide-react';

const TowerDefense = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // UI states
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedTower, setSelectedTower] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(null);

  // Game arrays
  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [particles, setParticles] = useState([]);

  // Refs for freshest state inside a stable gameLoop
  const gameStateRef = useRef(gameState);
  const towersRef = useRef(towers);
  const enemiesRef = useRef(enemies);
  const projectilesRef = useRef(projectiles);
  const particlesRef = useRef(particles);
  const goldRef = useRef(gold);
  const livesRef = useRef(lives);
  const waveRef = useRef(wave);
  const scoreRef = useRef(score);
  const showUpgradeRef = useRef(showUpgrade);
  const selectedTowerRef = useRef(selectedTower);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { towersRef.current = towers; }, [towers]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
  useEffect(() => { particlesRef.current = particles; }, [particles]);
  useEffect(() => { goldRef.current = gold; }, [gold]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { waveRef.current = wave; }, [wave]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { showUpgradeRef.current = showUpgrade; }, [showUpgrade]);
  useEffect(() => { selectedTowerRef.current = selectedTower; }, [selectedTower]);

  // Hover cell preview
  const [hoverCell, setHoverCell] = useState(null);

  const GRID_SIZE = 50;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const COLS = Math.floor(CANVAS_WIDTH / GRID_SIZE);
  const ROWS = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

  // Path coordinates (grid)
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
    arrow: { name: 'Ok Kulesi', cost: 100, damage: 20, range: 150, fireRate: 700, color: '#10b981', icon: '🏹', upgradeCost: 150 },
    cannon: { name: 'Top Kulesi', cost: 200, damage: 50, range: 120, fireRate: 1500, color: '#ef4444', icon: '💣', upgradeCost: 250 },
    magic: { name: 'Büyü Kulesi', cost: 300, damage: 30, range: 180, fireRate: 600, color: '#8b5cf6', icon: '⚡', upgradeCost: 350 },
    freeze: { name: 'Dondurucu', cost: 250, damage: 10, range: 160, fireRate: 1200, color: '#06b6d4', icon: '❄️', upgradeCost: 300 }
  };

  const ENEMY_TYPES = {
    basic: { health: 100, speed: 0.6, reward: 25, color: '#f87171', size: 20 }, // Reduced from 1
    fast: { health: 60, speed: 1.2, reward: 30, color: '#fbbf24', size: 15 }, // Reduced from 2
    tank: { health: 300, speed: 0.3, reward: 50, color: '#6366f1', size: 30 }, // Reduced from 0.5
    boss: { health: 1000, speed: 0.2, reward: 200, color: '#dc2626', size: 40 }  // Reduced from 0.3
  };

  const getPathPoint = (index, progress) => {
    if (index >= PATH.length - 1) return PATH[PATH.length - 1];
    const start = PATH[index];
    const end = PATH[index + 1];
    return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
  };

  const spawnWave = useCallback(() => {
    const w = waveRef.current;
    const newEnemies = [];
    const enemiesCount = 5 + w * 2;

    for (let i = 0; i < enemiesCount; i++) {
      let type = 'basic';
      if (w >= 3 && Math.random() < 0.3) type = 'fast';
      if (w >= 5 && Math.random() < 0.2) type = 'tank';
      if (w % 5 === 0 && i === enemiesCount - 1) type = 'boss';

      const base = ENEMY_TYPES[type];
      const hp = base.health * (1 + w * 0.1);
      newEnemies.push({
        id: Date.now() + i + Math.random(),
        type,
        health: hp,
        maxHealth: hp,
        speed: base.speed,
        reward: base.reward,
        pathIndex: 0,
        pathProgress: -i * 0.2, // ardışık doğuş
        frozen: false,
        freezeTime: 0
      });
    }
    setEnemies(prev => [...prev, ...newEnemies]);
  }, []); // use refs inside

  const createParticleBurst = (x, y, color) => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        id: Date.now() + i + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color,
        life: 30
      });
    }
    setParticles(prev => [...prev, ...items]);
  };

  const placeTower = (gridX, gridY) => {
    const tKey = selectedTowerRef.current;
    if (!tKey) return;
    const def = TOWER_TYPES[tKey];
    if (goldRef.current < def.cost) return;

    // path üstü kontrolü: sadece düğümler değil, tam karede yol var mı? (basit: düğüm eşitliği + opsiyonel çizgi)
    const isOnPathNode = PATH.some(p => p.x === gridX && p.y === gridY);
    if (isOnPathNode) return;

    // mevcut kule kontrolü
    if (towersRef.current.some(t => t.gridX === gridX && t.gridY === gridY)) return;

    const newTower = {
      id: Date.now() + Math.random(),
      type: tKey,
      gridX, gridY,
      x: gridX * GRID_SIZE + GRID_SIZE / 2,
      y: gridY * GRID_SIZE + GRID_SIZE / 2,
      lastFire: 0,
      level: 1,
      kills: 0
    };

    setTowers(prev => [...prev, newTower]);
    setGold(prev => prev - def.cost);
    setSelectedTower(null);
  };

  const upgradeTower = (towerId) => {
    const tList = towersRef.current;
    const idx = tList.findIndex(t => t.id === towerId);
    if (idx === -1) return;
    const t = tList[idx];
    const cost = TOWER_TYPES[t.type].upgradeCost * t.level;
    if (goldRef.current < cost) return;

    setTowers(prev => prev.map(x => x.id === towerId ? { ...x, level: x.level + 1 } : x));
    setGold(prev => prev - cost);
    setShowUpgrade(null);
  };

  const sellTower = (towerId) => {
    const t = towersRef.current.find(t => t.id === towerId);
    if (!t) return;
    const value = Math.floor(TOWER_TYPES[t.type].cost * 0.7 * t.level);
    setGold(prev => prev + value);
    setTowers(prev => prev.filter(x => x.id !== towerId));
    setShowUpgrade(null);
  };

  // MAIN GAME LOOP (stable)
  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // locals
    const now = Date.now();
    const currentTowers = [...towersRef.current];
    const currentEnemies = [...enemiesRef.current];
    const currentProjectiles = [...projectilesRef.current];
    const currentParticles = [...particlesRef.current];

    // ===== CLEAR BACKGROUND
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // grid
    ctx.strokeStyle = '#1e293b';
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // path
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = GRID_SIZE * 0.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    PATH.forEach((p, i) => {
      const x = p.x * GRID_SIZE + GRID_SIZE / 2;
      const y = p.y * GRID_SIZE + GRID_SIZE / 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineWidth = 1;

    // ===== ENEMIES: move + draw
    let livesLoss = 0;
    const movedEnemies = currentEnemies.map(enemy => {
      let e = { ...enemy };

      if (e.pathProgress < 0) {
        e.pathProgress = e.pathProgress + 0.02;
        return e;
      }

      const speed = e.frozen ? e.speed * 0.3 : e.speed;
      let newProg = e.pathProgress + speed * 0.02;
      let newIdx = e.pathIndex;

      if (newProg >= 1) {
        newProg = 0;
        newIdx++;
        if (newIdx >= PATH.length - 1) {
          livesLoss += 1;
          return null; // remove, reached end
        }
      }

      if (e.frozen && e.freezeTime > 0) {
        e.freezeTime -= 1;
      } else if (e.freezeTime <= 0) {
        e.frozen = false;
      }

      e.pathProgress = newProg;
      e.pathIndex = newIdx;
      return e;
    }).filter(Boolean);

    // draw enemies
    movedEnemies.forEach(e => {
      if (e.pathProgress < 0) return;
      const pos = getPathPoint(e.pathIndex, e.pathProgress);
      const x = pos.x * GRID_SIZE + GRID_SIZE / 2;
      const y = pos.y * GRID_SIZE + GRID_SIZE / 2;
      const def = ENEMY_TYPES[e.type];

      ctx.fillStyle = e.frozen ? '#06b6d4' : def.color;
      ctx.beginPath(); ctx.arc(x, y, def.size / 2, 0, Math.PI * 2); ctx.fill();

      // health bar
      const w = def.size;
      const pct = e.health / e.maxHealth;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(x - w / 2, y - def.size / 2 - 8, w, 4);
      ctx.fillStyle = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(x - w / 2, y - def.size / 2 - 8, w * pct, 4);
    });

    // ===== TOWERS: draw + shoot (collect new projectiles)
    let towersNext = currentTowers.map(t => ({ ...t })); // allow lastFire update immutably
    const newProjectiles = [];

    towersNext.forEach(tower => {
      const def = TOWER_TYPES[tower.type];

      // range preview if selected for upgrade
      if (showUpgradeRef.current === tower.id) {
        ctx.strokeStyle = def.color + '40';
        ctx.fillStyle = def.color + '10';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, def.range * tower.level * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // base
      ctx.fillStyle = '#334155';
      ctx.fillRect(tower.x - 20, tower.y - 20, 40, 40);
      // top
      ctx.fillStyle = def.color;
      ctx.beginPath(); ctx.arc(tower.x, tower.y, 15 + tower.level * 2, 0, Math.PI * 2); ctx.fill();
      // icon
      ctx.font = `${20 + tower.level * 2}px Arial`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(def.icon, tower.x, tower.y);
      // level
      if (tower.level > 1) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`★${tower.level}`, tower.x, tower.y - 25);
      }

      // shooting
      const fireRate = def.fireRate / (1 + (tower.level - 1) * 0.2);
      if (now - tower.lastFire >= fireRate) {
        const range = def.range * (1 + (tower.level - 1) * 0.15);
        const damage = def.damage * tower.level;

        const target = movedEnemies.find(e => {
          if (e.health <= 0 || e.pathProgress < 0) return false;
          const pos = getPathPoint(e.pathIndex, e.pathProgress);
          const ex = pos.x * GRID_SIZE + GRID_SIZE / 2;
          const ey = pos.y * GRID_SIZE + GRID_SIZE / 2;
          const dist = Math.hypot(ex - tower.x, ey - tower.y);
          return dist <= range;
        });

        if (target) {
          newProjectiles.push({
            id: Date.now() + Math.random(),
            towerId: tower.id,
            targetId: target.id,
            x: tower.x,
            y: tower.y,
            damage,
            color: def.color,
            size: 5 + tower.level,
            type: tower.type,
            vx: 0, vy: 0
          });
          tower.lastFire = now; // on local copy (immutably managed via towersNext)
        }
      }
    });

    // ===== PROJECTILES: move, hit, draw
    let goldGain = 0;
    let scoreGain = 0;
    const killIncrements = new Map(); // towerId -> +kills
    const projAfterMove = [...currentProjectiles, ...newProjectiles].map(p => {
      const target = movedEnemies.find(e => e.id === p.targetId && e.health > 0);
      if (!target) return null;

      const pos = getPathPoint(target.pathIndex, target.pathProgress);
      const tx = pos.x * GRID_SIZE + GRID_SIZE / 2;
      const ty = pos.y * GRID_SIZE + GRID_SIZE / 2;

      const dx = tx - p.x;
      const dy = ty - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 10) {
        // hit
        const def = ENEMY_TYPES[target.type];
        const idx = movedEnemies.findIndex(e => e.id === target.id);
        if (idx !== -1) {
          const e = { ...movedEnemies[idx] };
          e.health -= p.damage;

          if (p.type === 'freeze') {
            e.frozen = true;
            e.freezeTime = 60;
          }

          if (e.health <= 0) {
            goldGain += e.reward;
            scoreGain += e.reward;
            killIncrements.set(p.towerId, (killIncrements.get(p.towerId) || 0) + 1);
            createParticleBurst(tx, ty, def.color);
            movedEnemies.splice(idx, 1); // remove dead
          } else {
            movedEnemies[idx] = e; // write back damaged enemy
          }
        }
        return null;
      }

      const speed = 5;
      const angle = Math.atan2(dy, dx);
      return { ...p, x: p.x + Math.cos(angle) * speed, y: p.y + Math.sin(angle) * speed, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    }).filter(Boolean);

    // draw projectiles
    projAfterMove.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2); ctx.fill();
      // trail
      ctx.fillStyle = proj.color + '40';
      ctx.beginPath(); ctx.arc(proj.x - proj.vx, proj.y - proj.vy, proj.size * 0.7, 0, Math.PI * 2); ctx.fill();
    });

    // ===== PARTICLES: update + draw
    const particlesNext = currentParticles.map(pt => {
      const p = { ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, life: pt.life - 1, vy: pt.vy + 0.1 };
      return p.life > 0 ? p : null;
    }).filter(Boolean);

    particlesNext.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 30;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    });

    // ===== HOVER CELL PREVIEW
    if (hoverCell && selectedTowerRef.current) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#22c55e22';
      ctx.fillRect(hoverCell.x * GRID_SIZE, hoverCell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      ctx.strokeRect(hoverCell.x * GRID_SIZE, hoverCell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      ctx.restore();
    }

    // ===== APPLY ACCUMULATED STATE CHANGES (once)
    if (livesLoss > 0) setLives(prev => Math.max(0, prev - livesLoss));
    if (goldGain > 0) setGold(prev => prev + goldGain);
    if (scoreGain > 0) setScore(prev => prev + scoreGain);

    // apply kill increments + lastFire changes
    if (killIncrements.size > 0 || true) {
      towersNext = towersNext.map(t => {
        const inc = killIncrements.get(t.id) || 0;
        return inc ? { ...t, kills: t.kills + inc } : { ...t };
      });
    }

    setEnemies(movedEnemies);
    setProjectiles(projAfterMove);
    setParticles(particlesNext);
    setTowers(towersNext);

    // schedule next frame
    animationRef.current = requestAnimationFrame(gameLoop);
  }, []); // stable

  // Start/Stop the loop on state change
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, gameLoop]);

  // game over
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') setGameState('gameOver');
  }, [lives, gameState]);

  // spawn next wave when enemies cleared
  useEffect(() => {
    if (enemies.length === 0 && gameState === 'playing' && wave > 0) {
      setTimeout(() => {
        setWave(w => w + 1);
        setGold(g => g + 50 * waveRef.current);
      }, 2000);
    }
  }, [enemies.length, gameState, wave]);

  // when wave increments during play, spawn immediately
  useEffect(() => {
    if (wave > 1 && gameState === 'playing') spawnWave();
  }, [wave, gameState, spawnWave]);

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
    setTimeout(() => spawnWave(), 800);
  };

  const handleCanvasClick = (e) => {
    if (gameStateRef.current !== 'playing') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);

    // if clicked on tower -> toggle upgrade panel
    const clicked = towersRef.current.find(t => t.gridX === gridX && t.gridY === gridY);
    if (clicked) {
      setShowUpgrade(prev => (prev === clicked.id ? null : clicked.id));
      setSelectedTower(null);
      return;
    }

    if (selectedTowerRef.current) {
      placeTower(gridX, gridY);
    } else {
      setShowUpgrade(null);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS) {
      setHoverCell({ x: gridX, y: gridY });
    } else {
      setHoverCell(null);
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

        {/* Menu */}
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
                  <p className="text-sm text-slate-300 mb-2">Maliyet: {tower.cost} altın</p>
                  <p className="text-xs text-slate-400">
                    Hasar: {tower.damage} | Menzil: {tower.range} | Hız: {(1000 / tower.fireRate).toFixed(1)}/s
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

        {/* Game Over */}
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

        {/* Playing & Paused */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-3 relative">
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
                      {gameState === 'playing' ? <Pause className="text-white" size={24} /> : <Play className="text-white" size={24} />}
                    </button>
                  </div>
                </div>

                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
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
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none">
                    <div className="text-center">
                      <Pause className="text-white mx-auto mb-4" size={64} />
                      <h3 className="text-3xl font-bold text-white">Oyun Duraklatıldı</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Tower selection */}
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
                      className={`w-full p-4 rounded-lg border-2 transition-all ${selectedTower === key
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
                          <p className="text-white font-bold">{(1000 / tower.fireRate).toFixed(1)}/s</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrade panel */}
              {showUpgrade && (
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
                  {(() => {
                    const tower = towers.find(t => t.id === showUpgrade);
                    if (!tower) return null;
                    const def = TOWER_TYPES[tower.type];
                    const upgradeCost = def.upgradeCost * tower.level;
                    const sellValue = Math.floor(def.cost * 0.7 * tower.level);

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-4xl">{def.icon}</div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{def.name}</h3>
                            <p className="text-yellow-400 text-sm">Seviye {tower.level}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Hasar:</span>
                            <span className="text-white font-bold">{def.damage * tower.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Menzil:</span>
                            <span className="text-white font-bold">
                              {Math.floor(def.range * (1 + (tower.level - 1) * 0.15))}
                            </span>
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
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${gold >= upgradeCost ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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

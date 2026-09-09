import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { 
  Swords, 
  Globe, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Shield, 
  Zap, 
  Award, 
  Smartphone, 
  Bot,
  Users,
  Radio,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  Target,
  User,
  Maximize,
  Minimize
} from 'lucide-react';

const WORKER_URL = 'https://portfolio-worker.onurd.com.tr';

// Sound Synthesizer using Web Audio API
const playAudioEffect = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'shoot') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'shield') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context not allowed until user interaction
  }
};

export default function NeonDuel() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'tr';
  const isTr = currentLang.startsWith('tr');

  // Lobby States: 'menu' | 'waiting' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState('online'); // 'online' or 'bot'
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [myRole, setMyRole] = useState('p1');
  const [myPlayerId, setMyPlayerId] = useState('');
  
  // Custom Username State
  const [customUsername, setCustomUsername] = useState('SiberOyuncu');
  const [p1Name, setP1Name] = useState('SiberOyuncu');
  const [p2Name, setP2Name] = useState('RakipOyuncu');

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [winnerRole, setWinnerRole] = useState(null);

  // Sound & Fullscreen Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Mobile Detection & Touch Controls
  const [isMobile, setIsMobile] = useState(false);
  const touchJoystickRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  // Canvas Refs & Game Engine Data
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const syncIntervalRef = useRef(null);

  const gameEngineRef = useRef({
    p1: { x: 100, y: 300, vx: 0, vy: 0, angle: 0, hp: 100, score: 0, shield: false, name: 'SiberOyuncu' },
    p2: { x: 700, y: 300, vx: 0, vy: 0, angle: Math.PI, hp: 100, score: 0, shield: false, name: 'RakipOyuncu' },
    bullets: [],
    particles: [],
    obstacles: [
      { x: 350, y: 150, w: 100, h: 40 },
      { x: 350, y: 410, w: 100, h: 40 },
      { x: 200, y: 280, w: 40, h: 100 },
      { x: 560, y: 280, w: 40, h: 100 }
    ]
  });

  const keysRef = useRef({});

  // Detect Mobile Device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard Listeners (Prevent Default Page Scroll on Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const gameKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
        'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyK', 'KeyL', 'Enter'
      ];
      if (gameKeys.includes(e.code) || gameKeys.includes(e.key)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ─── 1. Create Room (Online) ─────────────────────────────────────────────
  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'SiberOyuncu';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/create-room`, {
        name: myName
      });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole('p1');
        setP1Name(myName);
        gameEngineRef.current.p1.name = myName;
        setMyPlayerId(res.data.playerId);
        setGameState('waiting');
        startWaitingForPlayer(res.data.code);
      }
    } catch (err) {
      setErrorMessage(isTr ? 'Oda oluşturulamadı. Bağlantınızı kontrol edin.' : 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Join Room (Online) ───────────────────────────────────────────────
  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'SiberOyuncu';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/join-room`, {
        code: inputCode.toUpperCase().trim(),
        name: myName
      });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole('p2');
        setP2Name(myName);
        gameEngineRef.current.p2.name = myName;
        if (res.data.room?.p1?.name) {
          setP1Name(res.data.room.p1.name);
          gameEngineRef.current.p1.name = res.data.room.p1.name;
        }
        setMyPlayerId(res.data.playerId);
        setGameState('playing');
        startOnlineSync(res.data.code, 'p2');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || (isTr ? 'Odaya katılanılamadı.' : 'Failed to join room.'));
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. Quick Match (Online) ─────────────────────────────────────────────
  const handleQuickMatch = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'SiberOyuncu';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/quick-match`, {
        name: myName
      });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole(res.data.role);
        setMyPlayerId(res.data.playerId);
        if (res.data.role === 'p1') {
          setP1Name(myName);
          gameEngineRef.current.p1.name = myName;
          setGameState('waiting');
          startWaitingForPlayer(res.data.code);
        } else {
          setP2Name(myName);
          gameEngineRef.current.p2.name = myName;
          if (res.data.room?.p1?.name) {
            setP1Name(res.data.room.p1.name);
            gameEngineRef.current.p1.name = res.data.room.p1.name;
          }
          setGameState('playing');
          startOnlineSync(res.data.code, 'p2');
        }
      }
    } catch (err) {
      setErrorMessage(isTr ? 'Eşleşme sağlanamadı.' : 'Matchmaking failed.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 4. Play vs AI Bot (PvE Offline) ─────────────────────────────────────
  const handleStartBotGame = () => {
    const myName = customUsername.trim() || 'SiberOyuncu';
    setGameMode('bot');
    setMyRole('p1');
    setP1Name(myName);
    setP2Name('CyberBot 3000');
    gameEngineRef.current.p1.name = myName;
    gameEngineRef.current.p2.name = 'CyberBot 3000';
    setGameState('playing');

    gameEngineRef.current.p1.hp = 100;
    gameEngineRef.current.p1.x = 100;
    gameEngineRef.current.p1.y = 300;
    gameEngineRef.current.p2.hp = 100;
    gameEngineRef.current.p2.x = 700;
    gameEngineRef.current.p2.y = 300;
    gameEngineRef.current.bullets = [];
    gameEngineRef.current.particles = [];
  };

  // Poll waiting room until P2 joins
  const startWaitingForPlayer = (code) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${WORKER_URL}/api/game/room-status?code=${code}`);
        if (res.data?.room?.status === 'playing') {
          clearInterval(interval);
          if (res.data.room.p2?.name) {
            setP2Name(res.data.room.p2.name);
            gameEngineRef.current.p2.name = res.data.room.p2.name;
          }
          setGameState('playing');
          startOnlineSync(code, 'p1');
        }
      } catch (e) {
        // keep polling
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // Real-time State Sync with Cloudflare Worker Backend
  const startOnlineSync = (code, role) => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(async () => {
      const myObj = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;

      try {
        const res = await axios.post(`${WORKER_URL}/api/game/sync-state`, {
          code,
          role,
          x: myObj.x,
          y: myObj.y,
          angle: myObj.angle,
          hp: myObj.hp,
          score: myObj.score,
          shield: myObj.shield,
          newBullets: myObj.pendingBullets || []
        });

        myObj.pendingBullets = [];

        if (res.data?.ok) {
          const opp = res.data.opponent;
          if (opp) {
            const oppObj = role === 'p1' ? gameEngineRef.current.p2 : gameEngineRef.current.p1;
            oppObj.x = opp.x;
            oppObj.y = opp.y;
            oppObj.angle = opp.angle;
            oppObj.hp = opp.hp;
            oppObj.shield = opp.shield;
            if (opp.name) {
              oppObj.name = opp.name;
              if (role === 'p1') setP2Name(opp.name);
              else setP1Name(opp.name);
            }
          }

          if (res.data.status === 'finished') {
            setWinnerRole(res.data.winner);
            setGameState('gameover');
            clearInterval(syncIntervalRef.current);
            confetti({ particleCount: 150, spread: 90 });
          }
        }
      } catch (e) {
        console.error('Sync error:', e);
      }
    }, 100);
  };

  // Copy Room Code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fire Weapon Action
  const triggerFire = (role) => {
    const p = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;
    if (p.hp <= 0) return;

    const speed = 12;
    const vx = Math.cos(p.angle) * speed;
    const vy = Math.sin(p.angle) * speed;

    const bullet = {
      id: `b-${Date.now()}-${Math.random()}`,
      owner: role,
      x: p.x + Math.cos(p.angle) * 20,
      y: p.y + Math.sin(p.angle) * 20,
      vx,
      vy
    };

    gameEngineRef.current.bullets.push(bullet);
    if (!p.pendingBullets) p.pendingBullets = [];
    p.pendingBullets.push(bullet);

    if (soundEnabled) playAudioEffect('shoot');
  };

  // Trigger Shield Action
  const triggerShield = (role) => {
    const p = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;
    p.shield = true;
    if (soundEnabled) playAudioEffect('shield');
    setTimeout(() => {
      p.shield = false;
    }, 1500);
  };

  // Touch Controls Setup (Mobile Joystick)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchJoystickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      dx: 0,
      dy: 0
    };
  };

  const handleTouchMove = (e) => {
    if (!touchJoystickRef.current.active) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchJoystickRef.current.startX;
    const dy = touch.clientY - touchJoystickRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40;

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxDist);

    touchJoystickRef.current.dx = Math.cos(angle) * (clampedDist / maxDist);
    touchJoystickRef.current.dy = Math.sin(angle) * (clampedDist / maxDist);

    setJoystickPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist
    });
  };

  const handleTouchEnd = () => {
    touchJoystickRef.current = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    setJoystickPos({ x: 0, y: 0 });
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateAndRender = () => {
      const state = gameEngineRef.current;
      const myObj = myRole === 'p1' ? state.p1 : state.p2;
      const speed = 4.5;

      let moveX = 0;
      let moveY = 0;

      if (touchJoystickRef.current.active) {
        moveX = touchJoystickRef.current.dx;
        moveY = touchJoystickRef.current.dy;
      } else {
        if (myRole === 'p1') {
          if (keysRef.current['KeyW']) moveY -= 1;
          if (keysRef.current['KeyS']) moveY += 1;
          if (keysRef.current['KeyA']) moveX -= 1;
          if (keysRef.current['KeyD']) moveX += 1;
          if (keysRef.current['KeyF'] || keysRef.current['Space']) {
            triggerFire('p1');
            keysRef.current['KeyF'] = false;
            keysRef.current['Space'] = false;
          }
          if (keysRef.current['KeyG']) {
            triggerShield('p1');
            keysRef.current['KeyG'] = false;
          }
        } else {
          if (keysRef.current['ArrowUp']) moveY -= 1;
          if (keysRef.current['ArrowDown']) moveY += 1;
          if (keysRef.current['ArrowLeft']) moveX -= 1;
          if (keysRef.current['ArrowRight']) moveX += 1;
          if (keysRef.current['KeyL'] || keysRef.current['Enter']) {
            triggerFire('p2');
            keysRef.current['KeyL'] = false;
            keysRef.current['Enter'] = false;
          }
          if (keysRef.current['KeyK']) {
            triggerShield('p2');
            keysRef.current['KeyK'] = false;
          }
        }
      }

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        const nx = myObj.x + (moveX / len) * speed;
        const ny = myObj.y + (moveY / len) * speed;

        if (nx > 25 && nx < 775) myObj.x = nx;
        if (ny > 25 && ny < 575) myObj.y = ny;

        myObj.angle = Math.atan2(moveY, moveX);
      }

      // AI Bot Logic
      if (gameMode === 'bot') {
        const bot = state.p2;
        const target = state.p1;
        const dx = target.x - bot.x;
        const dy = target.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        bot.angle = Math.atan2(dy, dx);
        if (dist > 150) {
          bot.x += Math.cos(bot.angle) * (speed * 0.7);
          bot.y += Math.sin(bot.angle) * (speed * 0.7);
        }

        if (Math.random() < 0.03) {
          triggerFire('p2');
        }
      }

      // Bullets & Collisions
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 10 || b.x > 790 || b.y < 10 || b.y > 590) {
          state.bullets.splice(i, 1);
          continue;
        }

        if (b.owner !== 'p1') {
          const d = Math.hypot(b.x - state.p1.x, b.y - state.p1.y);
          if (d < 22) {
            if (!state.p1.shield) {
              state.p1.hp = Math.max(0, state.p1.hp - 15);
              if (soundEnabled) playAudioEffect('hit');
              for (let p = 0; p < 8; p++) {
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#38bdf8',
                  life: 1
                });
              }
            }
            state.bullets.splice(i, 1);
            continue;
          }
        }

        if (b.owner !== 'p2') {
          const d = Math.hypot(b.x - state.p2.x, b.y - state.p2.y);
          if (d < 22) {
            if (!state.p2.shield) {
              state.p2.hp = Math.max(0, state.p2.hp - 15);
              if (soundEnabled) playAudioEffect('hit');
              for (let p = 0; p < 8; p++) {
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#f43f5e',
                  life: 1
                });
              }
            }
            state.bullets.splice(i, 1);
            continue;
          }
        }
      }

      if (gameMode === 'bot') {
        if (state.p1.hp <= 0) {
          setWinnerRole('p2');
          setGameState('gameover');
          return;
        }
        if (state.p2.hp <= 0) {
          setWinnerRole('p1');
          setGameState('gameover');
          confetti({ particleCount: 150, spread: 90 });
          return;
        }
      }

      // Render 2D Cyber Grid Arena
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render Obstacles
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      for (const obs of state.obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      }

      // Render Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.05;
        if (pt.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Render Bullets
      for (const b of state.bullets) {
        ctx.shadowColor = b.owner === 'p1' ? '#38bdf8' : '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillStyle = b.owner === 'p1' ? '#38bdf8' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render Player 1 & Player 2 with Custom Usernames
      drawPlayer(ctx, state.p1, '#38bdf8', state.p1.name || p1Name);
      drawPlayer(ctx, state.p2, '#f43f5e', state.p2.name || p2Name);

      animationFrameRef.current = requestAnimationFrame(updateAndRender);
    };

    animationFrameRef.current = requestAnimationFrame(updateAndRender);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, myRole, gameMode, soundEnabled, p1Name, p2Name]);

  const drawPlayer = (ctx, p, color, label) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.shield) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.restore();

    // HP Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(p.x - 25, p.y - 32, 50, 6);
    ctx.fillStyle = p.hp > 50 ? '#22c55e' : p.hp > 25 ? '#eab308' : '#ef4444';
    ctx.fillRect(p.x - 25, p.y - 32, (p.hp / 100) * 50, 6);

    // Custom Username Tag over head
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label || 'Oyuncu', p.x, p.y - 38);
  };

  const getWinnerName = () => {
    if (winnerRole === 'p1') return gameEngineRef.current.p1.name || p1Name;
    if (winnerRole === 'p2') return gameEngineRef.current.p2.name || p2Name;
    return 'Oyuncu';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-indigo-950 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-inter select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Bar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl">
          <Link to="/games" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold transition-colors text-sm">
            ← {t('games.backToHome') || 'Oyunlara Dön'}
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-600/20 border border-pink-500/30 rounded-xl">
              <Swords className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {isTr ? 'Online Siber Düello (1v1)' : 'Online Cyber Duel (1v1)'}
              </h1>
              <p className="text-[11px] text-gray-400">Özel Kullanıcı Adları • Oda Kodu Eşleşmesi • Mobil Dokunmatik Desteği</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors border border-gray-700 flex items-center gap-1.5 text-xs font-semibold"
              title={isTr ? 'Tam Ekran Yap / Çık' : 'Toggle Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-cyan-400" /> : <Maximize className="w-4 h-4 text-cyan-400" />}
              <span className="hidden sm:inline">{isFullscreen ? (isTr ? 'Tam Ekrandan Çık' : 'Exit Fullscreen') : (isTr ? 'Tam Ekran' : 'Fullscreen')}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors border border-gray-700"
              title="Ses Aç/Kapat"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
        </div>

        {/* ─── LOBBY STATE: MENU / CREATE / JOIN / CUSTOM USERNAME ─────────────── */}
        {gameState === 'menu' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Username Input Banner */}
            <div className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <User className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold text-gray-300">
                  {isTr ? 'Kullanıcı Adınız:' : 'Your Nickname:'}
                </span>
              </div>

              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="Örn: @SiberSavaşçı"
                className="w-full sm:w-64 bg-gray-950 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-cyan-300 font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room Card */}
              <div className="bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {isTr ? 'Yeni Online Oda Kur' : 'Create Online Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? '4 haneli özel bir oda kodu üretin. Kodunuzu arkadaşınıza atarak telefon veya bilgisayardan anında bağlanmasını sağlayın.' 
                      : 'Generate a 4-letter room code. Share with your friend to connect instantly from any device.'}
                  </p>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    {errorMessage}
                  </p>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{isTr ? 'Oda Kodu Üret' : 'Generate Room Code'}</span>
                </button>
              </div>

              {/* Join Room Code Card */}
              <div className="bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {isTr ? 'Arkadaşının Odasına Katıl' : 'Join Friend\'s Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? 'Arkadaşının oluşturduğu 4 haneli oda kodunu girerek kapışmaya hemen katılın.' 
                      : 'Enter the 4-letter room code shared by your friend to join the duel.'}
                  </p>

                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="ÖRN: X9B2"
                    className="w-full bg-gray-950 border border-gray-700 focus:border-pink-500 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-pink-300 placeholder-gray-600 outline-none uppercase"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!inputCode.trim() || loading}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-pink-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTr ? 'Odaya Bağlan & Oyna' : 'Join & Battle'}</span>
                </button>
              </div>
            </div>

            {/* Quick Match & Bot Mode Bar */}
            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-violet-400" />
                <span className="text-xs text-gray-300 font-semibold">
                  {isTr ? 'Diğer Seçenekler:' : 'Other Modes:'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleQuickMatch}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  <span>{isTr ? 'Rastgele Hızlı Eşleşme' : 'Random Quick Match'}</span>
                </button>

                <button
                  onClick={handleStartBotGame}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? 'Bot AI ile Pratik Yap' : 'Practice vs Bot AI'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ─── WAITING STATE: RADAR WAITING FOR P2 ────────────────────────────── */}
        {gameState === 'waiting' && (
          <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl text-center space-y-6 max-w-lg mx-auto animate-fadeIn">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/40 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                {isTr ? 'Rakibin Katılması Bekleniyor...' : 'Waiting for Opponent...'}
              </h2>
              <p className="text-xs text-gray-400">
                {isTr ? 'Aşağıdaki oda kodunu kopyalayıp arkadaşınıza gönderin:' : 'Copy and share this room code:'}
              </p>
            </div>

            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex items-center justify-between max-w-xs mx-auto">
              <span className="text-3xl font-mono font-black tracking-widest text-cyan-400">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isTr ? 'Kopyalandı!' : 'Copied!') : (isTr ? 'Kopyala' : 'Copy')}</span>
              </button>
            </div>

            <button
              onClick={() => setGameState('menu')}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {isTr ? 'Lobiye Dön / İptal Et' : 'Cancel & Back to Lobby'}
            </button>
          </div>
        )}

        {/* ─── PLAYING STATE: 2D NEON CANVAS ARENA & TOUCH CONTROLS ──────────── */}
        {gameState === 'playing' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* HUD Status Bar with Custom Usernames */}
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
              
              {/* P1 Status */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50"></div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 block">
                    {gameEngineRef.current.p1.name || p1Name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">HP: {gameEngineRef.current.p1.hp}%</span>
                </div>
              </div>

              {/* Match Mode Badge */}
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {gameMode === 'bot' ? 'PvE Bot Maçı' : `Oda Kodu: ${roomCode}`}
                </span>
              </div>

              {/* P2 Status */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-xs font-bold text-pink-400 block">
                    {gameEngineRef.current.p2.name || p2Name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">HP: {gameEngineRef.current.p2.hp}%</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-pink-400 shadow-lg shadow-pink-500/50"></div>
              </div>
            </div>

            {/* Main Canvas Container */}
            <div className="relative bg-gray-950 rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full max-w-[800px] h-auto aspect-[4/3] block bg-gray-950"
              />

              {!isMobile && (
                <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-800 text-[10px] text-gray-400 flex items-center gap-2">
                  <span>Kontroller: <strong className="text-white">WASD / Tuşlar</strong> + <strong className="text-cyan-400">Space/F (Ateş)</strong> + <strong className="text-purple-400">G/K (Kalkan)</strong></span>
                </div>
              )}
            </div>

            {/* Mobile Touch Controls Area */}
            {isMobile && (
              <div className="grid grid-cols-2 gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800">
                <div 
                  className="h-32 bg-gray-950/80 rounded-2xl border border-gray-800 relative flex items-center justify-center touch-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center relative">
                    <div 
                      className="w-10 h-10 rounded-full bg-cyan-500/40 border border-cyan-400 shadow-lg shadow-cyan-500/50 absolute transition-transform duration-75"
                      style={{
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
                      }}
                    ></div>
                  </div>
                  <span className="absolute bottom-1 text-[9px] text-gray-500 font-bold">JOYSTICK</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onTouchStart={() => triggerFire(myRole)}
                    className="flex-1 bg-pink-600/30 hover:bg-pink-600/50 active:scale-95 text-pink-300 border border-pink-500/40 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Target className="w-6 h-6 text-pink-400" />
                    <span>ATEŞ</span>
                  </button>

                  <button
                    onTouchStart={() => triggerShield(myRole)}
                    className="flex-1 bg-purple-600/30 hover:bg-purple-600/50 active:scale-95 text-purple-300 border border-purple-500/40 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Shield className="w-6 h-6 text-purple-400" />
                    <span>KALKAN</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── GAMEOVER STATE: VICTORY & REMATCH ─────────────────────────────── */}
        {gameState === 'gameover' && (
          <div className="bg-gray-900/95 backdrop-blur-2xl p-8 rounded-3xl border border-gray-800 shadow-2xl text-center space-y-6 max-w-md mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">
                {winnerRole === myRole ? (isTr ? '🎉 KAZANDINIZ!' : '🎉 VICTORY!') : (isTr ? '💥 MAĞLUP OLDUNUZ' : '💥 DEFEAT')}
              </h2>
              <p className="text-sm font-bold text-amber-300">
                🏆 {getWinnerName()} {isTr ? 'düelloyu kazandı!' : 'won the duel!'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-xl transition-all"
              >
                {isTr ? 'Lobiye Dön' : 'Back to Lobby'}
              </button>
              <button
                onClick={handleStartBotGame}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isTr ? 'Tekrar Oyna' : 'Play Again'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

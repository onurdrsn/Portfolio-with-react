import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import axios from 'axios';
import * as THREE from 'three';
import { 
  Rocket, 
  Globe, 
  Copy, 
  Check, 
  Play, 
  Zap, 
  Award, 
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
  Minimize,
  Flame,
  Crosshair,
  AlertTriangle,
  OctagonX,
  RadioTower,
  Gauge
} from 'lucide-react';

const WORKER_URL = 'https://portfolio-worker.onurd.com.tr';

// Hangar Fighter Jet Classes
const JET_CLASSES = [
  {
    id: 'raptor',
    name: 'F-22 Cyber Raptor',
    role: 'Taktik Avcı',
    desc: 'Dengeli zırh, yüksek manevra kabiliyeti ve ikiz vulcan topu.',
    hp: 100,
    speed: 0.30,
    missiles: 6,
    flares: 4,
    colorHex: 0x38bdf8,
    accentHex: 0x0284c7,
    flameHex: 0x38bdf8,
    badge: '🚀 DENGELİ'
  },
  {
    id: 'interceptor',
    name: 'Vapor Strike Interceptor',
    role: 'Hızlı Önleme',
    desc: 'Ultra yüksek hız ve 8 adet hızlı kilitlenen güdümlü füze.',
    hp: 85,
    speed: 0.38,
    missiles: 8,
    flares: 5,
    colorHex: 0x06b6d4,
    accentHex: 0x0891b2,
    flameHex: 0x22d3ee,
    badge: '⚡ YÜKSEK HIZ'
  },
  {
    id: 'valkyrie',
    name: 'Orbital Valkyrie Heavy',
    role: 'Ağır Zırhlı',
    desc: '130 HP süper ağır titanyum gövde ve yüksek tahrip gücü.',
    hp: 130,
    speed: 0.24,
    missiles: 4,
    flares: 3,
    colorHex: 0xf43f5e,
    accentHex: 0xbe123c,
    flameHex: 0xf43f5e,
    badge: '🛡️ AĞIR ZIRH'
  },
  {
    id: 'stealth',
    name: 'Nebula Ghost Stealth',
    role: 'Hayalet Avcı',
    desc: 'Gelişmiş radar gizliliği ve gelişmiş flare savunma paketi.',
    hp: 95,
    speed: 0.32,
    missiles: 6,
    flares: 6,
    colorHex: 0xa855f7,
    accentHex: 0x7e22ce,
    flameHex: 0xc084fc,
    badge: '🌌 GİZLİ RADAR'
  }
];

// Positional 3D Flight Web Audio API Synthesizer
const playFlightAudioEffect = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'vulcan') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'missile') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'flare') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'warp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'explosion') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.75);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'warning') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'lock') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Audio Context fail-safe
  }
};

export default function SpaceAce3D() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'tr';
  const isTr = currentLang.startsWith('tr');

  // Lobby States: 'menu' | 'waiting' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState('online'); // 'online' or 'bot'
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [myRole, setMyRole] = useState('p1');
  
  // Custom Nickname & Hangar Jet Class State
  const [customUsername, setCustomUsername] = useState('AcePilot-1');
  const [selectedJetClass, setSelectedJetClass] = useState('raptor');
  const [p1Name, setP1Name] = useState('AcePilot-1');
  const [p2Name, setP2Name] = useState('StarRival');

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [winnerRole, setWinnerRole] = useState(null);

  // Sound & Fullscreen Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Mobile Touch Controls
  const [isMobile, setIsMobile] = useState(false);
  const touchJoystickLeftRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });
  const [joystickLeftPos, setJoystickLeftPos] = useState({ x: 0, y: 0 });
  const touchBrakeRef = useRef(false);

  // Radio Radio Voice Comm Banner State
  const [radioMsg, setRadioMsg] = useState('RADIO CHATTER: ALL SYSTEMS NOMINAL');

  // 3D Canvas Mount Ref & Engine Data
  const mountRef = useRef(null);
  const animationFrameRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const audioTickRef = useRef(0);
  const screenShakeRef = useRef(0);

  // Flight Stats HUD State
  const [hudStats, setHudStats] = useState({
    targetDist: 0,
    lockOn: false,
    leadPos: { x: 0, y: 0, visible: false },
    radarPos: { x: 0, y: 0 },
    speed: 0,
    isBraking: false,
    missilesLeft: 6,
    flaresLeft: 4,
    warpCooldown: 0,
    outOfBounds: false,
    incomingMissileDist: null,
    score: 0,
    rank: 'ACE PILOT'
  });

  // Three.js Scene References
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    p1Group: null,
    p2Group: null,
    asteroids: [],
    bullets: [],
    missiles: [],
    flares: [],
    particles: []
  });

  // 3D Space Flight Logical Engine State
  const flightEngineRef = useRef({
    p1: {
      position: new THREE.Vector3(-30, 0, 40),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
      speed: 0.28,
      baseSpeed: 0.28,
      brakeSpeed: 0.08,
      isBraking: false,
      hp: 100,
      maxHp: 100,
      missiles: 6,
      flares: 4,
      warpCooldown: 0,
      missileCooldown: 0,
      flareCooldown: 0,
      score: 0,
      jetClass: 'raptor',
      name: 'AcePilot-1'
    },
    p2: {
      position: new THREE.Vector3(30, 0, -40),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
      speed: 0.28,
      baseSpeed: 0.28,
      brakeSpeed: 0.08,
      isBraking: false,
      hp: 100,
      maxHp: 100,
      missiles: 6,
      flares: 4,
      warpCooldown: 0,
      missileCooldown: 0,
      flareCooldown: 0,
      score: 0,
      jetClass: 'valkyrie',
      name: 'StarRival'
    },
    bullets: [],
    missiles: [],
    flares: [],
    particles: [],
    asteroids: [
      { pos: new THREE.Vector3(-15, 8, 12), radius: 5.5, rotAxis: new THREE.Vector3(0.5, 0.8, 0.2), rotSpeed: 0.012 },
      { pos: new THREE.Vector3(20, -12, -18), radius: 6.5, rotAxis: new THREE.Vector3(0.2, 0.9, 0.4), rotSpeed: 0.009 },
      { pos: new THREE.Vector3(-25, -15, -30), radius: 7.0, rotAxis: new THREE.Vector3(0.7, 0.3, 0.6), rotSpeed: 0.014 },
      { pos: new THREE.Vector3(30, 16, 25), radius: 6.0, rotAxis: new THREE.Vector3(0.4, 0.6, 0.5), rotSpeed: 0.011 },
      { pos: new THREE.Vector3(0, -22, 5), radius: 8.5, rotAxis: new THREE.Vector3(0.8, 0.1, 0.3), rotSpeed: 0.008 },
      { pos: new THREE.Vector3(8, 24, -35), radius: 5.0, rotAxis: new THREE.Vector3(0.3, 0.7, 0.9), rotSpeed: 0.016 }
    ]
  });

  const keysRef = useRef({});

  // Trigger Combat Radio Messages
  const triggerRadioComm = (text) => {
    setRadioMsg(text);
  };

  // Detect Mobile Device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fullscreen Listener
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

  // Complete Page Scroll Disabler
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const disableScrollEvent = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    const disableScrollKeys = (e) => {
      const scrollKeyCodes = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
        'Space', 'PageUp', 'PageDown', 'Home', 'End'
      ];
      if (scrollKeyCodes.includes(e.code) || scrollKeyCodes.includes(e.key)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', disableScrollEvent, { passive: false });
    window.addEventListener('touchmove', disableScrollEvent, { passive: false });
    window.addEventListener('keydown', disableScrollKeys, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('wheel', disableScrollEvent);
      window.removeEventListener('touchmove', disableScrollEvent);
      window.removeEventListener('keydown', disableScrollKeys);
    };
  }, []);

  // Keyboard Flight Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const flightKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
        'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE', 'KeyC', 'ControlLeft', 'KeyF', 'KeyG', 'KeyK', 'KeyL', 'ShiftLeft', 'ShiftRight', 'Enter'
      ];
      if (flightKeys.includes(e.code) || flightKeys.includes(e.key)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Configure Selected Jet Class Attributes
  const applyJetClassAttributes = (role, classId) => {
    const selectedClass = JET_CLASSES.find(j => j.id === classId) || JET_CLASSES[0];
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    p.jetClass = selectedClass.id;
    p.hp = selectedClass.hp;
    p.maxHp = selectedClass.hp;
    p.speed = selectedClass.speed;
    p.baseSpeed = selectedClass.speed;
    p.brakeSpeed = selectedClass.speed * 0.3;
    p.missiles = selectedClass.missiles;
    p.flares = selectedClass.flares;
  };

  // ─── 1. Create Online Room ────────────────────────────────────────────────
  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'AcePilot-1';
    applyJetClassAttributes('p1', selectedJetClass);

    try {
      const res = await axios.post(`${WORKER_URL}/api/game/create-room`, { name: myName });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole('p1');
        setP1Name(myName);
        flightEngineRef.current.p1.name = myName;
        setMyPlayerId(res.data.playerId);
        setGameState('waiting');
        triggerRadioComm(`Oda ${res.data.code} kuruldu. Rakip pilot bekleniyor...`);
        startWaitingForPlayer(res.data.code);
      }
    } catch (err) {
      setErrorMessage(isTr ? '3D Odası kurulamadı. İnternet bağlantınızı kontrol edin.' : 'Failed to create 3D room.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Join Online Room ──────────────────────────────────────────────────
  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'AcePilot-1';
    applyJetClassAttributes('p2', selectedJetClass);

    try {
      const res = await axios.post(`${WORKER_URL}/api/game/join-room`, {
        code: inputCode.toUpperCase().trim(),
        name: myName
      });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole('p2');
        setP2Name(myName);
        flightEngineRef.current.p2.name = myName;
        if (res.data.room?.p1?.name) {
          setP1Name(res.data.room.p1.name);
          flightEngineRef.current.p1.name = res.data.room.p1.name;
        }
        setMyPlayerId(res.data.playerId);
        setGameState('playing');
        triggerRadioComm(`Oda ${res.data.code} alanına bağlanıldı! İt dalaşı başlıyor!`);
        startOnlineSync(res.data.code, 'p2');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || (isTr ? 'Odaya katılanılamadı.' : 'Failed to join 3D room.'));
    } finally {
      setLoading(false);
    }
  };

  // ─── 3. Quick Match Online ────────────────────────────────────────────────
  const handleQuickMatch = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'AcePilot-1';
    applyJetClassAttributes('p1', selectedJetClass);

    try {
      const res = await axios.post(`${WORKER_URL}/api/game/quick-match`, { name: myName });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole(res.data.role);
        setMyPlayerId(res.data.playerId);
        if (res.data.role === 'p1') {
          setP1Name(myName);
          flightEngineRef.current.p1.name = myName;
          setGameState('waiting');
          startWaitingForPlayer(res.data.code);
        } else {
          applyJetClassAttributes('p2', selectedJetClass);
          setP2Name(myName);
          flightEngineRef.current.p2.name = myName;
          if (res.data.room?.p1?.name) {
            setP1Name(res.data.room.p1.name);
            flightEngineRef.current.p1.name = res.data.room.p1.name;
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

  // ─── 4. Play vs Ace Pilot AI Bot (PvE Offline) ───────────────────────────
  const handleStartBotGame = () => {
    const myName = customUsername.trim() || 'AcePilot-1';
    setGameMode('bot');
    setMyRole('p1');
    setP1Name(myName);
    setP2Name('AceBot-AI 3000');
    
    applyJetClassAttributes('p1', selectedJetClass);
    applyJetClassAttributes('p2', 'valkyrie');

    const engine = flightEngineRef.current;
    engine.p1.name = myName;
    engine.p1.position.set(-30, 0, 40);
    engine.p1.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

    engine.p2.name = 'AceBot-AI 3000';
    engine.p2.position.set(30, 0, -40);
    engine.p2.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));

    engine.bullets = [];
    engine.missiles = [];
    engine.flares = [];
    engine.particles = [];

    setGameState('playing');
    triggerRadioComm('AceBot-AI ile simüle it dalaşı başladı. Tüm silahlar serbest!');
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
            flightEngineRef.current.p2.name = res.data.room.p2.name;
          }
          setGameState('playing');
          triggerRadioComm('Rakip pilot uzay sektörüne giriş yaptı! İt dalaşı başladı!');
          startOnlineSync(code, 'p1');
        }
      } catch (e) {
        // keep polling
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // Real-time State Sync with Worker
  const startOnlineSync = (code, role) => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(async () => {
      const myObj = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;

      try {
        const res = await axios.post(`${WORKER_URL}/api/game/sync-state`, {
          code,
          role,
          x: myObj.position.x,
          y: myObj.position.z, // Map Z to y for worker payload compatibility
          angle: myObj.quaternion.y,
          hp: myObj.hp,
          score: myObj.score || 0,
          shield: false,
          newBullets: myObj.pendingBullets || []
        });

        myObj.pendingBullets = [];

        if (res.data?.ok) {
          const opp = res.data.opponent;
          if (opp) {
            const oppObj = role === 'p1' ? flightEngineRef.current.p2 : flightEngineRef.current.p1;
            oppObj.position.x = opp.x;
            oppObj.position.z = opp.y;
            oppObj.hp = opp.hp;
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
            confetti({ particleCount: 250, spread: 120 });
          }
        }
      } catch (e) {
        console.error('Space-Ace Sync error:', e);
      }
    }, 100);
  };

  // ─── ACTION: Twin Vulcan Plasma Cannon ─────────────────────────────────────
  const triggerVulcan = useCallback((role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0) return;

    const bulletSpeed = 1.8;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion).normalize();
    const spawnPos = p.position.clone().add(forward.clone().multiplyScalar(2.8));

    const bullet = {
      id: `vulcan-${Date.now()}-${Math.random()}`,
      owner: role,
      pos: spawnPos,
      vel: forward.clone().multiplyScalar(bulletSpeed),
      life: 120
    };

    flightEngineRef.current.bullets.push(bullet);
    if (!p.pendingBullets) p.pendingBullets = [];
    p.pendingBullets.push({
      x: spawnPos.x,
      y: spawnPos.z,
      vx: bullet.vel.x,
      vy: bullet.vel.z
    });

    if (soundEnabled) playFlightAudioEffect('vulcan');
  }, [soundEnabled]);

  // ─── ACTION: Lock-On 3D Homing Missile ─────────────────────────────────────
  const triggerMissile = useCallback((role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || p.missiles <= 0 || (p.missileCooldown && p.missileCooldown > 0)) return;

    p.missiles--;
    p.missileCooldown = 120; // 2s cooldown

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion).normalize();
    const spawnPos = p.position.clone().add(forward.clone().multiplyScalar(2.0));

    const missile = {
      id: `msl-${Date.now()}-${Math.random()}`,
      owner: role,
      targetRole: role === 'p1' ? 'p2' : 'p1',
      pos: spawnPos,
      quaternion: p.quaternion.clone(),
      speed: 0.75,
      turnRate: 0.08,
      life: 350
    };

    flightEngineRef.current.missiles.push(missile);
    if (soundEnabled) playFlightAudioEffect('missile');
    triggerRadioComm('FOX TWO! ISIL GÜDÜMLÜ FÜZE ATEŞLENDİ!');
  }, [soundEnabled]);

  // ─── ACTION: Thermal Countermeasure Flares ───────────────────────────────
  const triggerFlares = useCallback((role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || p.flares <= 0 || (p.flareCooldown && p.flareCooldown > 0)) return;

    p.flares--;
    p.flareCooldown = 150;

    const backDir = new THREE.Vector3(0, 0, -1).applyQuaternion(p.quaternion).normalize();
    for (let f = 0; f < 10; f++) {
      flightEngineRef.current.flares.push({
        pos: p.position.clone().add(backDir.clone().multiplyScalar(2.0)).add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          )
        ),
        vel: backDir.clone().multiplyScalar(0.4).add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          )
        ),
        life: 110
      });
    }

    if (soundEnabled) playFlightAudioEffect('flare');
    triggerRadioComm('FLARE DEPLOYED! TERMAL SAVUNMA FİŞEKLERİ SAÇILDI!');
  }, [soundEnabled]);

  // ─── ACTION: Hyper Warp Speed Boost + Sonic Boom Ring FX ───────────────────
  const triggerWarp = useCallback((role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || (p.warpCooldown && p.warpCooldown > 0)) return;

    p.warpCooldown = 240; // 4s cooldown
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(p.quaternion).normalize();
    p.position.add(forward.multiplyScalar(16.0));

    // Sonic boom shockwave particles
    for (let i = 0; i < 25; i++) {
      flightEngineRef.current.particles.push({
        pos: p.position.clone().add(new THREE.Vector3((Math.random()-0.5)*4, (Math.random()-0.5)*4, (Math.random()-0.5)*4)),
        vel: forward.clone().multiplyScalar(-0.6),
        size: 1.0,
        life: 35,
        maxLife: 35,
        color: 0xa855f7
      });
    }

    if (soundEnabled) playFlightAudioEffect('warp');
    triggerRadioComm('SONIC BOOM WARP ENGAGED! HYPER UZAY SIÇRAMASI!');
  }, [soundEnabled]);


  // Mobile Touch Control Handlers
  const handleTouchStartLeft = (e) => {
    const touch = e.touches[0];
    touchJoystickLeftRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      dx: 0,
      dy: 0
    };
  };

  const handleTouchMoveLeft = (e) => {
    if (!touchJoystickLeftRef.current.active) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchJoystickLeftRef.current.startX;
    const dy = touch.clientY - touchJoystickLeftRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40;

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxDist);

    touchJoystickLeftRef.current.dx = Math.cos(angle) * (clampedDist / maxDist);
    touchJoystickLeftRef.current.dy = Math.sin(angle) * (clampedDist / maxDist);

    setJoystickLeftPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist
    });
  };

  const handleTouchEndLeft = () => {
    touchJoystickLeftRef.current = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    setJoystickLeftPos({ x: 0, y: 0 });
  };

  // ─── 5. Three.js 3D Flight Simulation Engine & Graphics ────────────────────
  useEffect(() => {
    if (gameState !== 'playing' || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // Create 3D Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020309);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2500);

    // Create WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.appendChild(renderer.domElement);

    // Cosmic Lighting System
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 3.0);
    sunLight.position.set(300, 200, 400);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 4.0, 600);
    rimLight.position.set(-200, -100, -300);
    scene.add(rimLight);

    // Procedural Starfield (3,500 High-Depth Glowing Stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, transparent: true, opacity: 0.9 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Backdrop Gas Giant Planet & Orbital Ring
    const planetGeo = new THREE.SphereGeometry(75, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.7, metalness: 0.2 });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.position.set(-350, -120, -500);
    scene.add(planetMesh);

    // Central Space Station Base
    const stationGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(40, 3.5, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const stationRing = new THREE.Mesh(ringGeo, ringMat);
    const coreGeo = new THREE.CylinderGeometry(9, 9, 36, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const stationCore = new THREE.Mesh(coreGeo, coreMat);
    stationGroup.add(stationRing, stationCore);
    stationGroup.position.set(0, 0, 0);
    scene.add(stationGroup);

    // Build 3D Asteroid Meshes
    const asteroidMeshes = [];
    for (const ast of flightEngineRef.current.asteroids) {
      const astGeo = new THREE.DodecahedronGeometry(ast.radius, 1);
      const astMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.15 });
      const astMesh = new THREE.Mesh(astGeo, astMat);
      astMesh.position.copy(ast.pos);
      scene.add(astMesh);
      asteroidMeshes.push(astMesh);
    }

    // Builder function for High-Detail Supersonic 3D Fighter Jet (Nose along +Z)
    const create3DFighterJet = (classId) => {
      const jClass = JET_CLASSES.find(j => j.id === classId) || JET_CLASSES[0];
      const group = new THREE.Group();

      const noseGeo = new THREE.ConeGeometry(0.75, 4.0, 12);
      noseGeo.rotateX(Math.PI / 2);
      const noseMat = new THREE.MeshStandardMaterial({ color: jClass.colorHex, metalness: 0.85, roughness: 0.2 });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0, 1.0);
      group.add(nose);

      const glassGeo = new THREE.SphereGeometry(0.5, 16, 16);
      glassGeo.scale(0.8, 0.7, 1.6);
      const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x38bdf8, 
        transmission: 0.85, 
        opacity: 0.9, 
        transparent: true, 
        roughness: 0.1,
        clearcoat: 1.0
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 0.45, 0.3);
      group.add(glass);

      const wingGeo = new THREE.BoxGeometry(5.0, 0.12, 2.2);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0, -0.4);
      group.add(wings);

      const finGeo = new THREE.BoxGeometry(0.12, 1.3, 1.3);
      const finMat = new THREE.MeshStandardMaterial({ color: jClass.accentHex, metalness: 0.8 });
      const fin1 = new THREE.Mesh(finGeo, finMat);
      fin1.position.set(-0.75, 0.65, -1.2);
      fin1.rotation.z = -0.25;
      const fin2 = new THREE.Mesh(finGeo, finMat);
      fin2.position.set(0.75, 0.65, -1.2);
      fin2.rotation.z = 0.25;
      group.add(fin1, fin2);

      const engineGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.0, 12);
      engineGeo.rotateX(Math.PI / 2);
      const engineMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
      const engine1 = new THREE.Mesh(engineGeo, engineMat);
      engine1.position.set(-0.48, 0, -1.6);
      const engine2 = new THREE.Mesh(engineGeo, engineMat);
      engine2.position.set(0.48, 0, -1.6);
      group.add(engine1, engine2);

      const flameGeo = new THREE.ConeGeometry(0.32, 1.8, 8);
      flameGeo.rotateX(-Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({ color: jClass.flameHex, transparent: true, opacity: 0.95 });
      const flame1 = new THREE.Mesh(flameGeo, flameMat);
      flame1.position.set(-0.48, 0, -2.5);
      const flame2 = new THREE.Mesh(flameGeo, flameMat);
      flame2.position.set(0.48, 0, -2.5);
      group.add(flame1, flame2);

      return group;
    };

    // Builder function for Visible 3D Rocket Missile Mesh
    const create3DMissileMesh = () => {
      const group = new THREE.Group();

      const bodyGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.0, 10);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const tipGeo = new THREE.ConeGeometry(0.14, 0.6, 10);
      tipGeo.rotateX(Math.PI / 2);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, 0, 1.25);
      group.add(tip);

      const finGeo = new THREE.BoxGeometry(0.7, 0.04, 0.45);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const fins = new THREE.Mesh(finGeo, finMat);
      fins.position.set(0, 0, -0.7);
      group.add(fins);

      const glowGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 0, -1.05);
      group.add(glow);

      return group;
    };

    const p1Group = create3DFighterJet(flightEngineRef.current.p1.jetClass || 'raptor');
    const p2Group = create3DFighterJet(flightEngineRef.current.p2.jetClass || 'valkyrie');
    scene.add(p1Group);
    scene.add(p2Group);

    threeRef.current = {
      scene,
      camera,
      renderer,
      p1Group,
      p2Group,
      asteroids: asteroidMeshes,
      bullets: [],
      missiles: [],
      flares: [],
      particles: []
    };

    // ─── 60 FPS AAA FLIGHT ENGINE LOOP ───────────────────────────────────────
    const update3DFlight = () => {
      const state = flightEngineRef.current;
      const myObj = myRole === 'p1' ? state.p1 : state.p2;
      const oppObj = myRole === 'p1' ? state.p2 : state.p1;

      // Cooldown Decays
      if (myObj.warpCooldown > 0) myObj.warpCooldown--;
      if (myObj.missileCooldown > 0) myObj.missileCooldown--;
      if (myObj.flareCooldown > 0) myObj.flareCooldown--;

      // Airbrake Input Detection
      let isBraking = false;
      if (myRole === 'p1') {
        if (keysRef.current['KeyC'] || keysRef.current['ControlLeft'] || touchBrakeRef.current) {
          isBraking = true;
        }
      } else {
        if (keysRef.current['KeyC'] || touchBrakeRef.current) {
          isBraking = true;
        }
      }

      myObj.isBraking = isBraking;
      myObj.speed = isBraking ? myObj.brakeSpeed : myObj.baseSpeed;

      // 6-DOF Flight Input Processing
      let steerPitch = 0;
      let steerYaw = 0;
      let steerRoll = 0;

      if (touchJoystickLeftRef.current.active) {
        steerYaw = -touchJoystickLeftRef.current.dx * 0.042;
        steerPitch = -touchJoystickLeftRef.current.dy * 0.042;
        steerRoll = -touchJoystickLeftRef.current.dx * 0.025;
      } else {
        if (myRole === 'p1') {
          if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) steerPitch -= 0.038;
          if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) steerPitch += 0.038;
          if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) {
            steerYaw += 0.038;
            steerRoll -= 0.03;
          }
          if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) {
            steerYaw -= 0.038;
            steerRoll += 0.03;
          }
          if (keysRef.current['KeyQ']) steerRoll -= 0.04;
          if (keysRef.current['KeyE']) steerRoll += 0.04;

          if (keysRef.current['Space']) {
            triggerVulcan('p1');
            keysRef.current['Space'] = false;
          }
          if (keysRef.current['KeyF']) {
            triggerMissile('p1');
            keysRef.current['KeyF'] = false;
          }
          if (keysRef.current['KeyG']) {
            triggerFlares('p1');
            keysRef.current['KeyG'] = false;
          }
          if (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight']) {
            triggerWarp('p1');
            keysRef.current['ShiftLeft'] = false;
            keysRef.current['ShiftRight'] = false;
          }
        } else {
          if (keysRef.current['ArrowUp']) steerPitch -= 0.038;
          if (keysRef.current['ArrowDown']) steerPitch += 0.038;
          if (keysRef.current['ArrowLeft']) {
            steerYaw += 0.038;
            steerRoll -= 0.03;
          }
          if (keysRef.current['ArrowRight']) {
            steerYaw -= 0.038;
            steerRoll += 0.03;
          }

          if (keysRef.current['KeyL'] || keysRef.current['Enter']) {
            triggerVulcan('p2');
            keysRef.current['KeyL'] = false;
            keysRef.current['Enter'] = false;
          }
          if (keysRef.current['KeyK']) {
            triggerMissile('p2');
            keysRef.current['KeyK'] = false;
          }
        }
      }

      // Apply Local Quaternions
      const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), steerPitch);
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), steerYaw);
      const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), steerRoll);

      myObj.quaternion.multiply(qYaw).multiply(qPitch).multiply(qRoll);

      // Advance Jet Forward in 3D Space
      const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(myObj.quaternion).normalize();
      myObj.position.add(forwardDir.clone().multiplyScalar(myObj.speed));

      // Arena Soft Boundary Pushback Force
      const arenaRadius = 180;
      const distFromCenter = myObj.position.length();
      const outOfBounds = distFromCenter > arenaRadius;

      if (outOfBounds) {
        const pushback = myObj.position.clone().negate().normalize().multiplyScalar(0.2);
        myObj.position.add(pushback);
      }

      // Ace Pilot AI Bot (PvE 3D Flight Physics)
      if (gameMode === 'bot') {
        const bot = state.p2;
        const target = state.p1;

        const toTarget = target.position.clone().sub(bot.position);
        const bDist = toTarget.length();

        if (bDist > 0.001) {
          const targetDir = toTarget.clone().normalize();
          const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDir);
          bot.quaternion.slerp(targetQuat, 0.035);
        }

        const botForward = new THREE.Vector3(0, 0, 1).applyQuaternion(bot.quaternion).normalize();
        bot.position.add(botForward.multiplyScalar(bot.speed * 0.85));

        if (bDist < 100 && Math.random() < 0.05) {
          triggerVulcan('p2');
        }
        if (bDist < 80 && Math.random() < 0.012) {
          triggerMissile('p2');
        }
      }

      // Rotate Station & Asteroids
      stationGroup.rotation.y += 0.002;
      for (let i = 0; i < state.asteroids.length; i++) {
        const astData = state.asteroids[i];
        const astMesh = threeRef.current.asteroids[i];
        if (astMesh) {
          astMesh.rotateOnAxis(astData.rotAxis, astData.rotSpeed);
        }
      }

      // Update 3D Plasma Cannons (Vulcan Bullets)
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.pos.add(b.vel);
        b.life--;

        if (b.life <= 0 || b.pos.length() > 250) {
          state.bullets.splice(i, 1);
          continue;
        }

        if (b.owner !== 'p1') {
          if (b.pos.distanceTo(state.p1.position) < 3.5) {
            state.p1.hp = Math.max(0, state.p1.hp - 12);
            if (soundEnabled) playFlightAudioEffect('hit');
            screenShakeRef.current = 10;

            for (let p = 0; p < 8; p++) {
              state.particles.push({
                pos: b.pos.clone(),
                vel: new THREE.Vector3((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8),
                size: 0.6,
                life: 20,
                maxLife: 20,
                color: 0x38bdf8
              });
            }

            state.bullets.splice(i, 1);
            continue;
          }
        }

        if (b.owner !== 'p2') {
          if (b.pos.distanceTo(state.p2.position) < 3.5) {
            state.p2.hp = Math.max(0, state.p2.hp - 12);
            if (soundEnabled) playFlightAudioEffect('hit');
            screenShakeRef.current = 10;

            for (let p = 0; p < 8; p++) {
              state.particles.push({
                pos: b.pos.clone(),
                vel: new THREE.Vector3((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8),
                size: 0.6,
                life: 20,
                maxLife: 20,
                color: 0xf43f5e
              });
            }

            state.bullets.splice(i, 1);
            continue;
          }
        }
      }

      // Update Visible 3D Lock-On Homing Missiles & Track Incoming Alert
      let closestIncomingMissileDist = null;

      for (let i = state.missiles.length - 1; i >= 0; i--) {
        const m = state.missiles[i];
        const targetObj = m.targetRole === 'p1' ? state.p1 : state.p2;

        if (m.targetRole === myRole) {
          const distToMe = Math.round(m.pos.distanceTo(myObj.position) * 10);
          if (closestIncomingMissileDist === null || distToMe < closestIncomingMissileDist) {
            closestIncomingMissileDist = distToMe;
          }
        }

        let trackedPos = targetObj.position.clone();
        for (const flare of state.flares) {
          if (m.pos.distanceTo(flare.pos) < 18) {
            trackedPos = flare.pos.clone();
            break;
          }
        }

        const toTarget = trackedPos.sub(m.pos);
        const mDist = toTarget.length();

        if (mDist < 3.8) {
          targetObj.hp = Math.max(0, targetObj.hp - 35);
          if (soundEnabled) playFlightAudioEffect('explosion');
          screenShakeRef.current = 22;

          for (let p = 0; p < 30; p++) {
            state.particles.push({
              pos: m.pos.clone(),
              vel: new THREE.Vector3((Math.random()-0.5)*1.5, (Math.random()-0.5)*1.5, (Math.random()-0.5)*1.5),
              size: 1.2,
              life: 35,
              maxLife: 35,
              color: 0xf97316
            });
          }

          state.missiles.splice(i, 1);
          continue;
        }

        if (mDist > 0.001) {
          const desiredDir = toTarget.normalize();
          const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), desiredDir);
          m.quaternion.slerp(targetQuat, m.turnRate);
        }

        const mForward = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion).normalize();
        m.pos.add(mForward.multiplyScalar(m.speed));
        m.life--;

        state.particles.push({
          pos: m.pos.clone().add(mForward.clone().multiplyScalar(-1.2)),
          vel: mForward.clone().multiplyScalar(-0.1).add(new THREE.Vector3((Math.random()-0.5)*0.08, (Math.random()-0.5)*0.08, (Math.random()-0.5)*0.08)),
          size: 0.6,
          life: 25,
          maxLife: 25,
          color: Math.random() > 0.5 ? 0xf97316 : 0x64748b
        });

        if (m.life <= 0) {
          state.missiles.splice(i, 1);
        }
      }

      // Play audio beep for incoming missile warning
      audioTickRef.current++;
      if (closestIncomingMissileDist !== null && closestIncomingMissileDist < 1200) {
        if (soundEnabled && audioTickRef.current % 18 === 0) {
          playFlightAudioEffect('warning');
        }
      }

      // Update Thermal Flares
      for (let i = state.flares.length - 1; i >= 0; i--) {
        const fl = state.flares[i];
        fl.pos.add(fl.vel);
        fl.life--;

        state.particles.push({
          pos: fl.pos.clone(),
          vel: new THREE.Vector3((Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1),
          size: 0.5,
          life: 15,
          maxLife: 15,
          color: 0xfacc15
        });

        if (fl.life <= 0) {
          state.flares.splice(i, 1);
        }
      }

      // Update Particle Pool physics
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.pos.add(pt.vel);
        pt.life--;
        if (pt.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Gameover Check in Bot Mode
      if (gameMode === 'bot') {
        if (state.p1.hp <= 0) {
          setWinnerRole('p2');
          setGameState('gameover');
          triggerRadioComm('TÜM SİSTEMLER ÇÖKTÜ! MAĞLUBİYET!');
          return;
        }
        if (state.p2.hp <= 0) {
          setWinnerRole('p1');
          setGameState('gameover');
          triggerRadioComm('HEDEF İMHÂ EDİLDİ! ZAFER SİZİN!');
          confetti({ particleCount: 250, spread: 120 });
          return;
        }
      }

      // Sync Jet Mesh Positions & Quaternions in 3D Scene
      p1Group.position.copy(state.p1.position);
      p1Group.quaternion.copy(state.p1.quaternion);

      p2Group.position.copy(state.p2.position);
      p2Group.quaternion.copy(state.p2.quaternion);

      // Hollywood 3rd Person Chase Camera with Screen Shake FX
      let shakeVec = new THREE.Vector3(0,0,0);
      if (screenShakeRef.current > 0) {
        shakeVec.set((Math.random()-0.5)*0.6, (Math.random()-0.5)*0.6, (Math.random()-0.5)*0.6);
        screenShakeRef.current--;
      }

      const camOffset = new THREE.Vector3(0, 3.8, -13).applyQuaternion(myObj.quaternion);
      const camPos = myObj.position.clone().add(camOffset).add(shakeVec);
      const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(myObj.quaternion);

      camera.position.lerp(camPos, 0.25);
      camera.up.lerp(camUp, 0.25);

      const lookAhead = new THREE.Vector3(0, 0, 1).applyQuaternion(myObj.quaternion).multiplyScalar(15);
      camera.lookAt(myObj.position.clone().add(lookAhead));

      // Calculate Lead Prediction Reticle & Radar Coordinates for HUD
      const distToOpp = myObj.position.distanceTo(oppObj.position);
      const bulletSpeed = 1.8;
      const travelTime = distToOpp / bulletSpeed;
      const oppForward = new THREE.Vector3(0, 0, 1).applyQuaternion(oppObj.quaternion).normalize();
      const lead3D = oppObj.position.clone().add(oppForward.multiplyScalar(oppObj.speed * travelTime));

      const screenLeadPos = lead3D.clone().project(camera);
      const leadX = (screenLeadPos.x * 0.5 + 0.5) * width;
      const leadY = (-(screenLeadPos.y * 0.5) + 0.5) * height;
      const isLeadVisible = screenLeadPos.z < 1.0 && leadX > 0 && leadX < width && leadY > 0 && leadY < height;

      // 3D Radar Position Relative to Player Heading
      const relOpp = oppObj.position.clone().sub(myObj.position);
      const invQuat = myObj.quaternion.clone().invert();
      relOpp.applyQuaternion(invQuat);

      setHudStats({
        targetDist: Math.round(distToOpp * 10),
        lockOn: distToOpp < 90,
        leadPos: { x: leadX, y: leadY, visible: isLeadVisible },
        radarPos: { x: relOpp.x, y: relOpp.z },
        speed: Math.round(myObj.speed * 400),
        isBraking: myObj.isBraking,
        missilesLeft: myObj.missiles,
        flaresLeft: myObj.flares,
        warpCooldown: myObj.warpCooldown,
        outOfBounds,
        incomingMissileDist: closestIncomingMissileDist,
        score: myObj.score || 0,
        rank: myObj.score > 300 ? '👑 ACE OF SPADES' : myObj.score > 150 ? '🏆 SQUADRON LEADER' : '🚀 FLIGHT CADET'
      });

      // Synchronize 3D Vulcan Plasma Bullet Meshes
      while (threeRef.current.bullets.length < state.bullets.length) {
        const bGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8);
        bGeo.rotateX(Math.PI / 2);
        const bMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const bMesh = new THREE.Mesh(bGeo, bMat);
        scene.add(bMesh);
        threeRef.current.bullets.push(bMesh);
      }
      while (threeRef.current.bullets.length > state.bullets.length) {
        const oldB = threeRef.current.bullets.pop();
        scene.remove(oldB);
      }
      for (let i = 0; i < state.bullets.length; i++) {
        const bData = state.bullets[i];
        const bMesh = threeRef.current.bullets[i];
        bMesh.position.copy(bData.pos);
        bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), bData.vel.clone().normalize());
        bMesh.material.color.setHex(bData.owner === 'p1' ? 0x38bdf8 : 0xf43f5e);
      }

      // Synchronize Visible 3D Homing Missile Meshes
      while (threeRef.current.missiles.length < state.missiles.length) {
        const mMesh = create3DMissileMesh();
        scene.add(mMesh);
        threeRef.current.missiles.push(mMesh);
      }
      while (threeRef.current.missiles.length > state.missiles.length) {
        const oldM = threeRef.current.missiles.pop();
        scene.remove(oldM);
      }
      for (let i = 0; i < state.missiles.length; i++) {
        const mData = state.missiles[i];
        const mMesh = threeRef.current.missiles[i];
        mMesh.position.copy(mData.pos);
        mMesh.quaternion.copy(mData.quaternion);
      }

      // Synchronize Dynamic Particle Trail Meshes
      while (threeRef.current.particles.length < state.particles.length) {
        const pGeo = new THREE.SphereGeometry(0.3, 6, 6);
        const pMat = new THREE.MeshBasicMaterial({ transparent: true });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        scene.add(pMesh);
        threeRef.current.particles.push(pMesh);
      }
      while (threeRef.current.particles.length > state.particles.length) {
        const oldP = threeRef.current.particles.pop();
        scene.remove(oldP);
      }
      for (let i = 0; i < state.particles.length; i++) {
        const ptData = state.particles[i];
        const ptMesh = threeRef.current.particles[i];
        ptMesh.position.copy(ptData.pos);
        ptMesh.scale.setScalar(ptData.size * (ptData.life / ptData.maxLife));
        ptMesh.material.color.setHex(ptData.color);
        ptMesh.material.opacity = ptData.life / ptData.maxLife;
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(update3DFlight);
    };

    animationFrameRef.current = requestAnimationFrame(update3DFlight);

    const containerNode = mountRef.current;

    // Resize Handler
    const handleResize = () => {
      if (!containerNode) return;
      const w = containerNode.clientWidth;
      const h = containerNode.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (containerNode && renderer.domElement) {
        containerNode.removeChild(renderer.domElement);
      }
    };
  }, [gameState, myRole, gameMode, soundEnabled, triggerFlares, triggerMissile, triggerVulcan, triggerWarp]);


  const getWinnerName = () => {
    if (winnerRole === 'p1') return flightEngineRef.current.p1.name || p1Name;
    if (winnerRole === 'p2') return flightEngineRef.current.p2.name || p2Name;
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
            <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl">
              <Rocket className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {isTr ? 'Space-Ace 3D: Uçuş Simülatörü' : 'Space-Ace 3D: Flight Simulator'}
              </h1>
              <p className="text-[11px] text-gray-400">Hangarlar • 3D Radar • Hedef Öngörü Nişangahı • Taktik Telsiz</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors border border-gray-700 flex items-center gap-1.5 text-xs font-semibold"
              title={isTr ? 'Tam Ekran Yap / Çık' : 'Toggle Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-purple-400" /> : <Maximize className="w-4 h-4 text-purple-400" />}
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

        {/* ─── LOBBY STATE: HANGAR JET CLASS SELECTION & NICKNAME ─────────────── */}
        {gameState === 'menu' && (
          <div className="space-y-4 animate-fadeIn max-h-[82vh] overflow-y-auto pr-1">
            
            {/* Top Bar: Call Sign Banner & Fast Play Buttons */}
            <div className="bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 w-full lg:w-auto">
                <User className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold text-gray-300 whitespace-nowrap">
                  {isTr ? '3D Pilot Çağrı Adı:' : 'Pilot Call Sign:'}
                </span>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="Örn: AcePilot-1"
                  className="flex-1 lg:w-48 bg-gray-950 border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-bold outline-none"
                />
              </div>

              {/* Instant Play Action Buttons (AI Bot & Quick Match) */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={handleStartBotGame}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/30"
                >
                  <Bot className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>{isTr ? '🤖 3D Ace Pilot AI Antrenmanı' : '🤖 3D Ace Pilot AI Match'}</span>
                </button>

                <button
                  onClick={handleQuickMatch}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/30"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>{isTr ? '⚡ 3D Hızlı Eşleşme' : '⚡ 3D Quick Space Match'}</span>
                </button>
              </div>
            </div>

            {/* HANGAR JET CLASS SELECTION GRID */}
            <div className="bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {isTr ? 'HANGAR: Savaş Uçağı Sınıfınızı Seçin' : 'HANGAR: Select Your Fighter Jet Class'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {JET_CLASSES.map((jClass) => {
                  const isSelected = selectedJetClass === jClass.id;
                  return (
                    <div
                      key={jClass.id}
                      onClick={() => setSelectedJetClass(jClass.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-900/40 ring-2 ring-purple-500/50' 
                          : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                          {jClass.badge}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-white">{jClass.name}</h3>
                        <p className="text-[10px] text-cyan-400 font-semibold">{jClass.role}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{jClass.desc}</p>
                      </div>

                      <div className="space-y-0.5 text-[9px] font-mono text-gray-300 pt-1.5 border-t border-gray-800/80">
                        <div className="flex justify-between"><span>Gövde HP:</span> <strong>{jClass.hp}</strong></div>
                        <div className="flex justify-between"><span>Max Hız:</span> <strong>{Math.round(jClass.speed * 400)} km/h</strong></div>
                        <div className="flex justify-between"><span>Füze:</span> <strong>{jClass.missiles} Adet</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multiplayer Room Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Room Card */}
              <div className="bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-white">
                      {isTr ? 'Yeni 3D Uzay Odası Kur' : 'Create 3D Orbit Room'}
                    </h2>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {isTr 
                      ? '4 haneli uzay oda kodu üretin. Arkadaşınızı 3D uzay arenasında it dalaşına davet edin.' 
                      : 'Generate a 4-letter 3D space room code for a 3D orbital dogfight.'}
                  </p>
                </div>

                {errorMessage && (
                  <p className="text-[11px] text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                    {errorMessage}
                  </p>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{isTr ? '3D Oda Kodu Üret' : 'Generate 3D Code'}</span>
                </button>
              </div>

              {/* Join Room Code Card */}
              <div className="bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-white">
                      {isTr ? 'Uzay Odasına Katıl' : 'Join 3D Orbit Room'}
                    </h2>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {isTr 
                      ? '4 haneli oda kodunu girerek uzay savaşına bağlanın.' 
                      : 'Enter 4-letter room code to join.'}
                  </p>

                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="ÖRN: S9A1"
                    className="w-full bg-gray-950 border border-gray-700 focus:border-pink-500 rounded-xl px-3 py-1.5 text-center text-sm font-mono font-bold tracking-widest text-pink-300 placeholder-gray-600 outline-none uppercase"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!inputCode.trim() || loading}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isTr ? 'Odaya Katıl & Oyna' : 'Join 3D Room'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ─── WAITING STATE ─────────────────────────────────────────────────── */}
        {gameState === 'waiting' && (
          <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl text-center space-y-6 max-w-lg mx-auto animate-fadeIn">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                {isTr ? '3D Uzay Rakibiniz Bekleniyor...' : 'Waiting for Space Pilot...'}
              </h2>
              <p className="text-xs text-gray-400">
                {isTr ? 'Aşağıdaki oda kodunu kopyalayıp arkadaşınıza gönderin:' : 'Copy and share this space code:'}
              </p>
            </div>

            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex items-center justify-between max-w-xs mx-auto">
              <span className="text-3xl font-mono font-black tracking-widest text-purple-400">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
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

        {/* ─── PLAYING STATE: THREE.JS 3D SPACE FLIGHT & RADAR HUD ───────────── */}
        {gameState === 'playing' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* HUD Flight Status Bar */}
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
              
              {/* P1 Status */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50"></div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 block">
                    {flightEngineRef.current.p1.name || p1Name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                    <span>HP: {flightEngineRef.current.p1.hp}%</span>
                    <span>Hız: {hudStats.speed} km/h {hudStats.isBraking && <strong className="text-amber-400">[FREN]</strong>}</span>
                    <span>Füze: {hudStats.missilesLeft}</span>
                    <span>Flare: {hudStats.flaresLeft}</span>
                  </div>
                </div>
              </div>

              {/* Match Mode & Radar Distance Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                  <Crosshair className={`w-3.5 h-3.5 ${hudStats.lockOn ? 'text-red-400 animate-ping' : 'text-purple-400'}`} />
                  <span className="text-[10px] font-bold font-mono text-purple-300 uppercase tracking-wider">
                    {hudStats.lockOn ? `🎯 KİLİTLENDİ (${hudStats.targetDist}m)` : `Mesafe: ${hudStats.targetDist}m`}
                  </span>
                </div>
                {hudStats.outOfBounds && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold animate-bounce">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>{isTr ? 'SAVAŞ BÖLGESİ DIŞINA ÇIKTINIZ!' : 'LEAVING COMBAT ZONE!'}</span>
                  </div>
                )}
              </div>

              {/* P2 Status */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-xs font-bold text-pink-400 block">
                    {flightEngineRef.current.p2.name || p2Name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                    <span>HP: {flightEngineRef.current.p2.hp}%</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-pink-400 shadow-lg shadow-pink-500/50"></div>
              </div>
            </div>

            {/* 3D Flight Simulation Canvas Container */}
            <div className="relative bg-gray-950 rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl flex items-center justify-center min-h-[500px]">
              <div ref={mountRef} className="w-full h-[500px] block" />

              {/* ⚠️ INCOMING MISSILE ALERT WARNING BANNER */}
              {hudStats.incomingMissileDist !== null && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-950/90 border-2 border-red-500 text-red-100 px-5 py-2.5 rounded-2xl shadow-2xl shadow-red-900/60 backdrop-blur-xl flex items-center gap-3 animate-pulse z-20">
                  <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce flex-shrink-0" />
                  <div>
                    <span className="text-xs font-black tracking-wider block text-red-400 uppercase">
                      {isTr ? '⚠️ TEHLİKE: ARKANDAN GÜDÜMLÜ FÜZE YAKLAŞIYOR!' : '⚠️ INCOMING MISSILE APPROACHING!'}
                    </span>
                    <span className="text-xs font-mono font-bold text-white block">
                      {isTr ? `Füze Mesafesi: ${hudStats.incomingMissileDist}m • Flare (G) Atın!` : `Missile Distance: ${hudStats.incomingMissileDist}m • Deploy Flare!`}
                    </span>
                  </div>
                </div>
              )}

              {/* 🎯 PREDICTIVE LEAD AIMING RETICLE */}
              {hudStats.leadPos.visible && (
                <div 
                  className="absolute pointer-events-none z-10 w-8 h-8 rounded-full border-2 border-emerald-400 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                  style={{ left: `${hudStats.leadPos.x}px`, top: `${hudStats.leadPos.y}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="absolute -bottom-4 text-[9px] font-mono font-bold text-emerald-400">ATEŞ NİŞANGAHI</span>
                </div>
              )}

              {/* 📻 COMBAT RADIO COMM BANNER */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-gray-800 text-cyan-300 px-4 py-1.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-lg z-10">
                <RadioTower className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{radioMsg}</span>
              </div>

              {/* 📡 3D TACTICAL RADAR MINIMAP OVERLAY */}
              <div className="absolute bottom-3 left-3 w-28 h-28 rounded-full bg-gray-950/90 border-2 border-purple-500/50 p-2 backdrop-blur-md overflow-hidden pointer-events-none z-10 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-purple-500/30 relative flex items-center justify-center">
                  <div className="absolute w-full h-0.5 bg-purple-500/20"></div>
                  <div className="absolute h-full w-0.5 bg-purple-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 z-10"></div>
                  {/* Enemy Dot */}
                  <div 
                    className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping absolute"
                    style={{
                      transform: `translate(${Math.max(-35, Math.min(35, hudStats.radarPos.x * 0.4))}px, ${Math.max(-35, Math.min(35, -hudStats.radarPos.y * 0.4))}px)`
                    }}
                  ></div>
                  <span className="absolute top-1 text-[8px] font-mono text-purple-400 font-bold">RADAR</span>
                </div>
              </div>

              {/* Flight HUD Overlay Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full border-2 border-dashed ${hudStats.lockOn ? 'border-red-500 animate-spin' : 'border-purple-500/40'} flex items-center justify-center`}>
                  <div className={`w-4 h-4 rounded-full ${hudStats.lockOn ? 'bg-red-500 animate-pulse' : 'bg-purple-400/60'}`}></div>
                </div>
              </div>

              {!isMobile && (
                <div className="absolute top-3 right-3 bg-gray-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-800 text-[11px] text-gray-300 flex flex-wrap items-center gap-2.5">
                  <span>🚀 <strong className="text-white">WASD / Yön Tuşları</strong> (360° Pitch/Yaw)</span>
                  <span>🔄 <strong className="text-amber-400">Q / E</strong> (Roll)</span>
                  <span>🛑 <strong className="text-rose-400">C / Ctrl</strong> (Hava Freni)</span>
                  <span>🔥 <strong className="text-cyan-400">Space</strong> (Vulcan)</span>
                  <span>🎯 <strong className="text-pink-400">F</strong> (3D Füze)</span>
                  <span>✨ <strong className="text-yellow-400">G</strong> (Flare)</span>
                  <span>⚡ <strong className="text-purple-400">Shift</strong> (Warp)</span>
                </div>
              )}
            </div>

            {/* Mobile Touch Flight Controls */}
            {isMobile && (
              <div className="grid grid-cols-2 gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800">
                <div 
                  className="h-36 bg-gray-950/80 rounded-2xl border border-gray-800 relative flex items-center justify-center touch-none"
                  onTouchStart={handleTouchStartLeft}
                  onTouchMove={handleTouchMoveLeft}
                  onTouchEnd={handleTouchEndLeft}
                >
                  <div className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center relative">
                    <div 
                      className="w-10 h-10 rounded-full bg-purple-500/40 border border-purple-400 shadow-lg shadow-purple-500/50 absolute transition-transform duration-75"
                      style={{ transform: `translate(${joystickLeftPos.x}px, ${joystickLeftPos.y}px)` }}
                    ></div>
                  </div>
                  <span className="absolute bottom-1 text-[9px] text-gray-500 font-bold">360° UÇUŞ JOYSTICK</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onTouchStart={() => triggerVulcan(myRole)}
                    className="bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 border border-cyan-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg py-2"
                  >
                    <Flame className="w-4 h-4 text-cyan-400" />
                    <span>VULCAN</span>
                  </button>

                  <button
                    onTouchStart={() => triggerMissile(myRole)}
                    className="bg-pink-600/30 hover:bg-pink-600/50 active:scale-95 text-pink-300 border border-pink-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg py-2"
                  >
                    <Target className="w-4 h-4 text-pink-400" />
                    <span>FÜZE</span>
                  </button>

                  <button
                    onTouchStart={() => { touchBrakeRef.current = true; }}
                    onTouchEnd={() => { touchBrakeRef.current = false; }}
                    className="bg-rose-600/30 hover:bg-rose-600/50 active:scale-95 text-rose-300 border border-rose-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg py-2"
                  >
                    <OctagonX className="w-4 h-4 text-rose-400" />
                    <span>FREN</span>
                  </button>

                  <button
                    onTouchStart={() => triggerFlares(myRole)}
                    className="bg-yellow-600/30 hover:bg-yellow-600/50 active:scale-95 text-yellow-300 border border-yellow-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg py-2 col-span-1"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>FLARE</span>
                  </button>

                  <button
                    onTouchStart={() => triggerWarp(myRole)}
                    className="bg-purple-600/30 hover:bg-purple-600/50 active:scale-95 text-purple-300 border border-purple-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg py-2 col-span-2"
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>WARP BOOST</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── GAMEOVER STATE ────────────────────────────────────────────────── */}
        {gameState === 'gameover' && (
          <div className="bg-gray-900/95 backdrop-blur-2xl p-8 rounded-3xl border border-gray-800 shadow-2xl text-center space-y-6 max-w-md mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">
                {winnerRole === myRole ? (isTr ? '🎉 3D UZAY ZAFERİ!' : '🎉 3D ORBITAL VICTORY!') : (isTr ? '💥 MAĞLUP OLDUNUZ' : '💥 DEFEAT')}
              </h2>
              <p className="text-sm font-bold text-amber-300">
                🏆 {getWinnerName()} {isTr ? 'uzay it dalaşını kazandı!' : 'won the 3D space dogfight!'}
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
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isTr ? 'Tekrar Uç' : 'Fly Again'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

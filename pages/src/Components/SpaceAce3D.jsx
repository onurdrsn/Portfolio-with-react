import React, { useState, useEffect, useRef } from 'react';
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
  Minimize,
  Flame,
  Crosshair,
  Compass,
  AlertTriangle
} from 'lucide-react';

const WORKER_URL = 'https://portfolio-worker.onurd.com.tr';

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
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'missile') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'flare') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'warp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'explosion') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    }
  } catch (e) {
    // Audio context initialization
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
  const [myPlayerId, setMyPlayerId] = useState('');
  
  // Custom Nickname State
  const [customUsername, setCustomUsername] = useState('AcePilot-1');
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

  // 3D Canvas Mount Ref & Engine Data
  const mountRef = useRef(null);
  const animationFrameRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // Flight Stats HUD State
  const [hudStats, setHudStats] = useState({
    targetDist: 0,
    lockOn: false,
    speed: 0,
    missilesLeft: 6,
    flaresLeft: 4,
    warpCooldown: 0
  });

  // Three.js Scene References
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    p1Jet: null,
    p2Jet: null,
    asteroids: [],
    bullets: [],
    missiles: [],
    flares: [],
    particles: []
  });

  // 3D Space Flight Logical Engine State (6-DOF)
  const flightEngineRef = useRef({
    p1: {
      x: -30, y: 0, z: 40,
      pitch: 0, yaw: 0, roll: 0,
      speed: 0.4, hp: 100,
      missiles: 6, flares: 4,
      warpCooldown: 0, missileCooldown: 0, flareCooldown: 0,
      name: 'AcePilot-1'
    },
    p2: {
      x: 30, y: 0, z: -40,
      pitch: 0, yaw: Math.PI, roll: 0,
      speed: 0.4, hp: 100,
      missiles: 6, flares: 4,
      warpCooldown: 0, missileCooldown: 0, flareCooldown: 0,
      name: 'StarRival'
    },
    bullets: [],
    missiles: [],
    flares: [],
    asteroids: [
      { x: -10, y: 5, z: 10, radius: 4.5, rotX: 0.01, rotY: 0.015 },
      { x: 15, y: -8, z: -15, radius: 5.5, rotX: 0.008, rotY: 0.012 },
      { x: -20, y: -10, z: -25, radius: 6.0, rotX: 0.015, rotY: 0.005 },
      { x: 25, y: 12, z: 20, radius: 5.0, rotX: 0.005, rotY: 0.018 },
      { x: 0, y: -15, z: 0, radius: 7.0, rotX: 0.01, rotY: 0.01 },
      { x: 5, y: 18, z: -30, radius: 4.0, rotX: 0.02, rotY: 0.008 }
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
        'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyE', 'ShiftLeft', 'ShiftRight', 'Enter'
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

  // ─── 1. Create Online Room ────────────────────────────────────────────────
  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'AcePilot-1';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/create-room`, { name: myName });
      if (res.data?.ok) {
        setRoomCode(res.data.code);
        setMyRole('p1');
        setP1Name(myName);
        flightEngineRef.current.p1.name = myName;
        setMyPlayerId(res.data.playerId);
        setGameState('waiting');
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
    flightEngineRef.current.p1.name = myName;
    flightEngineRef.current.p2.name = 'AceBot-AI 3000';
    setGameState('playing');

    flightEngineRef.current.p1.hp = 100;
    flightEngineRef.current.p1.x = -30;
    flightEngineRef.current.p1.y = 0;
    flightEngineRef.current.p1.z = 40;
    flightEngineRef.current.p1.missiles = 6;
    flightEngineRef.current.p1.flares = 4;

    flightEngineRef.current.p2.hp = 100;
    flightEngineRef.current.p2.x = 30;
    flightEngineRef.current.p2.y = 0;
    flightEngineRef.current.p2.z = -40;
    flightEngineRef.current.p2.missiles = 6;
    flightEngineRef.current.p2.flares = 4;

    flightEngineRef.current.bullets = [];
    flightEngineRef.current.missiles = [];
    flightEngineRef.current.flares = [];
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
          x: myObj.x,
          y: myObj.z, // Map Z to y for payload compatibility
          angle: myObj.yaw,
          hp: myObj.hp,
          score: 0,
          shield: false,
          newBullets: myObj.pendingBullets || []
        });

        myObj.pendingBullets = [];

        if (res.data?.ok) {
          const opp = res.data.opponent;
          if (opp) {
            const oppObj = role === 'p1' ? flightEngineRef.current.p2 : flightEngineRef.current.p1;
            oppObj.x = opp.x;
            oppObj.z = opp.y;
            oppObj.yaw = opp.angle;
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

  // Action: Twin Vulcan Plasma Cannon
  const triggerVulcan = (role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0) return;

    const speed = 1.4;
    const dir = new THREE.Vector3(
      Math.sin(p.yaw) * Math.cos(p.pitch),
      Math.sin(p.pitch),
      -Math.cos(p.yaw) * Math.cos(p.pitch)
    ).normalize();

    const bullet = {
      id: `vulcan-${Date.now()}-${Math.random()}`,
      owner: role,
      x: p.x + dir.x * 3,
      y: p.y + dir.y * 3,
      z: p.z + dir.z * 3,
      vx: dir.x * speed,
      vy: dir.y * speed,
      vz: dir.z * speed
    };

    flightEngineRef.current.bullets.push(bullet);
    if (!p.pendingBullets) p.pendingBullets = [];
    p.pendingBullets.push(bullet);

    if (soundEnabled) playFlightAudioEffect('vulcan');
  };

  // Action: Lock-On Homing Missile
  const triggerMissile = (role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || p.missiles <= 0 || (p.missileCooldown && p.missileCooldown > 0)) return;

    p.missiles--;
    p.missileCooldown = 120; // 2s cooldown

    const missile = {
      id: `msl-${Date.now()}-${Math.random()}`,
      owner: role,
      targetRole: role === 'p1' ? 'p2' : 'p1',
      x: p.x,
      y: p.y,
      z: p.z,
      speed: 0.85,
      life: 300
    };

    flightEngineRef.current.missiles.push(missile);
    if (soundEnabled) playFlightAudioEffect('missile');
  };

  // Action: Thermal Countermeasure Flares
  const triggerFlares = (role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || p.flares <= 0 || (p.flareCooldown && p.flareCooldown > 0)) return;

    p.flares--;
    p.flareCooldown = 150;

    for (let f = 0; f < 6; f++) {
      flightEngineRef.current.flares.push({
        x: p.x + (Math.random() - 0.5) * 4,
        y: p.y + (Math.random() - 0.5) * 4,
        z: p.z + (Math.random() - 0.5) * 4,
        life: 90
      });
    }

    if (soundEnabled) playFlightAudioEffect('flare');
  };

  // Action: Hyper Warp Speed Boost
  const triggerWarp = (role) => {
    const p = role === 'p1' ? flightEngineRef.current.p1 : flightEngineRef.current.p2;
    if (p.hp <= 0 || (p.warpCooldown && p.warpCooldown > 0)) return;

    p.warpCooldown = 240; // 4s cooldown
    const boostSpeed = 12.0;

    const dirX = Math.sin(p.yaw) * Math.cos(p.pitch);
    const dirY = Math.sin(p.pitch);
    const dirZ = -Math.cos(p.yaw) * Math.cos(p.pitch);

    p.x += dirX * boostSpeed;
    p.y += dirY * boostSpeed;
    p.z += dirZ * boostSpeed;

    if (soundEnabled) playFlightAudioEffect('warp');
  };

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
    scene.background = new THREE.Color(0x02030a);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);

    // Create WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.appendChild(renderer.domElement);

    // Dynamic Space Lights
    const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    sunLight.position.set(200, 150, 300);
    scene.add(sunLight);

    // Procedural Starfield (3,000 Glowing 3D Stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1200;
      starPositions[i + 1] = (Math.random() - 0.5) * 1200;
      starPositions[i + 2] = (Math.random() - 0.5) * 1200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.85 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Backdrop Planet & Ring
    const planetGeo = new THREE.SphereGeometry(60, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8, metalness: 0.3 });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.position.set(-250, -80, -400);
    scene.add(planetMesh);

    // Central Orbital Space Station Structure
    const stationGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(35, 3, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const stationRing = new THREE.Mesh(ringGeo, ringMat);
    const coreGeo = new THREE.CylinderGeometry(8, 8, 30, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const stationCore = new THREE.Mesh(coreGeo, coreMat);
    stationGroup.add(stationRing, stationCore);
    stationGroup.position.set(0, 0, 0);
    scene.add(stationGroup);

    // Build 3D Asteroid Field
    const asteroidMeshes = [];
    for (const ast of flightEngineRef.current.asteroids) {
      const astGeo = new THREE.DodecahedronGeometry(ast.radius, 1);
      const astMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, metalness: 0.1 });
      const astMesh = new THREE.Mesh(astGeo, astMat);
      astMesh.position.set(ast.x, ast.y, ast.z);
      scene.add(astMesh);
      asteroidMeshes.push(astMesh);
    }

    // Builder function for High-Detail 3D Space Fighter Jet
    const create3DFighterJet = (colorHex) => {
      const group = new THREE.Group();

      // Fuselage Nose & Body
      const bodyGeo = new THREE.ConeGeometry(0.8, 4.5, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI / 2;
      group.add(body);

      // Glass Cockpit Canopy
      const glassGeo = new THREE.SphereGeometry(0.5, 12, 12);
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, opacity: 0.9, transparent: true, roughness: 0.1 });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 0.4, 0.4);
      group.add(glass);

      // Swept Delta Wings
      const wingGeo = new THREE.BoxGeometry(4.8, 0.1, 1.8);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0, -0.4);
      group.add(wings);

      // Twin Engine Exhaust Glows
      const engineGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
      const engineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const engine1 = new THREE.Mesh(engineGeo, engineMat);
      engine1.position.set(-0.5, 0, -2.0);
      engine1.rotation.x = Math.PI / 2;
      const engine2 = new THREE.Mesh(engineGeo, engineMat);
      engine2.position.set(0.5, 0, -2.0);
      engine2.rotation.x = Math.PI / 2;
      group.add(engine1, engine2);

      return group;
    };

    const p1Jet = create3DFighterJet(0x38bdf8);
    const p2Jet = create3DFighterJet(0xf43f5e);
    scene.add(p1Jet);
    scene.add(p2Jet);

    threeRef.current = {
      scene,
      camera,
      renderer,
      p1Jet,
      p2Jet,
      asteroids: asteroidMeshes,
      bullets: [],
      missiles: [],
      flares: []
    };

    // ─── 60 FPS 3D Flight Simulation Engine Loop ─────────────────────────────
    const update3DFlight = () => {
      const state = flightEngineRef.current;
      const myObj = myRole === 'p1' ? state.p1 : state.p2;
      const oppObj = myRole === 'p1' ? state.p2 : state.p1;

      // Cooldown Decays
      if (myObj.warpCooldown > 0) myObj.warpCooldown--;
      if (myObj.missileCooldown > 0) myObj.missileCooldown--;
      if (myObj.flareCooldown > 0) myObj.flareCooldown--;

      // Steering Input Processing
      let steerPitch = 0;
      let steerYaw = 0;

      if (touchJoystickLeftRef.current.active) {
        steerYaw = touchJoystickLeftRef.current.dx * 0.045;
        steerPitch = -touchJoystickLeftRef.current.dy * 0.045;
      } else {
        if (myRole === 'p1') {
          if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) steerPitch += 0.04;
          if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) steerPitch -= 0.04;
          if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) steerYaw -= 0.04;
          if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) steerYaw += 0.04;

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
          if (keysRef.current['ArrowUp']) steerPitch += 0.04;
          if (keysRef.current['ArrowDown']) steerPitch -= 0.04;
          if (keysRef.current['ArrowLeft']) steerYaw -= 0.04;
          if (keysRef.current['ArrowRight']) steerYaw += 0.04;

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

      myObj.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, myObj.pitch + steerPitch));
      myObj.yaw += steerYaw;

      // Calculate 3D Flight Direction Vector
      const dirX = Math.sin(myObj.yaw) * Math.cos(myObj.pitch);
      const dirY = Math.sin(myObj.pitch);
      const dirZ = -Math.cos(myObj.yaw) * Math.cos(myObj.pitch);

      myObj.x += dirX * myObj.speed;
      myObj.y += dirY * myObj.speed;
      myObj.z += dirZ * myObj.speed;

      // Boundaries clamping
      myObj.x = Math.max(-140, Math.min(140, myObj.x));
      myObj.y = Math.max(-100, Math.min(100, myObj.y));
      myObj.z = Math.max(-140, Math.min(140, myObj.z));

      // Ace Pilot AI Bot (PvE 3D Flight Physics)
      if (gameMode === 'bot') {
        const bot = state.p2;
        const target = state.p1;
        const bdx = target.x - bot.x;
        const bdy = target.y - bot.y;
        const bdz = target.z - bot.z;
        const bdist = Math.hypot(bdx, bdy, bdz);

        const targetYaw = Math.atan2(bdx, -bdz);
        const targetPitch = Math.atan2(bdy, Math.hypot(bdx, bdz));

        bot.yaw += (targetYaw - bot.yaw) * 0.05;
        bot.pitch += (targetPitch - bot.pitch) * 0.05;

        const bDirX = Math.sin(bot.yaw) * Math.cos(bot.pitch);
        const bDirY = Math.sin(bot.pitch);
        const bDirZ = -Math.cos(bot.yaw) * Math.cos(bot.pitch);

        bot.x += bDirX * (bot.speed * 0.85);
        bot.y += bDirY * (bot.speed * 0.85);
        bot.z += bDirZ * (bot.speed * 0.85);

        if (bdist < 90 && Math.random() < 0.05) {
          triggerVulcan('p2');
        }
        if (bdist < 70 && Math.random() < 0.01) {
          triggerMissile('p2');
        }
      }

      // Rotate 3D Space Station & Asteroids
      stationGroup.rotation.y += 0.003;
      for (let i = 0; i < state.asteroids.length; i++) {
        const astData = state.asteroids[i];
        const astMesh = threeRef.current.asteroids[i];
        if (astMesh) {
          astMesh.rotation.x += astData.rotX;
          astMesh.rotation.y += astData.rotY;
        }
      }

      // Update 3D Bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.z += b.vz;

        if (Math.abs(b.x) > 150 || Math.abs(b.y) > 120 || Math.abs(b.z) > 150) {
          state.bullets.splice(i, 1);
          continue;
        }

        // P1 Hit
        if (b.owner !== 'p1') {
          const dist1 = Math.hypot(b.x - state.p1.x, b.y - state.p1.y, b.z - state.p1.z);
          if (dist1 < 3.2) {
            state.p1.hp = Math.max(0, state.p1.hp - 12);
            if (soundEnabled) playFlightAudioEffect('hit');
            state.bullets.splice(i, 1);
            continue;
          }
        }

        // P2 Hit
        if (b.owner !== 'p2') {
          const dist2 = Math.hypot(b.x - state.p2.x, b.y - state.p2.y, b.z - state.p2.z);
          if (dist2 < 3.2) {
            state.p2.hp = Math.max(0, state.p2.hp - 12);
            if (soundEnabled) playFlightAudioEffect('hit');
            state.bullets.splice(i, 1);
            continue;
          }
        }
      }

      // Update 3D Homing Missiles
      for (let i = state.missiles.length - 1; i >= 0; i--) {
        const m = state.missiles[i];
        const targetObj = m.targetRole === 'p1' ? state.p1 : state.p2;
        
        const mdx = targetObj.x - m.x;
        const mdy = targetObj.y - m.y;
        const mdz = targetObj.z - m.z;
        const mdist = Math.hypot(mdx, mdy, mdz);

        if (mdist < 3.5) {
          targetObj.hp = Math.max(0, targetObj.hp - 35);
          if (soundEnabled) playFlightAudioEffect('explosion');
          state.missiles.splice(i, 1);
          continue;
        }

        m.x += (mdx / mdist) * m.speed;
        m.y += (mdy / mdist) * m.speed;
        m.z += (mdz / mdist) * m.speed;
        m.life--;

        if (m.life <= 0) {
          state.missiles.splice(i, 1);
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
          confetti({ particleCount: 250, spread: 120 });
          return;
        }
      }

      // Update 3D Jet Mesh Transforms
      p1Jet.position.set(state.p1.x, state.p1.y, state.p1.z);
      p1Jet.rotation.set(state.p1.pitch, state.p1.yaw, 0);

      p2Jet.position.set(state.p2.x, state.p2.y, state.p2.z);
      p2Jet.rotation.set(state.p2.pitch, state.p2.yaw, 0);

      // Third-Person Chase Camera Target Following
      const camDist = 14;
      const camHeight = 4.5;
      camera.position.set(
        myObj.x - Math.sin(myObj.yaw) * camDist,
        myObj.y + camHeight + Math.sin(myObj.pitch) * camDist,
        myObj.z + Math.cos(myObj.yaw) * camDist
      );
      camera.lookAt(myObj.x, myObj.y, myObj.z);

      // Update HUD Radar Distance Calculation
      const distToOpp = Math.hypot(oppObj.x - myObj.x, oppObj.y - myObj.y, oppObj.z - myObj.z);
      setHudStats({
        targetDist: Math.round(distToOpp * 10),
        lockOn: distToOpp < 80,
        speed: Math.round(myObj.speed * 400),
        missilesLeft: myObj.missiles,
        flaresLeft: myObj.flares,
        warpCooldown: myObj.warpCooldown
      });

      // Update 3D Bullet Meshes in Scene
      while (threeRef.current.bullets.length < state.bullets.length) {
        const bGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8);
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
        bMesh.position.set(bData.x, bData.y, bData.z);
        bMesh.material.color.setHex(bData.owner === 'p1' ? 0x38bdf8 : 0xf43f5e);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(update3DFlight);
    };

    animationFrameRef.current = requestAnimationFrame(update3DFlight);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [gameState, myRole, gameMode, soundEnabled]);

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
                {isTr ? 'Space-Ace 3D: Uzay İt Dalaşı Simülatörü' : 'Space-Ace 3D: Interstellar Dogfight'}
              </h1>
              <p className="text-[11px] text-gray-400">360° 3D Uçuş Simülatörü • Güdümlü Füzeler & Flare • 3D Radar HUD</p>
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

        {/* ─── LOBBY STATE: MENU / CREATE / JOIN / CUSTOM NICKNAME ─────────────── */}
        {gameState === 'menu' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Username Input Banner */}
            <div className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <User className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold text-gray-300">
                  {isTr ? '3D Pilot Çağrı Adınız:' : 'Pilot Call Sign:'}
                </span>
              </div>

              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="Örn: AcePilot-1"
                className="w-full sm:w-64 bg-gray-950 border border-gray-700 focus:border-purple-500 rounded-xl px-4 py-2 text-sm text-purple-300 font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room Card */}
              <div className="bg-gray-900/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {isTr ? 'Yeni 3D Uzay Odası Kur' : 'Create 3D Orbit Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? '4 haneli uzay oda kodu üretin. Bilgisayar veya mobilden arkadaşınızı 3D uzay arenasında it dalaşına davet edin.' 
                      : 'Generate a 4-letter 3D space room code. Invite your friend into a 3D orbital dogfight.'}
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
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{isTr ? '3D Uzay Oda Kodu Üret' : 'Generate 3D Orbit Code'}</span>
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
                    {isTr ? 'Uzay Odasına Katıl' : 'Join 3D Orbit Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? 'Arkadaşınızın oluşturduğu 4 haneli oda kodunu girerek uzay savaşına hemen bağlanın.' 
                      : 'Enter the 4-letter room code shared by your friend to join the space dogfight.'}
                  </p>

                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="ÖRN: S9A1"
                    className="w-full bg-gray-950 border border-gray-700 focus:border-pink-500 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-pink-300 placeholder-gray-600 outline-none uppercase"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!inputCode.trim() || loading}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-pink-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTr ? 'Uzay Odasına Bağlan & Oyna' : 'Join 3D Space Dogfight'}</span>
                </button>
              </div>
            </div>

            {/* Quick Match & Ace Bot Mode Bar */}
            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-300 font-semibold">
                  {isTr ? 'Uzay İt Dalaşı Seçenekleri:' : '3D Space Modes:'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleQuickMatch}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>{isTr ? '3D Rastgele Hızlı Eşleşme' : '3D Quick Space Match'}</span>
                </button>

                <button
                  onClick={handleStartBotGame}
                  className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? '3D Ace Pilot AI ile Pratik Yap' : '3D Ace Pilot AI Match'}</span>
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

              {/* Flight HUD Overlay Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full border-2 border-dashed ${hudStats.lockOn ? 'border-red-500 animate-spin' : 'border-purple-500/40'} flex items-center justify-center`}>
                  <div className={`w-4 h-4 rounded-full ${hudStats.lockOn ? 'bg-red-500 animate-pulse' : 'bg-purple-400/60'}`}></div>
                </div>
              </div>

              {!isMobile && (
                <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-800 text-[11px] text-gray-300 flex flex-wrap items-center gap-2.5">
                  <span>🚀 <strong className="text-white">WASD / Yön Tuşları</strong> (Pitch/Yaw Uçuş)</span>
                  <span>🔥 <strong className="text-cyan-400">Space</strong> (Vulcan Lazer)</span>
                  <span>🎯 <strong className="text-pink-400">F</strong> (Güdümlü Füze)</span>
                  <span>✨ <strong className="text-yellow-400">G</strong> (Flare İkazı)</span>
                  <span>⚡ <strong className="text-purple-400">Shift</strong> (Warp Boost)</span>
                </div>
              )}
            </div>

            {/* Mobile Touch Flight Controls */}
            {isMobile && (
              <div className="grid grid-cols-2 gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800">
                <div 
                  className="h-32 bg-gray-950/80 rounded-2xl border border-gray-800 relative flex items-center justify-center touch-none"
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
                  <span className="absolute bottom-1 text-[9px] text-gray-500 font-bold">UÇUŞ JOYSTICK</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onTouchStart={() => triggerVulcan(myRole)}
                    className="bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 border border-cyan-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Flame className="w-5 h-5 text-cyan-400" />
                    <span>VULCAN</span>
                  </button>

                  <button
                    onTouchStart={() => triggerMissile(myRole)}
                    className="bg-pink-600/30 hover:bg-pink-600/50 active:scale-95 text-pink-300 border border-pink-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Target className="w-5 h-5 text-pink-400" />
                    <span>FÜZE</span>
                  </button>

                  <button
                    onTouchStart={() => triggerFlares(myRole)}
                    className="bg-yellow-600/30 hover:bg-yellow-600/50 active:scale-95 text-yellow-300 border border-yellow-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span>FLARE</span>
                  </button>

                  <button
                    onTouchStart={() => triggerWarp(myRole)}
                    className="bg-purple-600/30 hover:bg-purple-600/50 active:scale-95 text-purple-300 border border-purple-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span>WARP</span>
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

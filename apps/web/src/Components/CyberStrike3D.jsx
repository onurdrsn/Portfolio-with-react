import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import axios from 'axios';
import * as THREE from 'three';
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
  Minimize,
  Flame,
  Rocket
} from 'lucide-react';

const WORKER_URL = 'https://portfolio-worker.onurd.com.tr';

// Positional 3D Web Audio API Synthesizer
const playAudio3DEffect = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'dash') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'shield') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context initialization
  }
};

export default function CyberStrike3D() {
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
  const [customUsername, setCustomUsername] = useState('SiberKomutan');
  const [p1Name, setP1Name] = useState('SiberKomutan');
  const [p2Name, setP2Name] = useState('SiberRakip');

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
  const touchJoystickRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  // 3D Canvas Container Ref & Engine Data
  const mountRef = useRef(null);
  const animationFrameRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // Three.js References
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    p1Mesh: null,
    p2Mesh: null,
    p1ShieldMesh: null,
    p2ShieldMesh: null,
    p1Light: null,
    p2Light: null,
    obstacleMeshes: [],
    bulletMeshes: [],
    particleSystems: []
  });

  // Game Engine Logical State
  const gameEngineRef = useRef({
    p1: { x: -14, z: 0, angle: 0, hp: 100, heat: 0, overheated: false, shield: false, shieldCooldown: 0, dashCooldown: 0, name: 'SiberKomutan' },
    p2: { x: 14, z: 0, angle: Math.PI, hp: 100, heat: 0, overheated: false, shield: false, shieldCooldown: 0, dashCooldown: 0, name: 'SiberRakip' },
    bullets: [],
    particles: [],
    obstacles: [
      { x: 0, z: -8, w: 6, h: 4, d: 2, type: 'steel', name: 'Zırhlı Siper' },
      { x: 0, z: 8, w: 6, h: 4, d: 2, type: 'steel', name: 'Zırhlı Siper' },
      { x: -8, z: 0, w: 2, h: 5, d: 8, type: 'energy', name: 'Siber Bariyer' },
      { x: 8, z: 0, w: 2, h: 5, d: 8, type: 'energy', name: 'Siber Bariyer' },
      { x: 0, z: 0, w: 3, h: 6, d: 3, type: 'core', name: 'Reaktör Çekirdeği' }
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

  // Complete Page Scroll Disabler (Wheel, Touchmove, Scroll, Arrow Keys)
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

  // Keyboard Listeners for 3D Game Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const gameKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
        'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyK', 'KeyL', 'ShiftLeft', 'ShiftRight', 'Enter'
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
    const myName = customUsername.trim() || 'SiberKomutan';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/create-room`, { name: myName });
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

  // ─── 2. Join Online Room ──────────────────────────────────────────────────
  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'SiberKomutan';
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

  // ─── 3. Quick Match Online ────────────────────────────────────────────────
  const handleQuickMatch = async () => {
    setLoading(true);
    setErrorMessage('');
    const myName = customUsername.trim() || 'SiberKomutan';
    try {
      const res = await axios.post(`${WORKER_URL}/api/game/quick-match`, { name: myName });
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

  // ─── 4. Play vs 3D AI Bot (PvE Offline) ──────────────────────────────────
  const handleStartBotGame = () => {
    const myName = customUsername.trim() || 'SiberKomutan';
    setGameMode('bot');
    setMyRole('p1');
    setP1Name(myName);
    setP2Name('CyberMech-AI 9000');
    gameEngineRef.current.p1.name = myName;
    gameEngineRef.current.p2.name = 'CyberMech-AI 9000';
    setGameState('playing');

    gameEngineRef.current.p1.hp = 100;
    gameEngineRef.current.p1.heat = 0;
    gameEngineRef.current.p1.x = -14;
    gameEngineRef.current.p1.z = 0;
    gameEngineRef.current.p2.hp = 100;
    gameEngineRef.current.p2.heat = 0;
    gameEngineRef.current.p2.x = 14;
    gameEngineRef.current.p2.z = 0;
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

  // Real-time State Sync with Worker
  const startOnlineSync = (code, role) => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(async () => {
      const myObj = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;

      try {
        const res = await axios.post(`${WORKER_URL}/api/game/sync-state`, {
          code,
          role,
          x: myObj.x,
          y: myObj.z, // Mapping Z to y for worker 2D payload compatibility
          angle: myObj.angle,
          hp: myObj.hp,
          score: 0,
          shield: myObj.shield,
          newBullets: myObj.pendingBullets || []
        });

        myObj.pendingBullets = [];

        if (res.data?.ok) {
          const opp = res.data.opponent;
          if (opp) {
            const oppObj = role === 'p1' ? gameEngineRef.current.p2 : gameEngineRef.current.p1;
            oppObj.x = opp.x;
            oppObj.z = opp.y;
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
            confetti({ particleCount: 200, spread: 100 });
          }
        }
      } catch (e) {
        console.error('3D Sync error:', e);
      }
    }, 100);
  };

  // Copy Room Code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3D Fire Cannon Action (With Heat Mechanics)
  const triggerFire3D = (role) => {
    const p = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;
    if (p.hp <= 0 || p.overheated) return;

    p.heat = (p.heat || 0) + 24;
    if (p.heat >= 100) {
      p.heat = 100;
      p.overheated = true;
    }

    const speed = 0.65;
    const vx = Math.cos(p.angle) * speed;
    const vz = Math.sin(p.angle) * speed;

    const bullet = {
      id: `b3d-${Date.now()}-${Math.random()}`,
      owner: role,
      x: p.x + Math.cos(p.angle) * 2.2,
      z: p.z + Math.sin(p.angle) * 2.2,
      vx,
      vz
    };

    gameEngineRef.current.bullets.push(bullet);
    if (!p.pendingBullets) p.pendingBullets = [];
    p.pendingBullets.push(bullet);

    if (soundEnabled) playAudio3DEffect('laser');
  };

  // 3D Thruster Dash Impulse
  const triggerDash3D = (role) => {
    const p = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;
    if (p.hp <= 0 || (p.dashCooldown && p.dashCooldown > 0)) return;

    p.dashCooldown = 180; // 3 seconds cooldown
    const dashDist = 4.0;
    const nx = p.x + Math.cos(p.angle) * dashDist;
    const nz = p.z + Math.sin(p.angle) * dashDist;

    // Check boundary
    if (nx >= -24 && nx <= 24) p.x = nx;
    if (nz >= -16 && nz <= 16) p.z = nz;

    if (soundEnabled) playAudio3DEffect('dash');
  };

  // 3D Energy Shield Action
  const triggerShield3D = (role) => {
    const p = role === 'p1' ? gameEngineRef.current.p1 : gameEngineRef.current.p2;
    if (p.hp <= 0 || p.shield || (p.shieldCooldown && p.shieldCooldown > 0)) return;

    p.shield = true;
    p.shieldCooldown = 200; // ~3.3 seconds cooldown

    if (soundEnabled) playAudio3DEffect('shield');
    setTimeout(() => {
      p.shield = false;
    }, 1400);
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

  // ─── 5. Three.js 3D WebGL Engine & Render Loop ─────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing' || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040612);
    scene.fog = new THREE.FogExp2(0x040612, 0.018);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 24, 26);
    camera.lookAt(0, 0, 0);

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const floorGrid = new THREE.GridHelper(60, 30, 0x38bdf8, 0x1e293b);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);

    // Floor Mesh
    const floorGeo = new THREE.PlaneGeometry(60, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x070a1e, roughness: 0.8, metalness: 0.2 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Build 3D Mechs
    const create3DMechMesh = (colorHex) => {
      const group = new THREE.Group();

      // Body
      const bodyGeo = new THREE.BoxGeometry(1.6, 0.8, 2.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.8, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);

      // Treads
      const treadGeo = new THREE.BoxGeometry(0.4, 0.6, 2.4);
      const treadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
      const leftTread = new THREE.Mesh(treadGeo, treadMat);
      leftTread.position.set(-1.0, 0.5, 0);
      const rightTread = new THREE.Mesh(treadGeo, treadMat);
      rightTread.position.set(1.0, 0.5, 0);
      group.add(leftTread, rightTread);

      // Turret Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 1.1, 1.0);
      group.add(barrel);

      return group;
    };

    // Build 3D Shield Shell
    const create3DShieldMesh = () => {
      const shieldGeo = new THREE.SphereGeometry(2.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const shieldMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4,
        wireframe: true
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.rotation.x = Math.PI / 2;
      shield.position.y = 0.8;
      shield.visible = false;
      return shield;
    };

    const p1Mesh = create3DMechMesh(0x38bdf8);
    const p2Mesh = create3DMechMesh(0xf43f5e);
    const p1ShieldMesh = create3DShieldMesh();
    const p2ShieldMesh = create3DShieldMesh();
    p1Mesh.add(p1ShieldMesh);
    p2Mesh.add(p2ShieldMesh);

    scene.add(p1Mesh);
    scene.add(p2Mesh);

    // Build 3D Obstacles
    const obstacleMeshes = [];
    for (const obs of gameEngineRef.current.obstacles) {
      const obsGeo = new THREE.BoxGeometry(obs.w, obs.h, obs.d);
      let obsMat;
      if (obs.type === 'steel') {
        obsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      } else if (obs.type === 'energy') {
        obsMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0x7e22ce, emissiveIntensity: 0.6 });
      } else {
        obsMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 0.8 });
      }

      const obsMesh = new THREE.Mesh(obsGeo, obsMat);
      obsMesh.position.set(obs.x, obs.h / 2, obs.z);
      obsMesh.castShadow = true;
      obsMesh.receiveShadow = true;

      // Outer glow line
      const edges = new THREE.EdgesGeometry(obsGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: obs.type === 'steel' ? 0xf59e0b : obs.type === 'energy' ? 0xc084fc : 0x38bdf8 });
      const line = new THREE.LineSegments(edges, lineMat);
      obsMesh.add(line);

      scene.add(obsMesh);
      obstacleMeshes.push(obsMesh);
    }

    threeRef.current = {
      scene,
      camera,
      renderer,
      p1Mesh,
      p2Mesh,
      p1ShieldMesh,
      p2ShieldMesh,
      obstacleMeshes,
      bulletMeshes: [],
      particleSystems: []
    };

    // Main 3D Game Loop
    const update3DScene = () => {
      const state = gameEngineRef.current;

      // Heat & Cooldown decay
      for (const p of [state.p1, state.p2]) {
        if (p.heat > 0) {
          p.heat = Math.max(0, p.heat - 0.75);
          if (p.heat === 0) p.overheated = false;
        }
        if (p.shieldCooldown > 0) p.shieldCooldown--;
        if (p.dashCooldown > 0) p.dashCooldown--;
      }

      const myObj = myRole === 'p1' ? state.p1 : state.p2;
      const speed = 0.16;

      let moveX = 0;
      let moveZ = 0;

      if (touchJoystickRef.current.active) {
        moveX = touchJoystickRef.current.dx;
        moveZ = touchJoystickRef.current.dy;
      } else {
        if (myRole === 'p1') {
          if (keysRef.current['KeyW']) moveZ -= 1;
          if (keysRef.current['KeyS']) moveZ += 1;
          if (keysRef.current['KeyA']) moveX -= 1;
          if (keysRef.current['KeyD']) moveX += 1;
          if (keysRef.current['KeyF'] || keysRef.current['Space']) {
            triggerFire3D('p1');
            keysRef.current['KeyF'] = false;
            keysRef.current['Space'] = false;
          }
          if (keysRef.current['KeyG']) {
            triggerShield3D('p1');
            keysRef.current['KeyG'] = false;
          }
          if (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight']) {
            triggerDash3D('p1');
            keysRef.current['ShiftLeft'] = false;
            keysRef.current['ShiftRight'] = false;
          }
        } else {
          if (keysRef.current['ArrowUp']) moveZ -= 1;
          if (keysRef.current['ArrowDown']) moveZ += 1;
          if (keysRef.current['ArrowLeft']) moveX -= 1;
          if (keysRef.current['ArrowRight']) moveX += 1;
          if (keysRef.current['KeyL'] || keysRef.current['Enter']) {
            triggerFire3D('p2');
            keysRef.current['KeyL'] = false;
            keysRef.current['Enter'] = false;
          }
          if (keysRef.current['KeyK']) {
            triggerShield3D('p2');
            keysRef.current['KeyK'] = false;
          }
        }
      }

      // 3D Collision Movement
      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.hypot(moveX, moveZ);
        const nx = myObj.x + (moveX / len) * speed;
        const nz = myObj.z + (moveZ / len) * speed;
        const radius = 1.2;

        let canMoveX = true;
        let canMoveZ = true;

        for (const obs of state.obstacles) {
          if (
            nx + radius > obs.x - obs.w / 2 &&
            nx - radius < obs.x + obs.w / 2 &&
            myObj.z + radius > obs.z - obs.d / 2 &&
            myObj.z - radius < obs.z + obs.d / 2
          ) {
            canMoveX = false;
          }
          if (
            myObj.x + radius > obs.x - obs.w / 2 &&
            myObj.x - radius < obs.x + obs.w / 2 &&
            nz + radius > obs.z - obs.d / 2 &&
            nz - radius < obs.z + obs.d / 2
          ) {
            canMoveZ = false;
          }
        }

        if (canMoveX && nx >= -27 && nx <= 27) myObj.x = nx;
        if (canMoveZ && nz >= -18 && nz <= 18) myObj.z = nz;

        myObj.angle = Math.atan2(moveZ, moveX);
      }

      // 3D AI Bot Movement & Pathfinding
      if (gameMode === 'bot') {
        const bot = state.p2;
        const target = state.p1;
        const dx = target.x - bot.x;
        const dz = target.z - bot.z;
        const dist = Math.hypot(dx, dz);

        // Raycast Line-Of-Sight Check
        let hasLOS = true;
        const steps = 12;
        for (let s = 1; s < steps; s++) {
          const rx = bot.x + (dx * (s / steps));
          const rz = bot.z + (dz * (s / steps));
          for (const obs of state.obstacles) {
            if (
              rx >= obs.x - obs.w / 2 && rx <= obs.x + obs.w / 2 &&
              rz >= obs.z - obs.d / 2 && rz <= obs.z + obs.d / 2
            ) {
              hasLOS = false;
              break;
            }
          }
          if (!hasLOS) break;
        }

        bot.angle = Math.atan2(dz, dx);

        let botDx = 0;
        let botDz = 0;

        if (!hasLOS) {
          botDz = bot.z < 0 ? -1 : 1;
          botDx = bot.x > 0 ? -0.8 : 0.8;
        } else if (dist > 6) {
          botDx = Math.cos(bot.angle);
          botDz = Math.sin(bot.angle);
        }

        if (botDx !== 0 || botDz !== 0) {
          const len = Math.hypot(botDx, botDz);
          const bnx = bot.x + (botDx / len) * (speed * 0.75);
          const bnz = bot.z + (botDz / len) * (speed * 0.75);
          const radius = 1.2;

          let canMoveX = true;
          let canMoveZ = true;

          for (const obs of state.obstacles) {
            if (
              bnx + radius > obs.x - obs.w / 2 && bnx - radius < obs.x + obs.w / 2 &&
              bot.z + radius > obs.z - obs.d / 2 && bot.z - radius < obs.z + obs.d / 2
            ) {
              canMoveX = false;
            }
            if (
              bot.x + radius > obs.x - obs.w / 2 && bot.x - radius < obs.x + obs.w / 2 &&
              bnz + radius > obs.z - obs.d / 2 && bnz - radius < obs.z + obs.d / 2
            ) {
              canMoveZ = false;
            }
          }

          if (canMoveX && bnx >= -27 && bnx <= 27) bot.x = bnx;
          if (canMoveZ && bnz >= -18 && bnz <= 18) bot.z = bnz;
        }

        if (hasLOS && Math.random() < 0.04) {
          triggerFire3D('p2');
        }
      }

      // Update 3D Bullet Meshes & Collisions
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx;
        b.z += b.vz;

        if (b.x < -29 || b.x > 29 || b.z < -19 || b.z > 19) {
          state.bullets.splice(i, 1);
          continue;
        }

        // 3D Wall Hit Check
        let hitWall = false;
        for (const obs of state.obstacles) {
          if (
            b.x >= obs.x - obs.w / 2 && b.x <= obs.x + obs.w / 2 &&
            b.z >= obs.z - obs.d / 2 && b.z <= obs.z + obs.d / 2
          ) {
            hitWall = true;
            if (soundEnabled) playAudio3DEffect('hit');
            break;
          }
        }

        if (hitWall) {
          state.bullets.splice(i, 1);
          continue;
        }

        // P1 Hit Check
        if (b.owner !== 'p1') {
          const d = Math.hypot(b.x - state.p1.x, b.z - state.p1.z);
          if (d < 1.6) {
            if (!state.p1.shield) {
              state.p1.hp = Math.max(0, state.p1.hp - 15);
              if (soundEnabled) playAudio3DEffect('hit');
            }
            state.bullets.splice(i, 1);
            continue;
          }
        }

        // P2 Hit Check
        if (b.owner !== 'p2') {
          const d = Math.hypot(b.x - state.p2.x, b.z - state.p2.z);
          if (d < 1.6) {
            if (!state.p2.shield) {
              state.p2.hp = Math.max(0, state.p2.hp - 15);
              if (soundEnabled) playAudio3DEffect('hit');
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
          confetti({ particleCount: 200, spread: 100 });
          return;
        }
      }

      // Update Three.js Mesh Positions
      p1Mesh.position.set(state.p1.x, 0, state.p1.z);
      p1Mesh.rotation.y = -state.p1.angle + Math.PI / 2;
      p1ShieldMesh.visible = !!state.p1.shield;

      p2Mesh.position.set(state.p2.x, 0, state.p2.z);
      p2Mesh.rotation.y = -state.p2.angle + Math.PI / 2;
      p2ShieldMesh.visible = !!state.p2.shield;

      // Update 3D Bullet Meshes in Scene
      while (threeRef.current.bulletMeshes.length < state.bullets.length) {
        const bulletGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
        scene.add(bulletMesh);
        threeRef.current.bulletMeshes.push(bulletMesh);
      }

      while (threeRef.current.bulletMeshes.length > state.bullets.length) {
        const oldB = threeRef.current.bulletMeshes.pop();
        scene.remove(oldB);
      }

      for (let i = 0; i < state.bullets.length; i++) {
        const b = state.bullets[i];
        const mesh = threeRef.current.bulletMeshes[i];
        mesh.position.set(b.x, 0.8, b.z);
        mesh.material.color.setHex(b.owner === 'p1' ? 0x38bdf8 : 0xf43f5e);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(update3DScene);
    };

    animationFrameRef.current = requestAnimationFrame(update3DScene);

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
            <div className="p-2 bg-cyan-600/20 border border-cyan-500/30 rounded-xl">
              <Rocket className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isTr ? 'CyberStrike 3D: Taktiksel Mech Savaşı' : 'CyberStrike 3D: Tactical Mech Warfare'}
              </h1>
              <p className="text-[11px] text-gray-400">Three.js WebGL 3D Donanım Hızlandırma • 3D Fizik & Ballistik • Çapraz Cihaz</p>
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
                  {isTr ? '3D Siber Komutan Adınız:' : '3D Nickname:'}
                </span>
              </div>

              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="Örn: @SiberKomutan"
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
                    {isTr ? 'Yeni 3D Online Oda Kur' : 'Create 3D Online Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? '4 haneli özel 3D oda kodu üretin. Bilgisayar veya mobilden arkadaşınızı 3D arenaya çağırın.' 
                      : 'Generate a 4-letter room code. Invite your friend into the 3D tactical arena.'}
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
                  <span>{isTr ? '3D Oda Kodu Üret' : 'Generate 3D Room Code'}</span>
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
                    {isTr ? '3D Odasına Katıl' : 'Join 3D Room'}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isTr 
                      ? 'Arkadaşınızın ürettiği 4 haneli 3D oda kodunu girerek kapışmaya bağlanın.' 
                      : 'Enter the 4-letter 3D room code to start battling in 3D.'}
                  </p>

                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="ÖRN: K9X2"
                    className="w-full bg-gray-950 border border-gray-700 focus:border-pink-500 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-pink-300 placeholder-gray-600 outline-none uppercase"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!inputCode.trim() || loading}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-pink-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isTr ? '3D Odaya Katıl & Oyna' : 'Join 3D Battle'}</span>
                </button>
              </div>
            </div>

            {/* Quick Match & Bot Mode Bar */}
            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-violet-400" />
                <span className="text-xs text-gray-300 font-semibold">
                  {isTr ? 'Zorlu 3D Seçenekler:' : '3D Modes:'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleQuickMatch}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  <span>{isTr ? '3D Hızlı Eşleşme' : '3D Quick Match'}</span>
                </button>

                <button
                  onClick={handleStartBotGame}
                  className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTr ? '3D Hardcore AI Bot ile Oyna' : 'Hardcore 3D Bot Match'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ─── WAITING STATE ─────────────────────────────────────────────────── */}
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
                {isTr ? '3D Rakibin Katılması Bekleniyor...' : 'Waiting for 3D Opponent...'}
              </h2>
              <p className="text-xs text-gray-400">
                {isTr ? 'Aşağıdaki oda kodunu kopyalayıp arkadaşınıza gönderin:' : 'Copy and share this 3D room code:'}
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

        {/* ─── PLAYING STATE: THREE.JS 3D CANVAS & HARDCORE HUD ─────────────── */}
        {gameState === 'playing' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* HUD Status Bar */}
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
              
              {/* P1 Status */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50"></div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 block">
                    {gameEngineRef.current.p1.name || p1Name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                    <span>HP: {gameEngineRef.current.p1.hp}%</span>
                    {gameEngineRef.current.p1.overheated && <span className="text-red-400 font-bold animate-pulse">🔥 ISINDI</span>}
                  </div>
                </div>
              </div>

              {/* Match Mode Badge */}
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {gameMode === 'bot' ? '3D Hardcore Bot' : `3D Oda: ${roomCode}`}
                </span>
              </div>

              {/* P2 Status */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-xs font-bold text-pink-400 block">
                    {gameEngineRef.current.p2.name || p2Name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                    {gameEngineRef.current.p2.overheated && <span className="text-red-400 font-bold animate-pulse">🔥 ISINDI</span>}
                    <span>HP: {gameEngineRef.current.p2.hp}%</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-pink-400 shadow-lg shadow-pink-500/50"></div>
              </div>
            </div>

            {/* 3D WebGL Three.js Container */}
            <div className="relative bg-gray-950 rounded-3xl border-2 border-gray-800 overflow-hidden shadow-2xl flex items-center justify-center min-h-[500px]">
              <div ref={mountRef} className="w-full h-[500px] block" />

              {!isMobile && (
                <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-800 text-[11px] text-gray-300 flex flex-wrap items-center gap-2.5">
                  <span>🎮 <strong className="text-white">WASD / Tuşlar</strong> (3D Hareket)</span>
                  <span>⚡ <strong className="text-cyan-400">Space/F</strong> (3D Lazer)</span>
                  <span>🚀 <strong className="text-amber-400">Shift</strong> (Dash Boost)</span>
                  <span>🛡️ <strong className="text-purple-400">G/K</strong> (Kalkan)</span>
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
                      style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
                    ></div>
                  </div>
                  <span className="absolute bottom-1 text-[9px] text-gray-500 font-bold">3D JOYSTICK</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onTouchStart={() => triggerFire3D(myRole)}
                    className="bg-pink-600/30 hover:bg-pink-600/50 active:scale-95 text-pink-300 border border-pink-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Target className="w-5 h-5 text-pink-400" />
                    <span>ATEŞ</span>
                  </button>

                  <button
                    onTouchStart={() => triggerDash3D(myRole)}
                    className="bg-amber-600/30 hover:bg-amber-600/50 active:scale-95 text-amber-300 border border-amber-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Rocket className="w-5 h-5 text-amber-400" />
                    <span>BOOST</span>
                  </button>

                  <button
                    onTouchStart={() => triggerShield3D(myRole)}
                    className="bg-purple-600/30 hover:bg-purple-600/50 active:scale-95 text-purple-300 border border-purple-500/40 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>KALKAN</span>
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
                {winnerRole === myRole ? (isTr ? '🎉 3D ZAFER KAZANDINIZ!' : '🎉 3D VICTORY!') : (isTr ? '💥 MAĞLUP OLDUNUZ' : '💥 DEFEAT')}
              </h2>
              <p className="text-sm font-bold text-amber-300">
                🏆 {getWinnerName()} {isTr ? '3D arena savaşını kazandı!' : 'won the 3D battle!'}
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
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                {isTr ? 'Tekrar 3D Oyna' : 'Play Again'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

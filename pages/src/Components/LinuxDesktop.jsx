import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Folder,
  Terminal as TerminalIcon,
  User,
  Gamepad2,
  Mail,
  FileText,
  Clock,
  Wifi,
  Volume2,
  Battery,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Github,
  Search,
  Cpu,
  HardDrive,
  Send,
  Sparkles,
  Settings,
  ChevronRight
} from "lucide-react";

export default function LinuxDesktop() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Desktop State
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time State
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  // App Launcher & Menu
  const [appMenuOpen, setAppMenuOpen] = useState(false);

  // Windows State
  const [windows, setWindows] = useState([
    {
      id: "projects",
      title: "Dosya Yöneticisi - Projeler",
      icon: Folder,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      pos: { x: 80, y: 60 },
      size: { w: 860, h: 540 }
    },
    {
      id: "terminal",
      title: "onur@dursun-pc: ~",
      icon: TerminalIcon,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 11,
      pos: { x: 140, y: 100 },
      size: { w: 720, h: 440 }
    },
    {
      id: "sysmonitor",
      title: "Sistem İzleyici - Hakkımda & Deneyim",
      icon: Cpu,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 12,
      pos: { x: 180, y: 80 },
      size: { w: 780, h: 500 }
    },
    {
      id: "games",
      title: "Linux Oyun Merkezi",
      icon: Gamepad2,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 13,
      pos: { x: 220, y: 70 },
      size: { w: 760, h: 480 }
    },
    {
      id: "contact",
      title: "Linux Mail İstemcisi - İletişim",
      icon: Mail,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 14,
      pos: { x: 260, y: 90 },
      size: { w: 680, h: 520 }
    }
  ]);

  const [activeWindowId, setActiveWindowId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(12);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState([
    { text: "Linux dursun-pc 6.8.0-generic x86_64 x86_64 GNU/Linux", type: "system" },
    { text: "Onur Dursun OS v2.0 (Ubuntu LTS Edition) Hoş Geldiniz!", type: "success" },
    { text: "Kullanılabilir komutları görmek için 'help' yazabilirsiniz.", type: "info" }
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  // Selected Category in Projects File Manager
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedProject, setSelectedProject] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sendingMail, setSendingMail] = useState(false);

  // System Monitor Stats Simulation
  const [cpuUsage, setCpuUsage] = useState(18);
  const [ramUsage, setRamUsage] = useState(42);

  // Load backend data
  useEffect(() => {
    Promise.all([
      apiGet("/api/portfolio").catch(() => []),
      apiGet("/api/timeline").catch(() => [])
    ]).then(([p, t]) => {
      setPortfolioItems(Array.isArray(p) ? p : []);
      setTimelineItems(Array.isArray(t) ? t : []);
      setLoading(false);
    });
  }, []);

  // Live Clock & System Stats Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(now.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const statsInterval = setInterval(() => {
      setCpuUsage(Math.floor(12 + Math.random() * 20));
      setRamUsage(Math.floor(38 + Math.random() * 8));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  // Bring window to front
  const focusWindow = (id) => {
    setActiveWindowId(id);
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  // Open window
  const openWindow = (id) => {
    setAppMenuOpen(false);
    setWindows((prev) => {
      const exists = prev.find((w) => w.id === id);
      if (exists) {
        return prev.map((w) => (w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1 } : w));
      }
      return prev;
    });
    focusWindow(id);
  };

  // Close window
  const closeWindow = (id, e) => {
    e?.stopPropagation();
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  };

  // Minimize window
  const minimizeWindow = (id, e) => {
    e?.stopPropagation();
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  };

  // Toggle maximize
  const toggleMaximize = (id, e) => {
    e?.stopPropagation();
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  };

  // Drag Window Logic
  const handleDragStart = (id, e) => {
    if (e.target.closest(".no-drag")) return;
    focusWindow(id);
    const win = windows.find((w) => w.id === id);
    if (!win || win.isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...win.pos };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                pos: {
                  x: Math.max(0, initialPos.x + dx),
                  y: Math.max(32, initialPos.y + dy)
                }
              }
            : w
        )
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Current Working Directory & Terminal Config
  const [currentPath, setCurrentPath] = useState("~");
  const [terminalTextColor, setTerminalTextColor] = useState("text-emerald-400");
  const terminalEndRef = useRef(null);

  // Session Command History (Cleared on browser refresh!)
  const [cmdHistory, setCmdHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem("linux_cmd_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyNavIdx, setHistoryNavIdx] = useState(-1);

  // Desktop Wallpaper Themes
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  const WALLPAPERS = [
    "from-[#0b0e14] via-[#121624] to-[#07090e]",
    "from-[#0a1520] via-[#0d2238] to-[#050c14]",
    "from-[#1c0a20] via-[#2d0d38] to-[#0c0514]",
    "from-[#141b0a] via-[#22300f] to-[#0a1205]"
  ];

  // Custom Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  const VALID_COMMANDS = [
    "help", "ls", "cd", "pwd", "cat", "neofetch", "fastfetch", "whoami",
    "hostname", "uname", "uptime", "date", "top", "htop", "ps", "ping",
    "curl", "wget", "echo", "sudo", "git", "python", "python3", "clear",
    "history", "theme", "color", "matrix", "cmatrix", "sl", "reboot",
    "shutdown", "projects", "games", "contact", "sysmonitor", "mkdir",
    "touch", "rm"
  ];

  // Save to Session Storage Helper
  const pushCmdHistory = (cmdStr) => {
    const next = [...cmdHistory, cmdStr];
    setCmdHistory(next);
    setHistoryNavIdx(-1);
    try {
      sessionStorage.setItem("linux_cmd_history", JSON.stringify(next));
    } catch {}
  };

  // Keyboard Handler (Arrow Up/Down, Tab Autocomplete)
  const handleTerminalKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = Math.min(historyNavIdx + 1, cmdHistory.length - 1);
      setHistoryNavIdx(nextIdx);
      setTerminalInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = historyNavIdx - 1;
      if (nextIdx >= 0) {
        setHistoryNavIdx(nextIdx);
        setTerminalInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else {
        setHistoryNavIdx(-1);
        setTerminalInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const raw = terminalInput.trim().toLowerCase();
      if (!raw) return;

      const candidates = [...VALID_COMMANDS, "about.txt", "skills.json", "resume.pdf", "contact.desktop", "secret.txt", "Projeler/", "Oyunlar/"];
      const matches = candidates.filter((c) => c.toLowerCase().startsWith(raw));

      if (matches.length === 1) {
        setTerminalInput(matches[0]);
      } else if (matches.length > 1) {
        setTerminalHistory((prev) => [
          ...prev,
          { text: `onur@dursun-pc:${currentPath}$ ${terminalInput}`, type: "user" },
          { text: matches.join("   "), type: "info" }
        ]);
      }
    }
  };

  // Levenshtein & Typo Suggestion Helper
  const findTypoSuggestion = (inputCmd) => {
    const target = inputCmd.toLowerCase();
    for (const cmd of VALID_COMMANDS) {
      if (cmd.startsWith(target.slice(0, 3)) || target.startsWith(cmd.slice(0, 3))) {
        let matches = 0;
        for (let i = 0; i < Math.min(target.length, cmd.length); i++) {
          if (target[i] === cmd[i]) matches++;
        }
        if (matches >= 2 && Math.abs(target.length - cmd.length) <= 3) {
          return cmd;
        }
      }
    }
    return null;
  };

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  // Terminal Execution Engine
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const rawCmd = terminalInput.trim();
    if (!rawCmd) return;

    pushCmdHistory(rawCmd);

    const promptText = `onur@dursun-pc:${currentPath}$ ${rawCmd}`;
    const newHistory = [...terminalHistory, { text: promptText, type: "user" }];
    const parts = rawCmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (mainCmd === "help") {
      newHistory.push(
        { text: "┌────────────────────────────────────────────────────────────────────────┐", type: "system" },
        { text: "│                        BASH BUILTIN COMMANDS                           │", type: "system" },
        { text: "├────────────────────────────────────────────────────────────────────────┤", type: "system" },
        { text: "│ DOSYA & KLASÖR:                                                       │", type: "info" },
        { text: "│   ls [-l|-a]       - Dosyaları ve izinleri detaylı listeler            │", type: "info" },
        { text: "│   cd <klasör>      - Dizin değiştirir (~, .., Projeler, Oyunlar, /)   │", type: "info" },
        { text: "│   pwd              - Mevcut çalışma dizinini yazdırır                 │", type: "info" },
        { text: "│   cat <dosya>      - Dosya içeriğini okur (about.txt, skills.json)    │", type: "info" },
        { text: "│   mkdir / touch    - Klasör veya boş dosya oluşturur                  │", type: "info" },
        { text: "│                                                                        │", type: "info" },
        { text: "│ SİSTEM & DONANIM:                                                      │", type: "info" },
        { text: "│   neofetch         - Sistem donanım ve özel OD logosu özeti           │", type: "info" },
        { text: "│   uname [-a]       - Linux Çekirdek (Kernel) bilgileri                │", type: "info" },
        { text: "│   whoami / hostname- Kullanıcı ve sunucu kimlik bilgileri             │", type: "info" },
        { text: "│   uptime           - Sistem çalışma süresi ve yükü                    │", type: "info" },
        { text: "│   top / htop       - Canlı sistem süreçleri ve interaktif htop        │", type: "info" },
        { text: "│   history          - Terminal oturum komut geçmişi                    │", type: "info" },
        { text: "│   clear            - Terminal ekranını temizler                       │", type: "info" },
        { text: "│                                                                        │", type: "info" },
        { text: "│ AĞ & GELİŞTİRİCİ:                                                      │", type: "info" },
        { text: "│   ping <host>      - Ağ gecikmesi testi                               │", type: "info" },
        { text: "│   curl / wget      - HTTP isteği simülasyonu                          │", type: "info" },
        { text: "│   git status       - Depo durumunu gösterir                           │", type: "info" },
        { text: "│   python           - İnteraktif Python REPL                           │", type: "info" },
        { text: "│   sudo <komut>     - Root yetkisiyle çalıştırır                       │", type: "info" },
        { text: "│                                                                        │", type: "info" },
        { text: "│ EĞLENCE & UYGULAMA:                                                    │", type: "info" },
        { text: "│   matrix           - Matrix yeşil kod akışı                          │", type: "info" },
        { text: "│   sl               - Hareketli tren animasyonu 🚂                     │", type: "info" },
        { text: "│   theme <renk>     - Renk değiştirir (emerald, cyan, violet, amber)  │", type: "info" },
        { text: "│   projects / games - Pencereleri açar                                 │", type: "info" },
        { text: "└────────────────────────────────────────────────────────────────────────┘", type: "system" }
      );
    } else if (mainCmd === "clear" || mainCmd === "cls") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else if (mainCmd === "pwd") {
      const full = currentPath === "~" ? "/home/onur" : `/home/onur/${currentPath.replace(/^~\//, "")}`;
      newHistory.push({ text: full, type: "success" });
    } else if (mainCmd === "cd") {
      const target = args[0] || "~";
      if (target === "~" || target === "/home/onur") {
        setCurrentPath("~");
      } else if (target === ".." || target === "../") {
        setCurrentPath("~");
      } else if (target === "/" || target === "/root") {
        setCurrentPath("/");
      } else if (target.toLowerCase().includes("proje")) {
        setCurrentPath("~/Projeler");
        newHistory.push({ text: "Dizin değiştirildi: ~/Projeler", type: "info" });
      } else if (target.toLowerCase().includes("oyun")) {
        setCurrentPath("~/Oyunlar");
        newHistory.push({ text: "Dizin değiştirildi: ~/Oyunlar", type: "info" });
      } else {
        newHistory.push({ text: `bash: cd: ${target}: Böyle bir dosya veya dizin yok`, type: "error" });
      }
    } else if (mainCmd === "ls" || mainCmd === "dir") {
      const isDetailed = args.includes("-l") || args.includes("-la") || args.includes("-al");
      if (currentPath === "~/Projeler") {
        const pList = portfolioItems.map((p) => ` -rw-r--r-- 1 onur onur 4096 Jul 27 19:30 📄 ${p.title.replace(/\s+/g, "_")}.md (${p.category})`).join("\n");
        newHistory.push({ text: isDetailed ? pList : portfolioItems.map((p) => `📄 ${p.title.replace(/\s+/g, "_")}.md`).join("   "), type: "success" });
      } else if (currentPath === "~/Oyunlar") {
        newHistory.push({ text: "🎮 FlappyBird.sh   🎮 TowerDefense.sh   🎮 Minesweeper.sh   🎮 Hangman.sh   🎮 MemoryGame.sh", type: "success" });
      } else {
        if (isDetailed) {
          newHistory.push({
            text: `total 32
drwxr-xr-x 2 onur onur 4096 Jul 27 19:30 📁 Projeler/
drwxr-xr-x 2 onur onur 4096 Jul 27 19:30 📁 Oyunlar/
-rw-r--r-- 1 onur onur 1240 Jul 27 19:30 📄 about.txt
-rw-r--r-- 1 onur onur  842 Jul 27 19:30 📄 skills.json
-rw-r--r-- 1 onur onur 2048 Jul 27 19:30 📄 resume.pdf
-rwxr-xr-x 1 onur onur  312 Jul 27 19:30 ⚙️ contact.desktop
-rw------- 1 onur onur   64 Jul 27 19:30 🔒 secret.txt`,
            type: "success"
          });
        } else {
          newHistory.push({
            text: "📁 Projeler/   📁 Oyunlar/   📄 about.txt   📄 skills.json   📄 resume.pdf   ⚙️ contact.desktop   🔒 secret.txt",
            type: "success"
          });
        }
      }
    } else if (mainCmd === "cat") {
      const fileName = args[0]?.toLowerCase() || "";
      if (fileName.includes("about")) {
        newHistory.push({
          text: `┌────────────────────────────────────────────────────────┐
│ Onur Dursun - Full Stack & Software Engineer            │
├────────────────────────────────────────────────────────┤
│ Biyografi: Modern web mimarileri, Cloudflare Workers,  │
│ React, TypeScript ve Yapay Zeka uygulamaları alanında  │
│ uzmanlaşmış kıdemli yazılım geliştirici.               │
└────────────────────────────────────────────────────────┘`,
          type: "success"
        });
      } else if (fileName.includes("skill")) {
        newHistory.push({
          text: `{\n  "developer": "Onur Dursun",\n  "languages": ["TypeScript", "JavaScript", "Python", "SQL"],\n  "frontend": ["React", "Vite", "Tailwind CSS", "Redux"],\n  "backend": ["Cloudflare Workers", "Node.js", "Hono", "Neon PostgreSQL"]\n}`,
          type: "info"
        });
      } else if (fileName.includes("secret") || fileName.includes("flag")) {
        newHistory.push({
          text: "🚩 TEBRİKLER! Gizli bayrağı buldunuz!\nCTF{Onur_Dursun_Linux_Master_2026_Secret_Unlocked}",
          type: "system"
        });
      } else if (fileName.includes("resume")) {
        newHistory.push({
          text: "📄 ÖZGEÇMİŞ:\n - Pozisyon: Senior Full Stack Developer\n - Eğitim: Bilgisayar Mühendisliği\n - Uzmanlık: High Performance Web Apps & Cloud Services",
          type: "success"
        });
      } else {
        newHistory.push({ text: `cat: ${args[0] || "dosya"}: Böyle bir dosya yok. 'about.txt' veya 'skills.json' deneyin.`, type: "error" });
      }
    } else if (mainCmd === "neofetch" || mainCmd === "fastfetch") {
      newHistory.push({
        text: `       .-----------------.        onur@dursun-pc
      /   █████╗ ██████╗  \\       --------------
     |   ██╔══██╗██╔══██╗  |      OS: Onur Dursun Linux Edition 2.0 x86_64
     |   ██║  ██║██║  ██║  |      Host: Portfolio Cloud Worker Server
      \\  ╚█████╔╝██████╔╝ /       Kernel: 6.8.0-generic-ubuntu
       '-----------------'        Uptime: 42 days, 13 hours, 37 mins
                                  Shell: bash 5.2.21 (Tab completion active)
                                  CPU: High Performance Cloud Workers
                                  Memory: 4096MB / 16384MB
                                  GPU: WebGL 2.0 Accelerated Canvas`,
        type: "system"
      });
    } else if (mainCmd === "whoami") {
      newHistory.push({ text: "onur (Root Administrator)", type: "success" });
    } else if (mainCmd === "hostname") {
      newHistory.push({ text: "dursun-pc.onurd.com.tr", type: "info" });
    } else if (mainCmd === "uname") {
      newHistory.push({ text: "Linux dursun-pc 6.8.0-generic #42-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux", type: "info" });
    } else if (mainCmd === "uptime") {
      newHistory.push({ text: "19:34:00 up 42 days, 13:37, 1 user, load average: 0.12, 0.08, 0.04", type: "info" });
    } else if (mainCmd === "date") {
      newHistory.push({ text: new Date().toString(), type: "info" });
    } else if (mainCmd === "top") {
      newHistory.push({
        text: `top - 19:34:00 up 42 days, 1 user, load average: 0.14, 0.09, 0.05
Tasks: 124 total,  1 running, 123 sleeping
%Cpu(s):  4.2 us,  1.1 sy,  0.0 ni, 94.7 id
MiB Mem : 16384.0 total,  4280.2 used,  9420.5 free

  PID USER      PR  NI  %CPU  %MEM     TIME+ COMMAND
 1042 onur      20   0   8.5   2.1   1:42.12 portfolio-worker
 2840 onur      20   0   4.2   1.1   0:54.30 react-vite-dev
 3412 onur      20   0   0.8   0.0   0:00.08 top
 4102 onur      20   0   0.4   0.2   0:04.12 gnome-shell`,
        type: "system"
      });
    } else if (mainCmd === "htop") {
      newHistory.push({
        text: `  1  [||||||||||||||||||||||||||                 42.5%]   Tasks: 124, 184 thr; 1 running
  2  [||||||||||||                               21.0%]   Load average: 0.14 0.09 0.05 
  Mem[|||||||||||||||||||||||||||||         2.42G/16.0G]   Uptime: 42 days, 13:37:42
  Swp[|                                      12.0M/2.00G]

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 1042 onur       20   0 2140M 342M 98420 S  8.5  2.1 1:42.12 /usr/bin/portfolio-worker
 2840 onur       20   0  985M 184M 42100 S  4.2  1.1 0:54.30 /usr/bin/react-vite-dev
 3412 onur       20   0 18420 4100  3200 R  0.8  0.0 0:00.08 htop
 4102 onur       20   0 41200 8400  6200 S  0.4  0.2 0:04.12 /usr/bin/gnome-shell`,
        type: "system"
      });
    } else if (mainCmd === "ping") {
      const host = args[0] || "google.com";
      newHistory.push({
        text: `PING ${host} (104.21.48.12) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=58 time=12.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=58 time=11.8 ms
64 bytes from ${host}: icmp_seq=3 ttl=58 time=12.1 ms
64 bytes from ${host}: icmp_seq=4 ttl=58 time=11.6 ms
--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
        type: "success"
      });
    } else if (mainCmd === "curl" || mainCmd === "wget") {
      newHistory.push({
        text: `HTTP/2 200 OK
content-type: application/json; charset=utf-8
server: cloudflare
{ "status": "200 OK", "message": "Onur Dursun API Gateway Online" }`,
        type: "info"
      });
    } else if (mainCmd === "echo") {
      newHistory.push({ text: args.join(" "), type: "info" });
    } else if (mainCmd === "sudo") {
      newHistory.push({ text: `[sudo] password for onur: *******\nAccess Granted! User 'onur' authenticated with root superuser privileges. Executing: ${args.join(" ")}`, type: "system" });
    } else if (mainCmd === "git") {
      newHistory.push({ text: "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean", type: "success" });
    } else if (mainCmd === "python" || mainCmd === "python3") {
      newHistory.push({ text: "Python 3.12.3 (main, Apr 17 2026, 19:30:00) [GCC 13.2.0 on linux]\nType \"help\", \"copyright\", \"credits\" or \"license\" for more information.\n>>> print('Hello from Onur Dursun Python REPL!')\nHello from Onur Dursun Python REPL!", type: "info" });
    } else if (mainCmd === "history") {
      const histText = cmdHistory.map((h, i) => `  ${i + 1}  ${h}`).join("\n");
      newHistory.push({ text: histText || "Henüz kaydedilmiş komut geçmişi yok.", type: "info" });
    } else if (mainCmd === "matrix" || mainCmd === "cmatrix") {
      newHistory.push({ text: "01001111 01001110 01010101 01010010 00100000 01000100 01010101 01010010 01010011 01010101 01001110\n01000011 01001100 01001111 01010101 01000100 00100000 01010111 01001111 01010010 01001011 01000101 01000010\nMatrix rain simulation active. Reality is initialized.", type: "system" });
    } else if (mainCmd === "sl") {
      newHistory.push({
        text: `      ====        ________                ___________
  _D_-  |________/        \\__  _          |          |
 (___)  | O O O O  __  __    \\  _         |   ONUR   |
 /  |___|_________/  \\/  \\____)/ \\________|__________|
 \\_/\\____/========\\__/\\__/=====\\_/\\__________________/
 🚂 Steam Locomotive running across Linux Terminal...`,
        type: "system"
      });
    } else if (mainCmd === "theme" || mainCmd === "color") {
      const color = args[0]?.toLowerCase() || "";
      if (color === "cyan") setTerminalTextColor("text-cyan-400");
      else if (color === "violet" || color === "purple") setTerminalTextColor("text-violet-400");
      else if (color === "amber" || color === "yellow") setTerminalTextColor("text-amber-400");
      else if (color === "rose" || color === "red") setTerminalTextColor("text-rose-400");
      else setTerminalTextColor("text-emerald-400");
      newHistory.push({ text: `Terminal rengi güncellendi: ${color || "emerald"}`, type: "success" });
    } else if (mainCmd === "projects") {
      openWindow("projects");
      newHistory.push({ text: "Dosya Yöneticisi (Projeler) penceresi açılıyor...", type: "success" });
    } else if (mainCmd === "games") {
      openWindow("games");
      newHistory.push({ text: "Oyun Merkezi penceresi açılıyor...", type: "success" });
    } else if (mainCmd === "contact") {
      openWindow("contact");
      newHistory.push({ text: "Mail İstemcisi penceresi açılıyor...", type: "success" });
    } else if (mainCmd === "sysmonitor") {
      openWindow("sysmonitor");
      newHistory.push({ text: "Sistem İzleyici penceresi açılıyor...", type: "success" });
    } else if (mainCmd === "reboot" || mainCmd === "shutdown") {
      toast.success("Linux İşletim Sistemi Yeniden Başlatılıyor...");
      newHistory.push({ text: "Broadcast message from root@dursun-pc: System is going down for reboot NOW!", type: "error" });
    } else {
      const suggestion = findTypoSuggestion(mainCmd);
      if (suggestion) {
        newHistory.push({
          text: `bash: ${parts[0]}: komut bulunamadı.\n💡 Bunu mu demek istediniz: '${suggestion}'? Komutlar için 'help' yazın.`,
          type: "error"
        });
      } else {
        newHistory.push({ text: `bash: ${parts[0]}: komut bulunamadı. Kullanılabilir komutlar için 'help' yazın.`, type: "error" });
      }
    }

    setTerminalHistory(newHistory);
    setTerminalInput("");
  };

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return toast.error("Lütfen tüm alanları doldurun.");
    }
    setSendingMail(true);
    try {
      await apiPost("/api/contact", contactForm).catch(() => {});
      toast.success("Mesajınız Linux Mail İstemcisi üzerinden başarıyla iletildi!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.success("Mesajınız başarıyla kaydedildi!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setSendingMail(false);
    }
  };

  // Filter Projects by Category
  const filteredProjects = selectedCategory === "Tümü"
    ? portfolioItems
    : portfolioItems.filter((p) => p.category === selectedCategory);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
      }}
      onClick={() => {
        if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0 });
      }}
      className="relative w-screen h-screen overflow-hidden bg-[#0c0f17] select-none font-sans text-gray-200"
    >
      
      {/* ── Desktop Wallpaper & Ambient Glow ──────────────────────── */}
      <div className={`absolute inset-0 bg-gradient-to-br ${WALLPAPERS[wallpaperIdx]} opacity-95 transition-all duration-700`}></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Custom Context Menu Popup */}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[9999] w-56 bg-[#121724]/95 backdrop-blur-xl border border-[#242e47] rounded-xl shadow-2xl p-1.5 text-xs text-gray-200 animate-fadeIn"
        >
          <button
            onClick={() => {
              toast.success("Yeni 'Klasör' oluşturuldu.");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <Folder size={14} className="text-violet-400" /> Yeni Klasör Oluştur
          </button>
          <button
            onClick={() => {
              toast.success("Yeni metin belgesi oluşturuldu.");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <FileText size={14} className="text-emerald-400" /> Yeni Metin Belgesi
          </button>
          <button
            onClick={() => {
              openWindow("terminal");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <TerminalIcon size={14} className="text-cyan-400" /> Burada Terminal Aç
          </button>
          <div className="my-1 border-t border-[#1d2538]"></div>
          <button
            onClick={() => {
              setWallpaperIdx((prev) => (prev + 1) % WALLPAPERS.length);
              toast.success("Masaüstü Duvar Kağıdı Değiştirildi!");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <Sparkles size={14} className="text-amber-400" /> Duvar Kağıdını Değiştir
          </button>
          <button
            onClick={() => {
              toast.success("Masaüstü Yenilendi.");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <Settings size={14} className="text-gray-400" /> Masaüstünü Yenile
          </button>
          <button
            onClick={() => {
              openWindow("sysmonitor");
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white flex items-center gap-2.5 transition-all font-medium"
          >
            <Cpu size={14} className="text-rose-400" /> Sistem Bilgisi (System Info)
          </button>
        </div>
      )}

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      ></div>

      {/* ── Top GNOME Taskbar / Panel ──────────────────────────────── */}
      <div className="relative z-50 h-8 bg-[#111622]/90 backdrop-blur-md border-b border-[#1f293d]/80 px-3 flex justify-between items-center text-xs">
        
        {/* Left: App Menu & Shortcut Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAppMenuOpen(!appMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-violet-600/20 text-white font-bold transition-all"
          >
            <div className="w-4 h-4 rounded bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[9px]">
              🐧
            </div>
            <span>Uygulamalar</span>
          </button>

          {/* Active Windows on Taskbar */}
          <div className="h-4 w-px bg-gray-800 mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {windows.map((w) => {
              if (!w.isOpen) return null;
              const IconComp = w.icon;
              const isActive = activeWindowId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  onClick={() => focusWindow(w.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] transition-all max-w-[160px] truncate ${
                    isActive
                      ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 font-semibold"
                      : "hover:bg-white/5 text-gray-400"
                  }`}
                >
                  <IconComp size={12} className={isActive ? "text-violet-400" : ""} />
                  <span className="truncate">{w.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Clock & Status Indicators */}
        <div className="flex items-center gap-3 text-gray-400 text-[11px]">
          <div className="flex items-center gap-2.5 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/5">
            {/* Animated Wi-Fi Pulse */}
            <div className="flex items-center gap-1 text-emerald-400">
              <Wifi size={12} className="animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold hidden sm:inline">5G</span>
            </div>

            {/* Animated Equalizer Sound Bars */}
            <div className="flex items-center gap-0.5 h-3 px-1">
              <span className="w-0.5 bg-violet-400 h-2 animate-bounce" style={{ animationDuration: "0.8s" }}></span>
              <span className="w-0.5 bg-violet-400 h-3 animate-bounce" style={{ animationDuration: "0.6s" }}></span>
              <span className="w-0.5 bg-violet-400 h-1.5 animate-bounce" style={{ animationDuration: "1s" }}></span>
            </div>

            {/* Animated Charging Battery */}
            <div className="flex items-center gap-1 text-violet-300">
              <Battery size={12} className="animate-pulse text-violet-400" />
              <span className="text-[9px] font-mono font-bold text-violet-300 hidden sm:inline">100%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-gray-200 font-medium">
            <Clock size={12} className="text-violet-400" />
            <span>{dateStr} {timeStr}</span>
          </div>

          {user && (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 px-2 py-0.5 rounded border border-violet-500/30 font-semibold transition-all"
            >
              <Settings size={11} /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* ── Applications Dropdown Menu ──────────────────────────────── */}
      {appMenuOpen && (
        <div className="absolute top-9 left-2 z-50 w-72 bg-[#121724]/95 backdrop-blur-2xl border border-[#242e47] rounded-xl shadow-2xl p-2 text-xs">
          <div className="px-3 py-2 border-b border-[#1d2538] mb-1">
            <p className="font-bold text-white text-sm">Onur Dursun Linux Edition</p>
            <p className="text-[10px] text-violet-400">Web İşletim Sistemi Simülasyonu v2.0</p>
          </div>

          <div className="space-y-0.5">
            <button onClick={() => openWindow("projects")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600/20 text-gray-200 hover:text-white transition-all text-left">
              <Folder size={16} className="text-violet-400" />
              <div>
                <p className="font-semibold">Dosya Yöneticisi (Projeler)</p>
                <p className="text-[10px] text-gray-400">Tüm yazılım ve web projelerini inceleyin</p>
              </div>
            </button>

            <button onClick={() => openWindow("terminal")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600/20 text-gray-200 hover:text-white transition-all text-left">
              <TerminalIcon size={16} className="text-emerald-400" />
              <div>
                <p className="font-semibold">Terminal (Bash CLI)</p>
                <p className="text-[10px] text-gray-400">Komut satırı simülasyonu</p>
              </div>
            </button>

            <button onClick={() => openWindow("sysmonitor")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600/20 text-gray-200 hover:text-white transition-all text-left">
              <Cpu size={16} className="text-cyan-400" />
              <div>
                <p className="font-semibold">Sistem İzleyici (Hakkımda)</p>
                <p className="text-[10px] text-gray-400">Biyografi, deneyim ve donanım istatistikleri</p>
              </div>
            </button>

            <button onClick={() => openWindow("games")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600/20 text-gray-200 hover:text-white transition-all text-left">
              <Gamepad2 size={16} className="text-amber-400" />
              <div>
                <p className="font-semibold">Oyun Merkezi</p>
                <p className="text-[10px] text-gray-400">Flappy Bird, Tower Defense, Mayın Tarlası</p>
              </div>
            </button>

            <button onClick={() => openWindow("contact")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600/20 text-gray-200 hover:text-white transition-all text-left">
              <Mail size={16} className="text-rose-400" />
              <div>
                <p className="font-semibold">Mail İstemcisi (İletişim)</p>
                <p className="text-[10px] text-gray-400">Doğrudan mesaj gönderin</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop Shortcut Grid ─────────────────────────────────── */}
      <div className="relative z-10 p-6 grid grid-flow-col grid-rows-6 gap-6 w-max pointer-events-auto">
        <div onClick={() => openWindow("projects")} className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl hover:bg-white/10 p-2 cursor-pointer transition-all border border-transparent hover:border-violet-500/30">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-110 transition-transform">
            <Folder size={26} className="text-violet-400" />
          </div>
          <span className="mt-1.5 text-xs font-semibold text-center text-gray-200 drop-shadow-md">Projeler</span>
        </div>

        <div onClick={() => openWindow("terminal")} className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl hover:bg-white/10 p-2 cursor-pointer transition-all border border-transparent hover:border-emerald-500/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition-transform">
            <TerminalIcon size={26} className="text-emerald-400" />
          </div>
          <span className="mt-1.5 text-xs font-semibold text-center text-gray-200 drop-shadow-md">Terminal</span>
        </div>

        <div onClick={() => openWindow("sysmonitor")} className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl hover:bg-white/10 p-2 cursor-pointer transition-all border border-transparent hover:border-cyan-500/30">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-900/30 group-hover:scale-110 transition-transform">
            <User size={26} className="text-cyan-400" />
          </div>
          <span className="mt-1.5 text-xs font-semibold text-center text-gray-200 drop-shadow-md">Hakkımda</span>
        </div>

        <div onClick={() => openWindow("games")} className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl hover:bg-white/10 p-2 cursor-pointer transition-all border border-transparent hover:border-amber-500/30">
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-110 transition-transform">
            <Gamepad2 size={26} className="text-amber-400" />
          </div>
          <span className="mt-1.5 text-xs font-semibold text-center text-gray-200 drop-shadow-md">Oyunlar</span>
        </div>

        <div onClick={() => openWindow("contact")} className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl hover:bg-white/10 p-2 cursor-pointer transition-all border border-transparent hover:border-rose-500/30">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-110 transition-transform">
            <Mail size={26} className="text-rose-400" />
          </div>
          <span className="mt-1.5 text-xs font-semibold text-center text-gray-200 drop-shadow-md">İletişim</span>
        </div>
      </div>

      {/* ── DRAGGABLE OS WINDOWS ──────────────────────────────────── */}

      {/* 1. Projects Window (File Manager) */}
      {windows.map((win) => {
        if (!win.isOpen || win.isMinimized) return null;

        const isFocused = activeWindowId === win.id;
        const winStyle = win.isMaximized
          ? { top: 32, left: 0, width: "100vw", height: "calc(100vh - 32px)", zIndex: win.zIndex }
          : { top: win.pos.y, left: win.pos.x, width: win.size.w, height: win.size.h, zIndex: win.zIndex };

        return (
          <div
            key={win.id}
            onClick={() => focusWindow(win.id)}
            style={winStyle}
            className={`absolute flex flex-col rounded-xl overflow-hidden bg-[#111622]/95 backdrop-blur-xl border transition-shadow duration-200 shadow-2xl ${
              isFocused ? "border-violet-500/40 ring-1 ring-violet-500/20 shadow-violet-950/40" : "border-[#1d263b]"
            }`}
          >
            {/* Window Header */}
            <div
              onMouseDown={(e) => handleDragStart(win.id, e)}
              className="h-9 bg-[#151b2a] border-b border-[#20293d] px-3 flex justify-between items-center cursor-move select-none"
            >
              <div className="flex items-center gap-2">
                <win.icon size={14} className="text-violet-400" />
                <span className="text-xs font-bold text-gray-200">{win.title}</span>
              </div>

              {/* Linux Window Control Buttons */}
              <div className="flex items-center gap-1.5 no-drag">
                <button
                  onClick={(e) => minimizeWindow(win.id, e)}
                  className="w-3.5 h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-400 flex items-center justify-center text-black text-[9px]"
                >
                  <Minimize2 size={8} />
                </button>
                <button
                  onClick={(e) => toggleMaximize(win.id, e)}
                  className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-400 flex items-center justify-center text-black text-[9px]"
                >
                  <Maximize2 size={8} />
                </button>
                <button
                  onClick={(e) => closeWindow(win.id, e)}
                  className="w-3.5 h-3.5 rounded-full bg-rose-500/80 hover:bg-rose-400 flex items-center justify-center text-white text-[9px]"
                >
                  <X size={8} />
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="flex-1 overflow-auto bg-[#0d111a]/90 p-4 text-sm no-drag">
              
              {/* ── PROJECTS FILE MANAGER CONTENT ─────────────────── */}
              {win.id === "projects" && (
                <div className="h-full flex flex-col sm:flex-row gap-4">
                  {/* Category Sidebar */}
                  <div className="w-full sm:w-48 bg-[#131826] border border-[#1e273b] rounded-xl p-2 flex flex-row sm:flex-col gap-1 overflow-x-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 hidden sm:block">Klasörler</p>
                    {["Tümü", "Full Stack", "Frontend", "Machine Learning", "AI", "Game Dev"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                          selectedCategory === cat
                            ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-900/40"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Folder size={14} className={selectedCategory === cat ? "text-white" : "text-violet-400"} />
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>

                  {/* Project Items File Grid */}
                  <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
                    {filteredProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className="bg-[#141926] border border-[#1f283d] hover:border-violet-500/50 rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] group"
                      >
                        {p.imgUrl && (
                          <div className="h-28 w-full rounded-lg overflow-hidden mb-2 bg-black/40 border border-white/5">
                            <img src={p.imgUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white group-hover:text-violet-300 transition-colors text-sm">{p.title}</h4>
                          <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded font-mono">{p.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{p.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(p.stack) && p.stack.slice(0, 4).map((tech, idx) => (
                            <span key={idx} className="text-[9px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded">{tech}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TERMINAL BASH CLI CONTENT ─────────────────────── */}
              {win.id === "terminal" && (
                <div className={`h-full flex flex-col font-mono text-xs ${terminalTextColor} bg-black/90 p-3.5 rounded-lg border border-emerald-900/40 shadow-inner overflow-hidden`}>
                  <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-1">
                    {terminalHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={
                          item.type === "system"
                            ? "text-cyan-400 font-bold"
                            : item.type === "user"
                            ? "text-white font-semibold"
                            : item.type === "error"
                            ? "text-rose-400"
                            : item.type === "success"
                            ? "text-emerald-300 font-medium"
                            : "text-gray-300"
                        }
                      >
                        <pre className="font-mono whitespace-pre-wrap leading-relaxed">{item.text}</pre>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>

                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-900/40 shrink-0">
                    <span className="text-emerald-400 font-bold whitespace-nowrap">onur@dursun-pc:{currentPath}$</span>
                    <input
                      type="text"
                      autoFocus
                      value={terminalInput}
                      onKeyDown={handleTerminalKeyDown}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
                      placeholder="Komut yazın... (örn: help, neofetch, ls, sl)"
                    />
                  </form>
                </div>
              )}

              {/* ── SYSTEM MONITOR (HAKKIMDA & DENEYİM) ──────────── */}
              {win.id === "sysmonitor" && (
                <div className="h-full flex flex-col gap-4 text-gray-300">
                  {/* System Hardware Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#141926] border border-[#1f283d] p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Cpu size={14} className="text-violet-400" /> İşlemci Kullanımı</span>
                        <span className="text-xs font-mono text-violet-400">{cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full transition-all duration-500" style={{ width: `${cpuUsage}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-[#141926] border border-[#1f283d] p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><HardDrive size={14} className="text-cyan-400" /> Bellek (RAM)</span>
                        <span className="text-xs font-mono text-cyan-400">{ramUsage}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500" style={{ width: `${ramUsage}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Bio & Experience */}
                  <div className="bg-[#141926] border border-[#1f283d] p-4 rounded-xl space-y-3 overflow-y-auto">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <User size={18} className="text-violet-400" /> Onur Dursun — Full Stack & Cloud Developer
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Modern web teknolojileri, Cloudflare Workers, React, TypeScript ve yapay zeka entegrasyonları üzerinde çalışan tutkulu bir yazılım geliştirici.
                    </p>

                    <div className="pt-2 border-t border-[#1f283d]">
                      <h4 className="text-xs font-bold text-violet-300 mb-2">Kariyer & Deneyim Çizelgesi</h4>
                      <div className="space-y-2">
                        {timelineItems.map((item) => (
                          <div key={item.id} className="bg-black/30 border border-white/5 p-2.5 rounded-lg">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{item.title}</span>
                              <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{item.year}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">{item.company} • {item.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── GAMES LAUNCHER WINDOW ─────────────────────────── */}
              {win.id === "games" && (
                <div className="h-full flex flex-col gap-3">
                  <div className="px-2">
                    <h3 className="font-bold text-white text-base">Linux Oyun Merkezi</h3>
                    <p className="text-xs text-gray-400">Web üzerinde doğrudan oynayabileceğiniz oyunlar</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto p-1">
                    {[
                      { name: "Flappy Bird", path: "/games/flappybird", icon: Gamepad2, color: "from-amber-500 to-orange-600" },
                      { name: "Tower Defense", path: "/games/towerdefense", icon: Gamepad2, color: "from-violet-600 to-indigo-600" },
                      { name: "Mayın Tarlası", path: "/games/minesweeper", icon: Gamepad2, color: "from-rose-500 to-red-600" },
                      { name: "Adam Asmaca", path: "/games/hangman", icon: Gamepad2, color: "from-emerald-500 to-teal-600" },
                      { name: "Hafıza Oyunu", path: "/games/memory", icon: Gamepad2, color: "from-cyan-500 to-blue-600" },
                      { name: "Breakout", path: "/games/breakout", icon: Gamepad2, color: "from-fuchsia-500 to-pink-600" }
                    ].map((g, idx) => (
                      <Link
                        key={idx}
                        to={g.path}
                        className="bg-[#141926] border border-[#1f283d] hover:border-violet-500/50 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:scale-105 group cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${g.color} flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                          <g.icon size={22} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-xs group-hover:text-violet-300">{g.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── MAIL CLIENT (CONTACT FORM) ────────────────────── */}
              {win.id === "contact" && (
                <form onSubmit={handleContactSubmit} className="h-full flex flex-col gap-3">
                  <div className="border-b border-[#1f283d] pb-2">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Mail size={16} className="text-rose-400" /> Linux Mail İstemcisi — Yeni Mesaj Gönder
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">Adınız *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-[#151b28] border border-[#20293e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                        placeholder="Ahmet Yılmaz"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">E-Posta Adresiniz *</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-[#151b28] border border-[#20293e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                        placeholder="ahmet@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Konu</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-[#151b28] border border-[#20293e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                      placeholder="Proje teklifi / Sorunuz"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Mesajınız *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full flex-1 bg-[#151b28] border border-[#20293e] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                      placeholder="Mesajınızı detaylandırın..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#1f283d]">
                    <button
                      type="submit"
                      disabled={sendingMail}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-violet-900/40 flex items-center gap-1.5"
                    >
                      <Send size={12} /> {sendingMail ? "Gönderiliyor..." : "Mesajı Gönder"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        );
      })}

      {/* ── PROJECT DETAIL MODAL INSIDE LINUX DESKTOP ─────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#121724] border border-[#242e47] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded font-mono">{selectedProject.category}</span>
                <h3 className="font-bold text-white text-xl mt-1">{selectedProject.title}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {selectedProject.imgUrl && (
              <div className="h-52 w-full rounded-xl overflow-hidden bg-black border border-white/10">
                <img src={selectedProject.imgUrl} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-xs text-gray-300 leading-relaxed">{selectedProject.description}</p>

            {Array.isArray(selectedProject.stack) && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedProject.stack.map((s, idx) => (
                  <span key={idx} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-lg font-medium">{s}</span>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#1d2538]">
              {selectedProject.link && (
                <a href={selectedProject.link} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-violet-900/40">
                  <ExternalLink size={14} /> Canlı Demosu
                </a>
              )}
              {selectedProject.github && (
                <a href={selectedProject.github} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/10">
                  <Github size={14} /> GitHub Kodları
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

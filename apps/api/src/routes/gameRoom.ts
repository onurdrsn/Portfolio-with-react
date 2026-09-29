import { Hono } from "hono";
import type { Env } from "../middleware/auth";

export const gameRoomRouter = new Hono<{ Bindings: Env }>();

interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  hp: number;
  score: number;
  shield: boolean;
  lastSeen: number;
}

interface Room {
  code: string;
  p1: PlayerState;
  p2: PlayerState | null;
  status: "waiting" | "playing" | "finished";
  bullets: Array<{ id: string; owner: "p1" | "p2"; x: number; y: number; vx: number; vy: number }>;
  powerups: Array<{ id: string; type: string; x: number; y: number }>;
  winner: "p1" | "p2" | null;
  updatedAt: number;
}

// In-memory active room storage for Cloudflare Workers
const rooms = new Map<string, Room>();

// Helper: Clean up expired rooms older than 15 minutes
const cleanupRooms = () => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.updatedAt > 15 * 60 * 1000) {
      rooms.delete(code);
    }
  }
};

// Generate 4-character uppercase alphanumeric room code
const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateCode() : code;
};

// ─── 1. Create Room ────────────────────────────────────────────────────────
gameRoomRouter.post("/create-room", async (c) => {
  cleanupRooms();
  const { name } = await c.req.json<{ name?: string }>();
  const code = generateCode();
  const playerId = `p1-${Date.now()}`;

  const room: Room = {
    code,
    p1: {
      id: playerId,
      name: name || "Oyuncu 1",
      x: 100,
      y: 300,
      angle: 0,
      hp: 100,
      score: 0,
      shield: false,
      lastSeen: Date.now(),
    },
    p2: null,
    status: "waiting",
    bullets: [],
    powerups: [],
    winner: null,
    updatedAt: Date.now(),
  };

  rooms.set(code, room);
  return c.json({ ok: true, code, role: "p1", playerId, room });
});

// ─── 2. Join Room ──────────────────────────────────────────────────────────
gameRoomRouter.post("/join-room", async (c) => {
  cleanupRooms();
  const { code, name } = await c.req.json<{ code?: string; name?: string }>();
  const upperCode = (code || "").toUpperCase().trim();
  const room = rooms.get(upperCode);

  if (!room) {
    return c.json({ error: "Oda bulunamadı veya süresi doldu." }, 404);
  }

  if (room.p2 && room.p2.id) {
    return c.json({ error: "Bu oda zaten dolu." }, 400);
  }

  const playerId = `p2-${Date.now()}`;
  room.p2 = {
    id: playerId,
    name: name || "Oyuncu 2",
    x: 700,
    y: 300,
    angle: Math.PI,
    hp: 100,
    score: 0,
    shield: false,
    lastSeen: Date.now(),
  };
  room.status = "playing";
  room.updatedAt = Date.now();

  return c.json({ ok: true, code: upperCode, role: "p2", playerId, room });
});

// ─── 3. Quick Match (Rastgele Eşleşme) ───────────────────────────────────────
gameRoomRouter.post("/quick-match", async (c) => {
  cleanupRooms();
  const { name } = await c.req.json<{ name?: string }>();
  const playerName = name || "Oyuncu";

  // Find an open room waiting for P2
  for (const [code, room] of rooms.entries()) {
    if (room.status === "waiting" && !room.p2) {
      const playerId = `p2-${Date.now()}`;
      room.p2 = {
        id: playerId,
        name: playerName,
        x: 700,
        y: 300,
        angle: Math.PI,
        hp: 100,
        score: 0,
        shield: false,
        lastSeen: Date.now(),
      };
      room.status = "playing";
      room.updatedAt = Date.now();
      return c.json({ ok: true, code, role: "p2", playerId, room });
    }
  }

  // If no room found, create one automatically
  const code = generateCode();
  const playerId = `p1-${Date.now()}`;
  const room: Room = {
    code,
    p1: {
      id: playerId,
      name: playerName,
      x: 100,
      y: 300,
      angle: 0,
      hp: 100,
      score: 0,
      shield: false,
      lastSeen: Date.now(),
    },
    p2: null,
    status: "waiting",
    bullets: [],
    powerups: [],
    winner: null,
    updatedAt: Date.now(),
  };

  rooms.set(code, room);
  return c.json({ ok: true, code, role: "p1", playerId, room });
});

// ─── 4. Sync State (Realtime Position & Action Updates) ──────────────────────
gameRoomRouter.post("/sync-state", async (c) => {
  const { code, role, x, y, angle, hp, score, shield, newBullets } = await c.req.json<{
    code: string;
    role: "p1" | "p2";
    x: number;
    y: number;
    angle: number;
    hp: number;
    score: number;
    shield: boolean;
    newBullets?: Array<{ id: string; x: number; y: number; vx: number; vy: number }>;
  }>();

  const room = rooms.get((code || "").toUpperCase());
  if (!room) {
    return c.json({ error: "Oda bulunamadı." }, 404);
  }

  const now = Date.now();
  room.updatedAt = now;

  // Update sending player's state
  const player = role === "p1" ? room.p1 : room.p2;
  if (player) {
    player.x = x;
    player.y = y;
    player.angle = angle;
    player.hp = hp;
    player.score = score;
    player.shield = shield;
    player.lastSeen = now;
  }

  // Add new bullets if fired
  if (Array.isArray(newBullets) && newBullets.length > 0) {
    for (const b of newBullets) {
      room.bullets.push({
        id: b.id || `b-${now}-${Math.random()}`,
        owner: role,
        x: b.x,
        y: b.y,
        vx: b.vx,
        vy: b.vy,
      });
    }
  }

  // Keep bullet list manageable
  if (room.bullets.length > 30) {
    room.bullets = room.bullets.slice(-20);
  }

  // Determine game over / winner status
  if (room.p1 && room.p1.hp <= 0) {
    room.status = "finished";
    room.winner = "p2";
  } else if (room.p2 && room.p2.hp <= 0) {
    room.status = "finished";
    room.winner = "p1";
  }

  const opponent = role === "p1" ? room.p2 : room.p1;
  return c.json({
    ok: true,
    status: room.status,
    winner: room.winner,
    opponent,
    bullets: room.bullets,
    powerups: room.powerups,
  });
});

// ─── 5. Room Status Check ──────────────────────────────────────────────────
gameRoomRouter.get("/room-status", async (c) => {
  const code = c.req.query("code")?.toUpperCase() || "";
  const room = rooms.get(code);
  if (!room) {
    return c.json({ error: "Oda bulunamadı." }, 404);
  }
  return c.json({ ok: true, room });
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { getRandomObject } = require("./words");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// In-memory rooms store
const rooms = new Map();

const ROUND_DURATION = 180; // 3 minutes in seconds

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

io.on("connection", (socket) => {
  let currentRoom = null;
  let playerName = null;

  socket.on("create-room", (name) => {
    playerName = name.trim().slice(0, 20) || "Player";
    const roomCode = generateRoomCode();

    const room = {
      code: roomCode,
      host: socket.id,
      players: new Map(),
      state: "waiting", // waiting | playing | results
      object: null,
      startTime: null,
    };

    room.players.set(socket.id, {
      name: playerName,
      ideas: [],
      score: 0,
      ready: false,
    });

    rooms.set(roomCode, room);
    socket.join(roomCode);
    currentRoom = roomCode;

    socket.emit("room-created", { roomCode, playerName });
    broadcastRoomState(roomCode);
  });

  socket.on("join-room", ({ name, roomCode }) => {
    playerName = name.trim().slice(0, 20) || "Player";
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      socket.emit("error-msg", "Room not found. Check the code and try again.");
      return;
    }

    if (room.state !== "waiting") {
      socket.emit("error-msg", "Game already in progress. Wait for the next round.");
      return;
    }

    if (room.players.size >= 8) {
      socket.emit("error-msg", "Room is full (max 8 players).");
      return;
    }

    room.players.set(socket.id, {
      name: playerName,
      ideas: [],
      score: 0,
      ready: false,
    });

    socket.join(code);
    currentRoom = code;

    socket.emit("room-joined", { roomCode: code, playerName });
    broadcastRoomState(code);
  });

  socket.on("start-game", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.host !== socket.id || room.state !== "waiting") return;

    room.object = getRandomObject();
    room.state = "playing";
    room.startTime = Date.now();

    // Reset all player data
    for (const [, player] of room.players) {
      player.ideas = [];
      player.score = 0;
    }

    io.to(currentRoom).emit("game-started", {
      object: room.object,
      duration: ROUND_DURATION,
    });

    // Auto-end game after duration
    setTimeout(() => {
      endGame(currentRoom);
    }, ROUND_DURATION * 1000);
  });

  socket.on("submit-idea", (idea) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.state !== "playing") return;

    const player = room.players.get(socket.id);
    if (!player) return;

    const trimmed = idea.trim();
    if (trimmed.length === 0 || trimmed.length > 200) return;

    player.ideas.push(trimmed);
    player.score = player.ideas.length;

    // Send back confirmation to the player
    socket.emit("idea-accepted", { idea: trimmed, count: player.score });

    // Broadcast updated scores to everyone
    broadcastScores(currentRoom);
  });

  socket.on("play-again", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.host !== socket.id) return;

    room.state = "waiting";
    room.object = null;
    room.startTime = null;

    for (const [, player] of room.players) {
      player.ideas = [];
      player.score = 0;
      player.ready = false;
    }

    io.to(currentRoom).emit("back-to-lobby");
    broadcastRoomState(currentRoom);
  });

  socket.on("disconnect", () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    room.players.delete(socket.id);

    if (room.players.size === 0) {
      rooms.delete(currentRoom);
      return;
    }

    // If host left, assign new host
    if (room.host === socket.id) {
      room.host = room.players.keys().next().value;
      const newHost = room.players.get(room.host);
      io.to(currentRoom).emit("new-host", { name: newHost.name, hostId: room.host });
    }

    broadcastRoomState(currentRoom);
    if (room.state === "playing") {
      broadcastScores(currentRoom);
    }
  });
});

function endGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.state !== "playing") return;

  room.state = "results";

  const results = [];
  for (const [id, player] of room.players) {
    results.push({
      name: player.name,
      ideas: player.ideas,
      score: player.score,
      isHost: id === room.host,
    });
  }

  results.sort((a, b) => b.score - a.score);

  io.to(roomCode).emit("game-ended", { object: room.object, results });
}

function broadcastRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const players = [];
  for (const [id, player] of room.players) {
    players.push({ name: player.name, isHost: id === room.host });
  }

  io.to(roomCode).emit("room-update", {
    roomCode: room.code,
    players,
    state: room.state,
  });
}

function broadcastScores(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const scores = [];
  for (const [, player] of room.players) {
    scores.push({ name: player.name, score: player.score });
  }

  scores.sort((a, b) => b.score - a.score);
  io.to(roomCode).emit("scores-update", scores);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Ideation Sprint running on http://localhost:${PORT}`);
});

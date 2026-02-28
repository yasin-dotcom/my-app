// --- DOM Elements ---
const screens = {
  home: document.getElementById("screen-home"),
  lobby: document.getElementById("screen-lobby"),
  game: document.getElementById("screen-game"),
  analytics: document.getElementById("screen-analytics"),
  results: document.getElementById("screen-results"),
};

const els = {
  playerName: document.getElementById("player-name"),
  btnSolo: document.getElementById("btn-solo"),
  btnCreate: document.getElementById("btn-create"),
  roomCodeInput: document.getElementById("room-code-input"),
  btnJoin: document.getElementById("btn-join"),
  homeError: document.getElementById("home-error"),
  lobbyRoomCode: document.getElementById("lobby-room-code"),
  lobbyPlayers: document.getElementById("lobby-players"),
  btnStartGame: document.getElementById("btn-start-game"),
  lobbyWaiting: document.getElementById("lobby-waiting"),
  btnLeave: document.getElementById("btn-leave"),
  gameObject: document.getElementById("game-object"),
  timer: document.getElementById("timer"),
  timerFill: document.getElementById("timer-fill"),
  ideaInput: document.getElementById("idea-input"),
  btnSubmitIdea: document.getElementById("btn-submit-idea"),
  ideaCountNum: document.getElementById("idea-count-num"),
  ideasList: document.getElementById("ideas-list"),
  scoreboardColumn: document.getElementById("scoreboard-column"),
  liveScores: document.getElementById("live-scores"),
  resultsObject: document.getElementById("results-object"),
  resultsContent: document.getElementById("results-content"),
  btnPlayAgain: document.getElementById("btn-play-again"),
  btnHome: document.getElementById("btn-home"),
  btnAnalytics: document.getElementById("btn-analytics"),
  btnAnalyticsBack: document.getElementById("btn-analytics-back"),
  analyticsEmpty: document.getElementById("analytics-empty"),
  analyticsContent: document.getElementById("analytics-content"),
  statGames: document.getElementById("stat-games"),
  statAvg: document.getElementById("stat-avg"),
  statBest: document.getElementById("stat-best"),
  statTotal: document.getElementById("stat-total"),
  chartScores: document.getElementById("chart-scores"),
  analyticsTip: document.getElementById("analytics-tip"),
  btnMic: document.getElementById("btn-mic"),
  btnCopyCode: document.getElementById("btn-copy-code"),
};

// --- State ---
let socket = null;
let gameMode = null; // "solo" | "online"
let isHost = false;
let timerInterval = null;
let timeRemaining = 0;
let soloIdeas = [];

// --- Solo mode word list (subset — server has the full list) ---
const soloObjects = [
  "paperclip", "brick", "shoe", "umbrella", "rubber band",
  "tennis ball", "fork", "newspaper", "bucket", "rope",
  "mirror", "blanket", "ladder", "candle", "tire",
  "bottle cap", "clothespin", "sponge", "coat hanger", "pencil",
  "cardboard box", "tin can", "pillowcase", "wooden spoon", "marble",
  "ice cube tray", "binder clip", "coffee filter", "zip tie", "ping pong ball",
  "corkscrew", "mason jar", "pool noodle", "chopsticks", "safety pin",
  "toothbrush", "paper plate", "funnel", "key ring", "shoelace",
  "rolling pin", "tape measure", "flyswatter", "colander", "thimble",
  "magnifying glass", "whistle", "feather", "domino", "dice",
  "balloon", "straw", "button", "magnet", "spring",
];

// --- Screen Navigation ---
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function showError(msg) {
  els.homeError.textContent = msg;
  els.homeError.classList.remove("hidden");
  setTimeout(() => els.homeError.classList.add("hidden"), 4000);
}

// --- Timer ---
function startTimer(duration) {
  timeRemaining = duration;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      if (gameMode === "solo") {
        endSoloGame();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  els.timer.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

  const pct = (timeRemaining / 180) * 100;
  els.timerFill.style.width = pct + "%";

  els.timer.classList.remove("warning", "danger");
  els.timerFill.classList.remove("warning", "danger");

  if (timeRemaining <= 10) {
    els.timer.classList.add("danger");
    els.timerFill.classList.add("danger");
  } else if (timeRemaining <= 30) {
    els.timer.classList.add("warning");
    els.timerFill.classList.add("warning");
  }
}

// --- Solo Mode ---
function startSoloGame() {
  gameMode = "solo";
  soloIdeas = [];
  els.ideasList.innerHTML = "";
  els.ideaCountNum.textContent = "0";
  els.scoreboardColumn.classList.add("hidden");

  const object = soloObjects[Math.floor(Math.random() * soloObjects.length)];
  els.gameObject.textContent = object;

  showScreen("game");
  els.ideaInput.focus();
  startTimer(180);
}

function addSoloIdea(idea) {
  soloIdeas.push(idea);
  els.ideaCountNum.textContent = soloIdeas.length;

  const li = document.createElement("li");
  li.textContent = idea;
  els.ideasList.prepend(li);
}

function endSoloGame() {
  saveGameResult(els.gameObject.textContent, soloIdeas);
  els.resultsObject.textContent = els.gameObject.textContent;

  const card = document.createElement("div");
  card.className = "result-card winner";
  card.innerHTML = `
    <div class="result-header">
      <span class="result-rank">#1</span>
      <span class="result-name">${escapeHtml(els.playerName.value || "You")}</span>
      <span class="result-score">${soloIdeas.length} <small>ideas</small></span>
    </div>
    <div class="result-ideas">
      ${soloIdeas.map((i) => `<span class="result-idea-tag">${escapeHtml(i)}</span>`).join("")}
    </div>
  `;

  els.resultsContent.innerHTML = "";
  els.resultsContent.appendChild(card);

  els.btnPlayAgain.classList.remove("hidden");
  showScreen("results");
  showConfetti();
}

// --- Idea Submission ---
function submitIdea() {
  const idea = els.ideaInput.value.trim();
  if (!idea) return;

  if (gameMode === "solo") {
    addSoloIdea(idea);
  } else if (gameMode === "online" && socket) {
    socket.emit("submit-idea", idea);
  }

  els.ideaInput.value = "";
  els.ideaInput.focus();
}

// --- Online Mode ---
function connectSocket() {
  if (socket) return;
  socket = io();

  socket.on("error-msg", (msg) => {
    showError(msg);
  });

  socket.on("room-created", ({ roomCode, playerName }) => {
    isHost = true;
    els.lobbyRoomCode.textContent = roomCode;
    els.btnStartGame.classList.remove("hidden");
    els.lobbyWaiting.classList.add("hidden");
    showScreen("lobby");
  });

  socket.on("room-joined", ({ roomCode, playerName }) => {
    isHost = false;
    els.lobbyRoomCode.textContent = roomCode;
    els.btnStartGame.classList.add("hidden");
    els.lobbyWaiting.classList.remove("hidden");
    showScreen("lobby");
  });

  socket.on("room-update", ({ roomCode, players, state }) => {
    els.lobbyPlayers.innerHTML = players
      .map(
        (p) => `
        <div class="player-item">
          <span class="player-name">${escapeHtml(p.name)}</span>
          ${p.isHost ? '<span class="host-badge">Host</span>' : ""}
        </div>`
      )
      .join("");
  });

  socket.on("new-host", ({ name, hostId }) => {
    // Only the actual new host gets host controls
    isHost = socket.id === hostId;
    if (isHost) {
      els.btnStartGame.classList.remove("hidden");
      els.lobbyWaiting.classList.add("hidden");
    } else {
      els.btnStartGame.classList.add("hidden");
      els.lobbyWaiting.classList.remove("hidden");
    }
  });

  socket.on("game-started", ({ object, duration }) => {
    gameMode = "online";
    els.ideasList.innerHTML = "";
    els.ideaCountNum.textContent = "0";
    els.scoreboardColumn.classList.remove("hidden");
    els.liveScores.innerHTML = "";
    els.gameObject.textContent = object;

    showScreen("game");
    els.ideaInput.focus();
    startTimer(duration);
  });

  socket.on("idea-accepted", ({ idea, count }) => {
    els.ideaCountNum.textContent = count;

    const li = document.createElement("li");
    li.textContent = idea;
    els.ideasList.prepend(li);
  });

  socket.on("scores-update", (scores) => {
    els.liveScores.innerHTML = scores
      .map(
        (s) => `
        <div class="score-item">
          <span class="score-name">${escapeHtml(s.name)}</span>
          <span class="score-num">${s.score}</span>
        </div>`
      )
      .join("");
  });

  socket.on("game-ended", ({ object, results }) => {
    clearInterval(timerInterval);
    // Save analytics for current player
    const myName = els.playerName.value.trim();
    const myResult = results.find((r) => r.name === myName);
    if (myResult) saveGameResult(object, myResult.ideas);
    els.resultsObject.textContent = object;

    els.resultsContent.innerHTML = results
      .map(
        (r, i) => `
        <div class="result-card ${i === 0 ? "winner" : ""}">
          <div class="result-header">
            <span class="result-rank">#${i + 1}</span>
            <span class="result-name">${escapeHtml(r.name)}</span>
            <span class="result-score">${r.score} <small>ideas</small></span>
          </div>
          <div class="result-ideas">
            ${r.ideas.map((idea) => `<span class="result-idea-tag">${escapeHtml(idea)}</span>`).join("")}
          </div>
        </div>`
      )
      .join("");

    if (isHost) {
      els.btnPlayAgain.classList.remove("hidden");
    } else {
      els.btnPlayAgain.classList.add("hidden");
    }

    showScreen("results");
    showConfetti();
  });

  socket.on("back-to-lobby", () => {
    clearInterval(timerInterval);
    showScreen("lobby");
  });

  socket.on("disconnect", () => {
    socket = null;
    gameMode = null;
    showScreen("home");
  });
}

// --- Event Listeners ---

// Solo
els.btnSolo.addEventListener("click", () => {
  startSoloGame();
});

// Create room
els.btnCreate.addEventListener("click", () => {
  const name = els.playerName.value.trim();
  if (!name) {
    showError("Please enter your name first.");
    els.playerName.focus();
    return;
  }
  connectSocket();
  socket.emit("create-room", name);
});

// Join room
els.btnJoin.addEventListener("click", () => {
  const name = els.playerName.value.trim();
  const code = els.roomCodeInput.value.trim();
  if (!name) {
    showError("Please enter your name first.");
    els.playerName.focus();
    return;
  }
  if (!code) {
    showError("Please enter a room code.");
    els.roomCodeInput.focus();
    return;
  }
  connectSocket();
  socket.emit("join-room", { name, roomCode: code });
});

// Start game (host only)
els.btnStartGame.addEventListener("click", () => {
  if (socket) socket.emit("start-game");
});

// Leave room
els.btnLeave.addEventListener("click", () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  gameMode = null;
  isHost = false;
  showScreen("home");
});

// Submit idea
els.btnSubmitIdea.addEventListener("click", submitIdea);
els.ideaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitIdea();
  }
});

// Play again
els.btnPlayAgain.addEventListener("click", () => {
  if (gameMode === "solo") {
    startSoloGame();
  } else if (socket) {
    socket.emit("play-again");
  }
});

// Back to home
els.btnHome.addEventListener("click", () => {
  clearInterval(timerInterval);
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  gameMode = null;
  isHost = false;
  showScreen("home");
});

// Copy room code
els.btnCopyCode.addEventListener("click", () => {
  const code = els.lobbyRoomCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    els.btnCopyCode.classList.add("copied");
    setTimeout(() => els.btnCopyCode.classList.remove("copied"), 1500);
  });
});

// Room code input — auto-uppercase
els.roomCodeInput.addEventListener("input", () => {
  els.roomCodeInput.value = els.roomCodeInput.value.toUpperCase();
});

// --- Analytics (localStorage) ---
function saveGameResult(object, ideas) {
  const history = JSON.parse(localStorage.getItem("ideation-history") || "[]");
  history.push({
    date: new Date().toISOString(),
    object,
    count: ideas.length,
    ideas,
  });
  // Keep last 50 games
  if (history.length > 50) history.splice(0, history.length - 50);
  localStorage.setItem("ideation-history", JSON.stringify(history));
}

function showAnalytics() {
  const history = JSON.parse(localStorage.getItem("ideation-history") || "[]");

  if (history.length === 0) {
    els.analyticsEmpty.classList.remove("hidden");
    els.analyticsContent.classList.add("hidden");
    showScreen("analytics");
    return;
  }

  els.analyticsEmpty.classList.add("hidden");
  els.analyticsContent.classList.remove("hidden");

  const scores = history.map((h) => h.count);
  const total = scores.reduce((a, b) => a + b, 0);
  const avg = (total / scores.length).toFixed(1);
  const best = Math.max(...scores);

  els.statGames.textContent = scores.length;
  els.statAvg.textContent = avg;
  els.statBest.textContent = best;
  els.statTotal.textContent = total;

  drawChart(scores);

  // Improvement tip
  const tips = [
    "Try thinking in categories: household, outdoor, artistic, scientific, silly.",
    "Don't filter yourself — write down even the wildest ideas first.",
    "Speed matters more than perfection. Edit later, brainstorm now.",
    "Challenge yourself: can you beat your personal best next round?",
    "Try combining two random ideas from your last game into one new concept.",
    "Think about what a child, an engineer, or an alien would do with the object.",
    "Set a mini-goal: try to hit 5 ideas in the first 30 seconds.",
    "After each game, pick your 3 most original ideas and think about why they stood out.",
  ];

  if (scores.length >= 3) {
    const recent = scores.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = scores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(scores.slice(0, -3).length, 1);
    if (recentAvg > olderAvg) {
      els.analyticsTip.textContent = "You're improving! Your recent games are above your earlier average. " + tips[Math.floor(Math.random() * tips.length)];
    } else {
      els.analyticsTip.textContent = "Room to grow! " + tips[Math.floor(Math.random() * tips.length)];
    }
  } else {
    els.analyticsTip.textContent = "Play a few more games to see your trend! " + tips[Math.floor(Math.random() * tips.length)];
  }

  showScreen("analytics");
}

function drawChart(scores) {
  const canvas = els.chartScores;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = 200;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const maxScore = Math.max(...scores, 1);
  const n = scores.length;

  // Grid lines
  ctx.strokeStyle = "#333355";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "#8888aa";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(maxScore - (maxScore / 4) * i), padding.left - 8, y + 4);
  }

  if (n === 1) {
    // Single dot
    const x = padding.left + chartW / 2;
    const y = padding.top + chartH - (scores[0] / maxScore) * chartH;
    ctx.fillStyle = "#6c63ff";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8888aa";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("1", x, h - 8);
    return;
  }

  const step = chartW / (n - 1);

  // Area fill
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartH);
  for (let i = 0; i < n; i++) {
    const x = padding.left + step * i;
    const y = padding.top + chartH - (scores[i] / maxScore) * chartH;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(padding.left + step * (n - 1), padding.top + chartH);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  gradient.addColorStop(0, "rgba(108, 99, 255, 0.3)");
  gradient.addColorStop(1, "rgba(108, 99, 255, 0.02)");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = "#6c63ff";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  for (let i = 0; i < n; i++) {
    const x = padding.left + step * i;
    const y = padding.top + chartH - (scores[i] / maxScore) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Dots
  for (let i = 0; i < n; i++) {
    const x = padding.left + step * i;
    const y = padding.top + chartH - (scores[i] / maxScore) * chartH;
    ctx.fillStyle = "#6c63ff";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f0f1a";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // X-axis labels (show a few)
  ctx.fillStyle = "#8888aa";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  const labelStep = Math.max(1, Math.floor(n / 8));
  for (let i = 0; i < n; i += labelStep) {
    const x = padding.left + step * i;
    ctx.fillText(i + 1, x, h - 8);
  }
  if ((n - 1) % labelStep !== 0) {
    const x = padding.left + step * (n - 1);
    ctx.fillText(n, x, h - 8);
  }
}

els.btnAnalytics.addEventListener("click", showAnalytics);
els.btnAnalyticsBack.addEventListener("click", () => showScreen("home"));

// --- Speech Recognition ---
let recognition = null;
let isListening = false;

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.btnMic.classList.add("hidden");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    if (transcript) {
      els.ideaInput.value = transcript;
      submitIdea();
    }
  };

  recognition.onend = () => {
    isListening = false;
    els.btnMic.classList.remove("mic-active");
  };

  recognition.onerror = () => {
    isListening = false;
    els.btnMic.classList.remove("mic-active");
  };
}

els.btnMic.addEventListener("click", () => {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
    isListening = false;
    els.btnMic.classList.remove("mic-active");
  } else {
    recognition.start();
    isListening = true;
    els.btnMic.classList.add("mic-active");
  }
});

setupSpeechRecognition();

// --- Confetti ---
function showConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";
  const colors = ["#6c63ff", "#ff6b6b", "#2ecc71", "#f39c12", "#e8e8f0"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + "s";
    piece.style.width = (Math.random() * 8 + 5) + "px";
    piece.style.height = (Math.random() * 8 + 5) + "px";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ""; }, 4500);
}

// --- Utility ---
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

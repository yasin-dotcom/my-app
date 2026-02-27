// --- DOM Elements ---
const screens = {
  home: document.getElementById("screen-home"),
  lobby: document.getElementById("screen-lobby"),
  game: document.getElementById("screen-game"),
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

  const pct = (timeRemaining / 120) * 100;
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
  startTimer(120);
}

function addSoloIdea(idea) {
  soloIdeas.push(idea);
  els.ideaCountNum.textContent = soloIdeas.length;

  const li = document.createElement("li");
  li.textContent = idea;
  els.ideasList.prepend(li);
}

function endSoloGame() {
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

  socket.on("new-host", (hostName) => {
    // Check if we are the new host by comparing names
    // (server already reassigned the host)
    isHost = true;
    els.btnStartGame.classList.remove("hidden");
    els.lobbyWaiting.classList.add("hidden");
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

// Room code input — auto-uppercase
els.roomCodeInput.addEventListener("input", () => {
  els.roomCodeInput.value = els.roomCodeInput.value.toUpperCase();
});

// --- Utility ---
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

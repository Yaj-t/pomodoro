/* ================================
   CONSTANTS & STORAGE HELPERS
================================ */
const STORAGE_KEYS = {
    TIMER: "timerData",
    HISTORY: "history",
    MODES: "modeSettings"
};

const DEFAULT_MODES = {
    pomodoro: {
        label: "Pomodoro",
        duration: 25 * 60,
        theme: { accent: "#E85D60", pageBackground: "#1e293b" }
    },
    shortBreak: {
        label: "Short Break",
        duration: 5 * 60,
        theme: { accent: "#4ABDAC", pageBackground: "#0f172a" }
    },
    longBreak: {
        label: "Long Break",
        duration: 15 * 60,
        theme: { accent: "#5995FF", pageBackground: "#0f172a" }
    }
};

const load = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch { return fallback; }
};

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

/* ================================
   APPLICATION STATE
================================ */
const state = {
    modes: load(STORAGE_KEYS.MODES, DEFAULT_MODES),
    history: load(STORAGE_KEYS.HISTORY, []),
    timer: load(STORAGE_KEYS.TIMER, {
        mode: "pomodoro",
        timeLeft: DEFAULT_MODES.pomodoro.duration,
        cycles: 0,
        isRunning: false
    }),
    intervalId: null
};

/* ================================
   DOM ELEMENTS
================================ */
const dom = {
    timer: document.getElementById("timer"),
    progressBar: document.getElementById("progress-bar"),
    toggle: document.getElementById("timer-toggle"),
    modeLabel: document.getElementById("mode-label"),
    historyList: document.getElementById("history-list"),
    historyHeader: document.getElementById("history-header"),
    clearHistoryBtn: document.getElementById("clear-history"),
    clickSound: document.getElementById("click-sound"),
    alarmSound: document.getElementById("alarm-sound"),
    skipBtn: document.getElementById("skip-btn"),
};

/* ================================
   PROGRESS RING LOGIC
================================ */
const radius = dom.progressBar.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

dom.progressBar.style.strokeDasharray = `${circumference} ${circumference}`;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    dom.progressBar.style.strokeDashoffset = offset;
}

/* ================================
   TIMER LOGIC
================================ */
function getNextMode() {
    if (state.timer.mode !== "pomodoro") return "pomodoro";
    state.timer.cycles++;
    return state.timer.cycles % 4 === 0 ? "longBreak" : "shortBreak";
}

function startTimer() {
    if (state.intervalId) return;
    state.timer.isRunning = true;
    dom.toggle.textContent = "Pause";
    state.intervalId = setInterval(tick, 1000);
    save(STORAGE_KEYS.TIMER, state.timer);
}

function pauseTimer() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.timer.isRunning = false;
    dom.toggle.textContent = "Start";
    save(STORAGE_KEYS.TIMER, state.timer);
}

function tick() {
    if (state.timer.timeLeft <= 0) {
        completeTimer();
        return;
    }
    state.timer.timeLeft--;
    renderTimer();
}

function completeTimer() {
    pauseTimer();
    const currentMode = state.modes[state.timer.mode];

    state.history.unshift({
        mode: currentMode.label,
        duration: currentMode.duration - state.timer.timeLeft,
        timestamp: Date.now()
    });

    state.timer.mode = getNextMode();
    state.timer.timeLeft = state.modes[state.timer.mode].duration;

    if (dom.alarmSound) dom.alarmSound.play();

    save(STORAGE_KEYS.HISTORY, state.history);
    save(STORAGE_KEYS.TIMER, state.timer);
    render();
}

/* ================================
   HISTORY ACTIONS
================================ */
function deleteHistoryItem(index) {
    state.history.splice(index, 1);
    save(STORAGE_KEYS.HISTORY, state.history);
    renderHistory();
}

function clearAllHistory() {
    if (confirm("Clear all focus history?")) {
        state.history = [];
        save(STORAGE_KEYS.HISTORY, state.history);
        renderHistory();
    }
}

/* ================================
   RENDER UI
================================ */
function renderTimer() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    dom.timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Update Ring
    const totalDuration = state.modes[state.timer.mode].duration;
    const percentage = (state.timer.timeLeft / totalDuration) * 100;
    setProgress(percentage);
}

function renderMode() {
    const mode = state.modes[state.timer.mode];
    dom.modeLabel.textContent = mode.label;
    document.documentElement.style.setProperty("--accent", mode.theme.accent);
}

function renderHistory() {
    dom.historyList.innerHTML = "";
    dom.historyHeader.textContent = state.history.length ? "History" : "No History";

    // Hide/Show clear button
    dom.clearHistoryBtn.style.display = state.history.length ? "block" : "none";

    state.history.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "history-item";

        const durationText = item.duration >= 60 ? `${item.duration / 60}m` : `${item.duration}s`;
        const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        li.innerHTML = `
            <div class="item-info">
                <span class="item-mode">${item.mode}</span>
                <span class="item-time">${durationText} • ${timeStr}</span>
            </div>
            <button class="delete-btn" data-index="${index}">&times;</button>
        `;
        dom.historyList.appendChild(li);
    });
}

function render() {
    renderTimer();
    renderMode();
    renderHistory();
}

/* ================================
   EVENTS
================================ */
dom.toggle.addEventListener("click", () => {
    if (dom.clickSound) dom.clickSound.play();
    state.timer.isRunning ? pauseTimer() : startTimer();
});

dom.clearHistoryBtn.addEventListener("click", clearAllHistory);

dom.historyList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const index = e.target.getAttribute("data-index");
        deleteHistoryItem(index);
    }
});

dom.skipBtn.addEventListener("click", (e) => {
    if (dom.clickSound) dom.clickSound.play();
    completeTimer();
})

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        state.timer.isRunning ? pauseTimer() : startTimer();
    }
});

/* ================================
   INIT
================================ */
render();
/* ================================
   DOM ELEMENTS
================================ */

const dom = {
    timer: document.getElementById("timer"),
    toggle: document.getElementById("timer-toggle"),
    modeLabel: document.getElementById("mode-label"),
    historyList: document.getElementById("history-list"),
    historyHeader: document.getElementById("history-header"),
    clickSound: document.getElementById("click-sound"),
    alarmSound: document.getElementById("alarm-sound"),
    circle: document.getElementById('progress-bar'),
};
/* ================================ 
   CONSTANTS & STORAGE HELPERS
================================ */
const radius = dom.circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
dom.circle.style.strokeDasharray = `${circumference} ${circumference}`;
dom.circle.style.strokeDashoffset = circumference;
const STORAGE_KEYS = {
    TIMER: "timerData",
    HISTORY: "history",
    MODES: "modeSettings"
};

const DEFAULT_MODES = {
    pomodoro: {
        label: "Pomodoro",
        duration: 1,
        theme: {
            accent: "#E85D60",
            accentSoft: "#FFEBE9",
            pageBackground: "#DB2955"
        }
    },
    shortBreak: {
        label: "Short Break",
        duration: 1,
        theme: {
            accent: "#4ABDAC",
            accentSoft: "#DFF6F0",
            pageBackground: "#7FB285"
        }
    },
    longBreak: {
        label: "Long Break",
        duration: 1,
        theme: {
            accent: "#5995FF",
            accentSoft: "#DDE9FB",
            pageBackground: "#5BC0EB"
        }
    }
};

const load = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
};

const save = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

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
   MODE CYCLE
================================ */

function getNextMode() {
    if (state.timer.mode !== "pomodoro") {
        return "pomodoro";
    }

    state.timer.cycles++;
    return state.timer.cycles % 4 === 0 ? "longBreak" : "shortBreak";
}

/* ================================
   TIMER CONTROL
================================ */

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

/* ================================
   TIMER COMPLETION
================================ */

function completeTimer() {
    pauseTimer();

    const currentMode = state.modes[state.timer.mode];

    state.history.unshift({
        mode: currentMode.label,
        duration: currentMode.duration,
        timestamp: Date.now()
    });

    state.timer.mode = getNextMode();
    state.timer.timeLeft = state.modes[state.timer.mode].duration;

    dom.alarmSound.currentTime = 0;
    dom.alarmSound.play();

    save(STORAGE_KEYS.HISTORY, state.history);
    save(STORAGE_KEYS.TIMER, state.timer);

    render();
}

/* ================================
   RENDER UI
================================ */

function renderTimer() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    dom.timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const totalTime = state.modes[state.timer.mode].duration;
    const percentage = (state.timer.timeLeft / totalTime) * 100;
    setProgress(percentage);
}

function renderMode() {
    const mode = state.modes[state.timer.mode];
    dom.modeLabel.textContent = mode.label;

    document.documentElement.style.setProperty("--accent", mode.theme.accent);
    dom.circle.style.stroke = mode.theme.accent;
}

function renderHistory() {
    dom.historyList.innerHTML = "";
    dom.historyHeader.textContent = state.history.length ? "History" : "No History";

    state.history.forEach(({ mode, duration, timestamp }) => {
        const li = document.createElement("li");
        li.classList.add("history-item");
        li.textContent = `${mode} - ${duration >= 60 ? duration / 60 : duration} ${duration >= 60 ? "mins" : "seconds"} - ${new Date(timestamp).toLocaleString()}`;
        dom.historyList.appendChild(li);
    });
}

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    dom.circle.style.strokeDashoffset = offset;
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
    dom.clickSound.currentTime = 0;
    dom.clickSound.play();

    state.timer.isRunning ? pauseTimer() : startTimer();
});

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        dom.clickSound.currentTime = 0;
        dom.clickSound.play();
        e.preventDefault();
        state.timer.isRunning ? pauseTimer() : startTimer();
    }
});

/* ================================
   INIT
================================ */

render();

const timer = document.getElementById("timer");
const timerToggleBtn = document.getElementById("timer-toggle");
const modeLabel = document.getElementById("mode-label");
const clickSound = document.getElementById("click-sound");
const alarmSound = document.getElementById("alarm-sound");
const historyList = document.getElementById("history-list");
const historyHeader = document.getElementById("history-header");
const historyArray = [];
const MODES = {
    pomodoro: {
        label: "Pomodoro",
        duration: 25 * 60,
        accent: "#E85D60",
        accentSoft: "#FFEBE9",
        pageBg: "#DB2955"
    },
    shortBreak: {
        label: "Short Break",
        duration: 5 * 60,
        accent: "#4ABDAC",
        accentSoft: "#DFF6F0",
        pageBg: "#7FB285"
    },
    longBreak: {
        label: "Long Break",
        duration: 10 * 60,
        accent: "#5995FF",
        accentSoft: "#DDE9FB",
        pageBg: "#5BC0EB"
    }
};


let cycles = 0
let interval = null;
let isRunning = false;
let currentMode = "pomodoro";
let timeLeft = MODES[currentMode].duration;


function updateTimerDisplay(timeLeft) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function toggleTimer() {
    clickSound.currentTime = 0;
    clickSound.play();
    if (isRunning) {
        timerToggleBtn.textContent = "Start";
        pauseTimer();
        return;
    }
    isRunning = true;
    timerToggleBtn.textContent = "Pause";
    timerTick();
}

function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
}

function timerTick() {
    interval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay(timeLeft);
        } else {
            handleEndTimer();
        }
    }, 1000);
}

function handleEndTimer() {
    addToHistory(MODES[currentMode].label, MODES[currentMode].duration)
    clearInterval(interval);
    isRunning = false;
    timerToggleBtn.textContent = 'start';
    alarmSound.currentTime = 0;
    alarmSound.play();
    modeCycler();
    displayhistory();
    updateTimerDisplay(timeLeft);

}

function modeCycler() {
    if (currentMode === 'pomodoro') {
        cycles++;
        if (cycles % 1 === 0) {
            setMode("longBreak")
        } else {
            setMode("shortBreak")
        }
    } else {
        setMode('pomodoro')
    }
}

function setMode(mode) {
    if (!MODES[mode]) return

    currentMode = mode;
    timeLeft = MODES[mode].duration;
    modeLabel.textContent = MODES[mode].label;

    document.documentElement.style.setProperty(
        "--accent",
        MODES[mode].accent
    );

    document.documentElement.style.setProperty(
        "--accent-soft",
        MODES[mode].accentSoft
    );

    document.documentElement.style.setProperty(
        "--page-background",
        MODES[mode].pageBg
    )
}


timerToggleBtn.addEventListener("click", toggleTimer);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        event.preventDefault()
        alarmSound.pause()
        toggleTimer()
    }
})

function addToHistory(mode, duration) {
    historyArray.push({
        mode: mode,
        duration: duration,
        timestamp: Date.now()
    })
}

function displayhistory() {
    historyList.innerHTML = '';
    historyHeader.textContent = historyArray.length === 0 ? 'No History' : 'History';
    historyArray.forEach((record) => {
        const li = document.createElement('li');
        const { mode, duration, timestamp } = record;
        const date = new Date(timestamp);
        const formatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        li.textContent = `${mode} - ${duration} mins - ${formatted}`;
        li.classList.add('history-item')

        historyList.appendChild(li);
    })
}


setMode(currentMode);
displayhistory();
updateTimerDisplay(timeLeft);
formatTimeStamp(Date.now())
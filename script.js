const timer = document.getElementById("timer");
const timerToggleBtn = document.getElementById("timer-toggle");
const modeLabel = document.getElementById("mode-label");
const MODES = {
    pomodoro: {
        label: "Pomodoro",
        duration: 25 * 60
    },
    shortBreak: {
        label: "Short Break",
        duration: 5 * 60
    },
    longBreak: {
        label: "Long Break",
        duration: 15 * 60
    }
}

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
            clearInterval(interval);
            isRunning = false;
            timerToggleBtn.textContent = 'start'
            alert("Time's up!");
            modeCycler()
        }
    }, 1000);
}

function modeCycler() {
    if (currentMode === 'pomodoro') {
        cycles++;
        if (cycles % 4 === 0) {
            setMode("longBreak")
        } else {
            setMode("shortBreak")
        }
    } else {
        setMode('pomodoro')
    }
}

function setMode(mode) {
    if (!MODES[mode]) {
        return
    }
    currentMode = mode;
    timeLeft = MODES[mode].duration;
    modeLabel.textContent = mode;
    updateTimerDisplay(timeLeft)
}


timerToggleBtn.addEventListener("click", toggleTimer);
document.addEventListener("keydown", (e) => {
    console.log("key down")
    if (e.code === "Space") {
        event.preventDefault()
        toggleTimer()
    }
})

updateTimerDisplay(timeLeft);
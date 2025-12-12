const timer = document.getElementById("timer");
const timerToggleBtn = document.getElementById("timer-toggle");
const minutesInput = document.getElementById("minutes");

let totalSeconds = 25 * 60;
let interval = null;
let isRunning = false;

function updateTimerDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
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

function timerTick() {
    interval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateTimerDisplay(totalSeconds);
        } else {
            clearInterval(interval);
            isRunning = false;
            alert("Time's up!");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
}

timerToggleBtn.addEventListener("click", toggleTimer);

updateTimerDisplay(totalSeconds);
const timer = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const minutesInput = document.getElementById("minutes");

let totalSeconds = 25 * 60;
let interval = null;
let isRunning = false;

function updateTimerDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
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

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    const inputMinutes = parseInt(minutesInput.value, 10);
    totalSeconds = isNaN(inputMinutes) || inputMinutes <= 0 ? 25 * 60 : inputMinutes * 60;
    updateTimerDisplay(totalSeconds);
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay(totalSeconds);
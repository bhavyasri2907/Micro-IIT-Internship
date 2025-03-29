// Theme functionality
const themeButtons = document.querySelectorAll('.theme-btn');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        playClickSound();
    });
});

// Sound effect
const clickSound = document.getElementById('clickSound');

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {
        // Ignore errors if sound can't be played
    });
}

// Clock functionality
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Update time
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, options);
    
    // Update weekday
    document.getElementById('weekday').textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call

// Stopwatch functionality
let startTime;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let lapTimes = [];
let lastLapTime = 0;
let totalTime = 0;
let bestLapTime = Infinity;
let worstLapTime = 0;

const stopwatchDisplay = document.getElementById('stopwatch');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const lapButton = document.getElementById('lap');
const resetButton = document.getElementById('reset');
const lapList = document.getElementById('lap-list');
const totalTimeDisplay = document.getElementById('total-time');
const totalLapsDisplay = document.getElementById('total-laps');

function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000));
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function updateStopwatch() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    stopwatchDisplay.textContent = formatTime(elapsedTime);
}

function startStopwatch() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateStopwatch, 10);
        startButton.disabled = true;
        stopButton.disabled = false;
        lapButton.disabled = false;
        playClickSound();
    }
}

function stopStopwatch() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startButton.disabled = false;
        stopButton.disabled = true;
        lapButton.disabled = true;
        totalTime += elapsedTime;
        updateStats();
        playClickSound();
    }
}

function resetStopwatch() {
    stopStopwatch();
    elapsedTime = 0;
    lapTimes = [];
    lastLapTime = 0;
    totalTime = 0;
    bestLapTime = Infinity;
    worstLapTime = 0;
    stopwatchDisplay.textContent = '00:00:00.000';
    lapList.innerHTML = '';
    updateStats();
    startButton.disabled = false;
    stopButton.disabled = true;
    lapButton.disabled = true;
    playClickSound();
}

function addLap() {
    if (isRunning) {
        const currentLapTime = elapsedTime - lastLapTime;
        lapTimes.push(currentLapTime);
        lastLapTime = elapsedTime;
        
        // Update best and worst lap times
        if (currentLapTime < bestLapTime) bestLapTime = currentLapTime;
        if (currentLapTime > worstLapTime) worstLapTime = currentLapTime;
        
        // Create and add lap time element
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        
        // Add special classes for best and worst laps
        if (currentLapTime === bestLapTime) {
            lapItem.classList.add('best-lap');
        } else if (currentLapTime === worstLapTime) {
            lapItem.classList.add('worst-lap');
        }
        
        lapItem.innerHTML = `
            <span>Lap ${lapTimes.length}</span>
            <span>${formatTime(currentLapTime)}</span>
            ${currentLapTime === bestLapTime ? '<i class="fas fa-trophy"></i>' : ''}
            ${currentLapTime === worstLapTime ? '<i class="fas fa-exclamation"></i>' : ''}
        `;
        lapList.insertBefore(lapItem, lapList.firstChild);
        
        // Keep only last 10 laps
        if (lapTimes.length > 10) {
            lapTimes.shift();
            lapList.removeChild(lapList.lastChild);
        }
        
        updateStats();
        playClickSound();
    }
}

function updateStats() {
    totalTimeDisplay.textContent = formatTime(totalTime);
    totalLapsDisplay.textContent = lapTimes.length;
}

// Event listeners
startButton.addEventListener('click', startStopwatch);
stopButton.addEventListener('click', stopStopwatch);
lapButton.addEventListener('click', addLap);
resetButton.addEventListener('click', resetStopwatch);

// Initialize button states
stopButton.disabled = true;
lapButton.disabled = true; 
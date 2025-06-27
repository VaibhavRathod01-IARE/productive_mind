// Global state management
const state = {
    theme: localStorage.getItem('theme') || 'dark',
    pomodoro: {
        timeLeft: 25 * 60,
        isActive: false,
        mode: 'work', // 'work', 'shortBreak', 'longBreak'
        sessions: 0,
        settings: {
            workTime: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLongBreak: 4
        }
    },
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    flashcards: JSON.parse(localStorage.getItem('flashcards')) || [],
    currentFlashcard: 0,
    ambientSound: {
        current: null,
        volume: 0.5,
        audio: null
    }
};

// Quotes database
const quotes = [
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who prepare for it today.", author: "Malcolm X" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
];

// Sound URLs (using placeholder sounds - in real implementation, these would be actual audio files)
const soundUrls = {
    rain: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5oJCDSF+ye3qiT0MHm7C7+OLTQ4jev...',
    cafe: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5oJCDSF+ye3qiT0MHm7C7+OLTQ4jev...',
    lofi: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5oJCDSF+ye3qiT0MHm7C7+OLTQ4jev...',
    nature: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5oJCDSF+ye3qiT0MHm7C7+OLTQ4jev...'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    loadInitialData();
    showOnboardingIfFirstVisit();
    setDailyQuote();
    
    // Load saved settings
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
        state.pomodoro.settings = { ...state.pomodoro.settings, ...JSON.parse(savedSettings) };
        state.pomodoro.timeLeft = state.pomodoro.settings.workTime * 60;
    }
    
    updateUI();
});

// Theme Management
function initializeTheme() {
    if (state.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '☀️';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    
    if (state.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        document.getElementById('themeToggle').querySelector('.theme-icon').textContent = '🌙';
    }
}

// Event Listeners
function initializeEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // About modal
    document.getElementById('aboutBtn').addEventListener('click', () => showModal('aboutModal'));
    document.getElementById('closeAbout').addEventListener('click', () => hideModal('aboutModal'));
    
    // Onboarding modal
    document.getElementById('closeOnboarding').addEventListener('click', () => hideModal('onboardingModal'));
    
    // Pomodoro timer
    document.getElementById('startBtn').addEventListener('click', startPomodoro);
    document.getElementById('pauseBtn').addEventListener('click', pausePomodoro);
    document.getElementById('resetBtn').addEventListener('click', resetPomodoro);
    document.getElementById('pomodoroSettings').addEventListener('click', () => showModal('pomodoroSettingsModal'));
    document.getElementById('closePomodoroSettings').addEventListener('click', () => hideModal('pomodoroSettingsModal'));
    document.getElementById('savePomodoroSettings').addEventListener('click', savePomodoroSettings);
    
    // Tasks
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('newTask').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Goals
    document.getElementById('addGoalBtn').addEventListener('click', addGoal);
    document.getElementById('newGoal').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal();
    });
    
    // Flashcards
    document.getElementById('addFlashcardBtn').addEventListener('click', () => showModal('flashcardModal'));
    document.getElementById('closeFlashcard').addEventListener('click', () => hideModal('flashcardModal'));
    document.getElementById('saveFlashcard').addEventListener('click', saveFlashcard);
    document.getElementById('prevCard').addEventListener('click', previousFlashcard);
    document.getElementById('nextCard').addEventListener('click', nextFlashcard);
    
    // Ambient sounds
    document.querySelectorAll('.sound-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleAmbientSound(btn.dataset.sound));
    });
    document.getElementById('volumeSlider').addEventListener('input', updateVolume);
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

function showOnboardingIfFirstVisit() {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        setTimeout(() => showModal('onboardingModal'), 1000);
        localStorage.setItem('hasVisited', 'true');
    }
}

// Quote of the Day
function setDailyQuote() {
    const today = new Date().toDateString();
    const savedQuoteDate = localStorage.getItem('quoteDate');
    
    if (savedQuoteDate !== today) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        localStorage.setItem('dailyQuote', JSON.stringify(randomQuote));
        localStorage.setItem('quoteDate', today);
    }
    
    const dailyQuote = JSON.parse(localStorage.getItem('dailyQuote')) || quotes[0];
    document.getElementById('dailyQuote').textContent = `"${dailyQuote.text}"`;
    document.getElementById('quoteAuthor').textContent = `- ${dailyQuote.author}`;
}

// Pomodoro Timer Functions
let pomodoroInterval = null;

function startPomodoro() {
    if (!state.pomodoro.isActive) {
        state.pomodoro.isActive = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        
        pomodoroInterval = setInterval(() => {
            state.pomodoro.timeLeft--;
            updateTimerDisplay();
            
            if (state.pomodoro.timeLeft <= 0) {
                completePomodoro();
            }
        }, 1000);
    }
}

function pausePomodoro() {
    state.pomodoro.isActive = false;
    clearInterval(pomodoroInterval);
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
}

function resetPomodoro() {
    pausePomodoro();
    const { workTime, shortBreak, longBreak } = state.pomodoro.settings;
    
    switch (state.pomodoro.mode) {
        case 'work':
            state.pomodoro.timeLeft = workTime * 60;
            break;
        case 'shortBreak':
            state.pomodoro.timeLeft = shortBreak * 60;
            break;
        case 'longBreak':
            state.pomodoro.timeLeft = longBreak * 60;
            break;
    }
    
    updateTimerDisplay();
}

function completePomodoro() {
    pausePomodoro();
    playNotificationSound();
    
    if (state.pomodoro.mode === 'work') {
        state.pomodoro.sessions++;
        
        if (state.pomodoro.sessions % state.pomodoro.settings.sessionsUntilLongBreak === 0) {
            state.pomodoro.mode = 'longBreak';
            state.pomodoro.timeLeft = state.pomodoro.settings.longBreak * 60;
            document.getElementById('timerMode').textContent = 'Long Break';
        } else {
            state.pomodoro.mode = 'shortBreak';
            state.pomodoro.timeLeft = state.pomodoro.settings.shortBreak * 60;
            document.getElementById('timerMode').textContent = 'Short Break';
        }
    } else {
        state.pomodoro.mode = 'work';
        state.pomodoro.timeLeft = state.pomodoro.settings.workTime * 60;
        document.getElementById('timerMode').textContent = 'Focus Time';
    }
    
    updateTimerDisplay();
    showNotification(`${state.pomodoro.mode === 'work' ? 'Break' : 'Work'} time is over! Ready for the next session?`);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.pomodoro.timeLeft / 60);
    const seconds = state.pomodoro.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timerDisplay').textContent = display;
    
    // Update progress circle
    const totalTime = getTotalTimeForMode();
    const progress = ((totalTime - state.pomodoro.timeLeft) / totalTime) * 283;
    document.getElementById('timerProgress').style.strokeDashoffset = 283 - progress;
    
    // Update page title
    document.title = `${display} - ProductiveMind`;
}

function getTotalTimeForMode() {
    const { workTime, shortBreak, longBreak } = state.pomodoro.settings;
    switch (state.pomodoro.mode) {
        case 'work': return workTime * 60;
        case 'shortBreak': return shortBreak * 60;
        case 'longBreak': return longBreak * 60;
        default: return workTime * 60;
    }
}

function savePomodoroSettings() {
    const workTime = parseInt(document.getElementById('workTime').value);
    const shortBreak = parseInt(document.getElementById('shortBreak').value);
    const longBreak = parseInt(document.getElementById('longBreak').value);
    const sessionsUntilLongBreak = parseInt(document.getElementById('sessionsUntilLongBreak').value);
    
    state.pomodoro.settings = { workTime, shortBreak, longBreak, sessionsUntilLongBreak };
    localStorage.setItem('pomodoroSettings', JSON.stringify(state.pomodoro.settings));
    
    // Reset timer with new settings if not active
    if (!state.pomodoro.isActive) {
        resetPomodoro();
    }
    
    hideModal('pomodoroSettingsModal');
    showNotification('Pomodoro settings saved!');
}

// Task Management
function addTask() {
    const input = document.getElementById('newTask');
    const text = input.value.trim();
    
    if (text) {
        const task = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        state.tasks.unshift(task);
        saveTasks();
        renderTasks();
        input.value = '';
        input.focus();
    }
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const taskCounter = document.getElementById('taskCounter');
    
    if (state.tasks.length === 0) {
        taskList.innerHTML = '<li class="task-placeholder">No tasks yet. Add your first task above!</li>';
        taskCounter.textContent = '0 tasks';
        return;
    }
    
    taskList.innerHTML = state.tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})">🗑️</button>
        </li>
    `).join('');
    
    const completedCount = state.tasks.filter(t => t.completed).length;
    taskCounter.textContent = `${completedCount}/${state.tasks.length} completed`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

// Goal Management
function addGoal() {
    const input = document.getElementById('newGoal');
    const text = input.value.trim();
    
    if (text) {
        const goal = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        state.goals.unshift(goal);
        saveGoals();
        renderGoals();
        input.value = '';
        input.focus();
    }
}

function toggleGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        saveGoals();
        renderGoals();
        
        if (goal.completed) {
            celebrateGoalCompletion();
        }
    }
}

function deleteGoal(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
}

function renderGoals() {
    const goalList = document.getElementById('goalList');
    const goalProgress = document.getElementById('goalProgress');
    
    if (state.goals.length === 0) {
        goalList.innerHTML = '<li class="goal-placeholder">No goals set. Add your first goal above!</li>';
        goalProgress.textContent = '0%';
        return;
    }
    
    goalList.innerHTML = state.goals.map(goal => `
        <li class="goal-item ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
            <div class="goal-checkbox ${goal.completed ? 'checked' : ''}" onclick="toggleGoal(${goal.id})"></div>
            <span class="goal-text ${goal.completed ? 'completed' : ''}">${goal.text}</span>
            <button class="goal-delete" onclick="deleteGoal(${goal.id})">🗑️</button>
        </li>
    `).join('');
    
    const completedCount = state.goals.filter(g => g.completed).length;
    const progressPercent = Math.round((completedCount / state.goals.length) * 100);
    goalProgress.textContent = `${progressPercent}%`;
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(state.goals));
}

function celebrateGoalCompletion() {
    const goalWidget = document.querySelector('.goals-widget');
    goalWidget.classList.add('bounce');
    setTimeout(() => goalWidget.classList.remove('bounce'), 600);
    showNotification('🎉 Goal completed! Keep up the great work!');
}

// Flashcard System
function saveFlashcard() {
    const front = document.getElementById('cardFront').value.trim();
    const back = document.getElementById('cardBack').value.trim();
    
    if (front && back) {
        const flashcard = {
            id: Date.now(),
            front,
            back,
            createdAt: new Date().toISOString()
        };
        
        state.flashcards.push(flashcard);
        saveFlashcards();
        renderFlashcards();
        
        document.getElementById('cardFront').value = '';
        document.getElementById('cardBack').value = '';
        hideModal('flashcardModal');
        showNotification('Flashcard added successfully!');
    }
}

function renderFlashcards() {
    const container = document.getElementById('flashcardContainer');
    const controls = document.getElementById('flashcardControls');
    const counter = document.getElementById('cardCounter');
    
    if (state.flashcards.length === 0) {
        container.innerHTML = '<div class="flashcard-placeholder"><p>No flashcards yet. Add your first card!</p></div>';
        controls.style.display = 'none';
        return;
    }
    
    controls.style.display = 'flex';
    const currentCard = state.flashcards[state.currentFlashcard];
    
    container.innerHTML = `
        <div class="flashcard" onclick="flipFlashcard()" id="currentFlashcard">
            <div class="flashcard-text">${currentCard.front}</div>
        </div>
    `;
    
    counter.textContent = `${state.currentFlashcard + 1} / ${state.flashcards.length}`;
}

function flipFlashcard() {
    const card = document.getElementById('currentFlashcard');
    const currentCard = state.flashcards[state.currentFlashcard];
    const isFlipped = card.classList.contains('flipped');
    
    card.classList.toggle('flipped');
    card.querySelector('.flashcard-text').textContent = isFlipped ? currentCard.front : currentCard.back;
}

function nextFlashcard() {
    if (state.currentFlashcard < state.flashcards.length - 1) {
        state.currentFlashcard++;
        renderFlashcards();
    }
}

function previousFlashcard() {
    if (state.currentFlashcard > 0) {
        state.currentFlashcard--;
        renderFlashcards();
    }
}

function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(state.flashcards));
}

// Ambient Sound System
function toggleAmbientSound(soundType) {
    const soundBtn = document.querySelector(`[data-sound="${soundType}"]`);
    const soundStatus = document.getElementById('soundStatus');
    
    // Stop current sound if playing
    if (state.ambientSound.audio) {
        state.ambientSound.audio.pause();
        state.ambientSound.audio = null;
    }
    
    // Remove active class from all buttons
    document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
    
    if (state.ambientSound.current === soundType) {
        // Stop the current sound
        state.ambientSound.current = null;
        soundStatus.textContent = 'Off';
    } else {
        // Start new sound
        state.ambientSound.current = soundType;
        soundBtn.classList.add('active');
        playAmbientSound(soundType);
        soundStatus.textContent = `Playing ${soundType}`;
    }
}

function playAmbientSound(soundType) {
    // In a real implementation, you would load actual audio files
    // For this demo, we'll simulate the audio playback
    try {
        state.ambientSound.audio = new Audio(soundUrls[soundType]);
        state.ambientSound.audio.loop = true;
        state.ambientSound.audio.volume = state.ambientSound.volume;
        state.ambientSound.audio.play().catch(e => {
            console.log('Audio playback failed:', e);
            showNotification('Audio playback not available in this demo');
        });
    } catch (e) {
        console.log('Audio creation failed:', e);
        showNotification('Audio not available in this demo');
    }
}

function updateVolume() {
    const volume = document.getElementById('volumeSlider').value / 100;
    state.ambientSound.volume = volume;
    
    if (state.ambientSound.audio) {
        state.ambientSound.audio.volume = volume;
    }
}

// Utility Functions
function loadInitialData() {
    renderTasks();
    renderGoals();
    renderFlashcards();
    updateTimerDisplay();
    
    // Load pomodoro settings into modal
    const settings = state.pomodoro.settings;
    document.getElementById('workTime').value = settings.workTime;
    document.getElementById('shortBreak').value = settings.shortBreak;
    document.getElementById('longBreak').value = settings.longBreak;
    document.getElementById('sessionsUntilLongBreak').value = settings.sessionsUntilLongBreak;
}

function updateUI() {
    renderTasks();
    renderGoals();
    renderFlashcards();
    updateTimerDisplay();
}

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5oJCDSF+ye3qiT0MHm7C7+OLTQ4jev...');
        audio.play().catch(e => console.log('Notification sound failed:', e));
    } catch (e) {
        console.log('Notification sound creation failed:', e);
    }
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow);
        z-index: 3000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Clear daily data at midnight
function clearDailyData() {
    const today = new Date().toDateString();
    const lastClear = localStorage.getItem('lastClear');
    
    if (lastClear !== today) {
        // Reset daily goals
        state.goals = [];
        saveGoals();
        
        localStorage.setItem('lastClear', today);
        console.log('Daily data cleared');
    }
}

// Run daily cleanup check
setInterval(clearDailyData, 60000); // Check every minute

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + S: Start/Stop Pomodoro
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        if (state.pomodoro.isActive) {
            pausePomodoro();
        } else {
            startPomodoro();
        }
    }
    
    // Alt + R: Reset Pomodoro
    if (e.altKey && e.key === 'r') {
        e.preventDefault();
        resetPomodoro();
    }
    
    // Alt + T: Focus on task input
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('newTask').focus();
    }
    
    // Alt + G: Focus on goal input
    if (e.altKey && e.key === 'g') {
        e.preventDefault();
        document.getElementById('newGoal').focus();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            hideModal(modal.id);
        });
    }
});

// Service Worker Registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker registered'))
            .catch(() => console.log('Service Worker registration failed'));
    });
}

// Export functions to global scope for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.toggleGoal = toggleGoal;
window.deleteGoal = deleteGoal;
window.flipFlashcard = flipFlashcard;
window.nextFlashcard = nextFlashcard;
window.previousFlashcard = previousFlashcard;

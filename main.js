// Firebase Configuration - Replace with your Firebase config
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, Timestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAZYX7jrN8MIv3Pu7I79S1Qm8nyc0eyroc",
    authDomain: "workout-tracker-130ff.firebaseapp.com",
    projectId: "workout-tracker-130ff",
    storageBucket: "workout-tracker-130ff.firebasestorage.app",
    messagingSenderId: "909959809525",
    appId: "1:909959809525:web:7288e82e028313cd5f78bc"
};

// Initialize Firebase (gracefully handle if config is not set)
let app, auth, db;
try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn('Firebase not configured. UI preview mode - authentication and data persistence disabled.');
    }
} catch (error) {
    console.warn('Firebase initialization error:', error);
}

// State
let currentUser = null;
let workouts = [];
let progressChart = null;

// DOM Elements - will be initialized after DOM loads
let pages, navBtns, authBtn, authModal, closeModal, loginForm, signupForm, showSignup, showLogin;
let loginBtn, signupBtn, authError, generateWodBtn, wodResult, wodContent, saveWodBtn;
let exerciseSelect, metricSelect, historyList, historySearch, historySort;
let addExerciseBtn, exercisesList, saveWorkoutBtn, clearWorkoutBtn, cancelEditBtn, workoutNameInput, workoutDateInput;

// WOD Exercises Database
const wodExercises = {
    none: {
        beginner: [
            { name: 'Burpees', reps: '10', sets: '3', rest: '60s' },
            { name: 'Push-ups', reps: '15', sets: '3', rest: '45s' },
            { name: 'Sit-ups', reps: '20', sets: '3', rest: '45s' },
            { name: 'Air Squats', reps: '20', sets: '3', rest: '45s' },
            { name: 'Mountain Climbers', reps: '20 each', sets: '3', rest: '45s' },
            { name: 'Plank Hold', reps: '30s', sets: '3', rest: '60s' },
            { name: 'Jumping Jacks', reps: '25', sets: '3', rest: '30s' },
            { name: 'Lunges', reps: '10 each', sets: '3', rest: '45s' }
        ],
        intermediate: [
            { name: 'Burpees', reps: '15', sets: '4', rest: '45s' },
            { name: 'Push-ups', reps: '25', sets: '4', rest: '30s' },
            { name: 'Sit-ups', reps: '30', sets: '4', rest: '30s' },
            { name: 'Air Squats', reps: '30', sets: '4', rest: '30s' },
            { name: 'Mountain Climbers', reps: '30 each', sets: '4', rest: '30s' },
            { name: 'Plank Hold', reps: '60s', sets: '3', rest: '45s' },
            { name: 'Burpee Box Jumps', reps: '12', sets: '4', rest: '45s' },
            { name: 'Pistol Squats', reps: '8 each', sets: '3', rest: '60s' }
        ],
        advanced: [
            { name: 'Burpees', reps: '20', sets: '5', rest: '30s' },
            { name: 'Push-ups', reps: '30', sets: '5', rest: '20s' },
            { name: 'Sit-ups', reps: '40', sets: '5', rest: '20s' },
            { name: 'Air Squats', reps: '40', sets: '5', rest: '20s' },
            { name: 'Mountain Climbers', reps: '40 each', sets: '5', rest: '20s' },
            { name: 'Plank Hold', reps: '90s', sets: '4', rest: '30s' },
            { name: 'Burpee Box Jumps', reps: '15', sets: '5', rest: '30s' },
            { name: 'Pistol Squats', reps: '12 each', sets: '4', rest: '45s' },
            { name: 'Handstand Push-ups', reps: '10', sets: '4', rest: '60s' }
        ]
    },
    barbell: {
        beginner: [
            { name: 'Barbell Back Squat', reps: '10', sets: '3', weight: 'light', rest: '90s' },
            { name: 'Barbell Bench Press', reps: '8', sets: '3', weight: 'light', rest: '90s' },
            { name: 'Barbell Deadlift', reps: '5', sets: '3', weight: 'light', rest: '120s' },
            { name: 'Barbell Overhead Press', reps: '8', sets: '3', weight: 'light', rest: '90s' },
            { name: 'Barbell Rows', reps: '10', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Barbell Front Squat', reps: '8', sets: '3', weight: 'light', rest: '90s' }
        ],
        intermediate: [
            { name: 'Barbell Back Squat', reps: '8', sets: '4', weight: 'moderate', rest: '90s' },
            { name: 'Barbell Bench Press', reps: '6', sets: '4', weight: 'moderate', rest: '90s' },
            { name: 'Barbell Deadlift', reps: '5', sets: '4', weight: 'moderate', rest: '120s' },
            { name: 'Barbell Overhead Press', reps: '6', sets: '4', weight: 'moderate', rest: '90s' },
            { name: 'Barbell Clean & Jerk', reps: '5', sets: '4', weight: 'moderate', rest: '120s' },
            { name: 'Barbell Snatch', reps: '5', sets: '4', weight: 'moderate', rest: '120s' }
        ],
        advanced: [
            { name: 'Barbell Back Squat', reps: '6', sets: '5', weight: 'heavy', rest: '120s' },
            { name: 'Barbell Bench Press', reps: '5', sets: '5', weight: 'heavy', rest: '120s' },
            { name: 'Barbell Deadlift', reps: '3', sets: '5', weight: 'heavy', rest: '180s' },
            { name: 'Barbell Overhead Press', reps: '5', sets: '5', weight: 'heavy', rest: '120s' },
            { name: 'Barbell Clean & Jerk', reps: '3', sets: '5', weight: 'heavy', rest: '180s' },
            { name: 'Barbell Snatch', reps: '3', sets: '5', weight: 'heavy', rest: '180s' },
            { name: 'Barbell Thruster', reps: '8', sets: '5', weight: 'moderate', rest: '90s' }
        ]
    },
    dumbbell: {
        beginner: [
            { name: 'Dumbbell Squats', reps: '12', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Dumbbell Press', reps: '10', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Dumbbell Rows', reps: '12 each', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Dumbbell Lunges', reps: '10 each', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Dumbbell Shoulder Press', reps: '10', sets: '3', weight: 'light', rest: '60s' },
            { name: 'Dumbbell Curls', reps: '12', sets: '3', weight: 'light', rest: '45s' }
        ],
        intermediate: [
            { name: 'Dumbbell Squats', reps: '12', sets: '4', weight: 'moderate', rest: '60s' },
            { name: 'Dumbbell Press', reps: '10', sets: '4', weight: 'moderate', rest: '60s' },
            { name: 'Dumbbell Rows', reps: '12 each', sets: '4', weight: 'moderate', rest: '60s' },
            { name: 'Dumbbell Lunges', reps: '12 each', sets: '4', weight: 'moderate', rest: '60s' },
            { name: 'Dumbbell Thrusters', reps: '10', sets: '4', weight: 'moderate', rest: '60s' },
            { name: 'Dumbbell Snatches', reps: '8 each', sets: '4', weight: 'moderate', rest: '90s' }
        ],
        advanced: [
            { name: 'Dumbbell Squats', reps: '12', sets: '5', weight: 'heavy', rest: '60s' },
            { name: 'Dumbbell Press', reps: '10', sets: '5', weight: 'heavy', rest: '60s' },
            { name: 'Dumbbell Rows', reps: '12 each', sets: '5', weight: 'heavy', rest: '60s' },
            { name: 'Dumbbell Lunges', reps: '12 each', sets: '5', weight: 'heavy', rest: '60s' },
            { name: 'Dumbbell Thrusters', reps: '10', sets: '5', weight: 'heavy', rest: '60s' },
            { name: 'Dumbbell Snatches', reps: '10 each', sets: '5', weight: 'moderate', rest: '90s' },
            { name: 'Dumbbell Turkish Get-ups', reps: '5 each', sets: '4', weight: 'moderate', rest: '120s' }
        ]
    }
};

// Initialize
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        initWorkoutTracker();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

function initWorkoutTracker() {
    // Initialize DOM elements
    pages = document.querySelectorAll('.page');
    navBtns = document.querySelectorAll('.nav-btn');
    authBtn = document.getElementById('auth-btn');
    authModal = document.getElementById('auth-modal');
    closeModal = document.querySelector('.close');
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    showSignup = document.getElementById('show-signup');
    showLogin = document.getElementById('show-login');
    loginBtn = document.getElementById('login-btn');
    signupBtn = document.getElementById('signup-btn');
    authError = document.getElementById('auth-error');
    generateWodBtn = document.getElementById('generate-wod-btn');
    wodResult = document.getElementById('wod-result');
    wodContent = document.getElementById('wod-content');
    saveWodBtn = document.getElementById('save-wod-btn');
    exerciseSelect = document.getElementById('exercise-select');
    metricSelect = document.getElementById('metric-select');
    historyList = document.getElementById('history-list');
    historySearch = document.getElementById('history-search');
    historySort = document.getElementById('history-sort');
    addExerciseBtn = document.getElementById('add-exercise-btn');
    exercisesList = document.getElementById('exercises-list');
    saveWorkoutBtn = document.getElementById('save-workout-btn');
    clearWorkoutBtn = document.getElementById('clear-workout-btn');
    cancelEditBtn = document.getElementById('cancel-edit-btn');
    workoutNameInput = document.getElementById('workout-name');
    workoutDateInput = document.getElementById('workout-date');
    
    setupEventListeners();
    checkAuthState();
    loadWorkouts();
}

// Event Listeners
function setupEventListeners() {
    // Navigation - attach to all buttons with data-page attribute
    const allNavButtons = document.querySelectorAll('[data-page]');
    if (allNavButtons && allNavButtons.length > 0) {
        allNavButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navigateTo(btn.dataset.page);
            });
        });
    }
    
    // Also handle nav buttons for active state highlighting
    if (navBtns && navBtns.length > 0) {
        navBtns.forEach(btn => {
            // Event listener already added above, but we keep navBtns for active state
        });
    }

    // Auth Modal
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('hidden');
        });
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (authModal) authModal.classList.add('hidden');
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === authModal && authModal) {
            authModal.classList.add('hidden');
        }
    });

    // Auth Forms
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.classList.add('hidden');
            if (signupForm) signupForm.classList.remove('hidden');
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupForm) signupForm.classList.add('hidden');
            if (loginForm) loginForm.classList.remove('hidden');
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }

    // WOD Generator
    if (generateWodBtn) {
        generateWodBtn.addEventListener('click', generateWOD);
    }
    if (saveWodBtn) {
        saveWodBtn.addEventListener('click', saveGeneratedWOD);
    }

    // Workout Entry Form
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', addExerciseRow);
    }
    if (saveWorkoutBtn) {
        saveWorkoutBtn.addEventListener('click', saveManualWorkout);
    }
    if (clearWorkoutBtn) {
        clearWorkoutBtn.addEventListener('click', clearWorkoutForm);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }

    // Progress Chart
    if (exerciseSelect) {
        exerciseSelect.addEventListener('change', updateProgressChart);
    }
    if (metricSelect) {
        metricSelect.addEventListener('change', updateProgressChart);
    }

    // History
    if (historySearch) {
        historySearch.addEventListener('input', renderHistory);
    }
    if (historySort) {
        historySort.addEventListener('change', renderHistory);
    }
}

// Navigation
function navigateTo(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    const targetBtn = Array.from(navBtns).find(btn => btn.dataset.page === pageName);
    
    if (targetPage) targetPage.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    // Load page-specific data
    if (pageName === 'progress') {
        setTimeout(() => updateProgressChart(), 100);
    } else if (pageName === 'history') {
        renderHistory();
    } else if (pageName === 'dashboard') {
        updateDashboard();
    } else if (pageName === 'log') {
        // Set date to today when navigating to log page (only if not editing)
        setTimeout(() => {
            if (workoutDateInput && !window.editingWorkoutId) {
                workoutDateInput.value = formatDateForInput(new Date());
            }
        }, 50);
    }
}

// Authentication
function checkAuthState() {
    if (!auth) {
        authBtn.textContent = 'Login (Firebase not configured)';
        authBtn.disabled = true;
        return;
    }
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            authBtn.textContent = 'Logout';
            authBtn.onclick = handleLogout;
            authBtn.disabled = false;
            loadWorkouts();
            updateDashboard();
        } else {
            authBtn.textContent = 'Login';
            authBtn.onclick = () => authModal.classList.remove('hidden');
            authBtn.disabled = false;
        }
    });
}

async function handleLogin() {
    if (!auth) {
        showAuthError('Firebase is not configured. Please set up your Firebase config in main.js');
        return;
    }
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        authModal.classList.add('hidden');
        authError.classList.add('hidden');
        loadWorkouts();
    } catch (error) {
        showAuthError(error.message);
    }
}

async function handleSignup() {
    if (!auth) {
        showAuthError('Firebase is not configured. Please set up your Firebase config in main.js');
        return;
    }
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        authModal.classList.add('hidden');
        authError.classList.add('hidden');
    } catch (error) {
        showAuthError(error.message);
    }
}

async function handleLogout() {
    if (!auth) return;
    try {
        await signOut(auth);
        workouts = [];
        updateDashboard();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

// WOD Generator
function generateWOD() {
    try {
        const equipment = document.getElementById('equipment-select').value;
        const difficulty = document.getElementById('difficulty-select').value;
        
        if (!wodExercises[equipment] || !wodExercises[equipment][difficulty]) {
            console.error('Invalid equipment or difficulty selection');
            alert('Error generating WOD. Please try again.');
            return;
        }
        
        const exercisePool = wodExercises[equipment][difficulty];
        
        if (!exercisePool || exercisePool.length === 0) {
            console.error('No exercises available for this selection');
            alert('No exercises available. Please try a different selection.');
            return;
        }
        
        // Select 4-6 random exercises
        const numExercises = difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 5 : 6;
        const selectedExercises = [];
        const usedIndices = new Set();
        
        // Make sure we don't get stuck in infinite loop
        const maxAttempts = exercisePool.length * 2;
        let attempts = 0;
        
        while (selectedExercises.length < numExercises && attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * exercisePool.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selectedExercises.push(exercisePool[randomIndex]);
            }
            attempts++;
        }

        if (selectedExercises.length === 0) {
            alert('Error generating WOD. Please try again.');
            return;
        }

        let html = '<div class="wod-exercises">';
        selectedExercises.forEach(exercise => {
            html += `
                <div class="wod-exercise">
                    <h4>${exercise.name}</h4>
                    <p><strong>Sets:</strong> ${exercise.sets} | <strong>Reps:</strong> ${exercise.reps} | <strong>Rest:</strong> ${exercise.rest}</p>
                    ${exercise.weight ? `<p><strong>Weight:</strong> ${exercise.weight}</p>` : ''}
                </div>
            `;
        });
        html += '</div>';

        wodContent.innerHTML = html;
        wodResult.classList.remove('hidden');
        
        // Store generated WOD for saving
        window.currentGeneratedWOD = {
            type: 'WOD',
            equipment,
            difficulty,
            exercises: selectedExercises,
            date: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error generating WOD:', error);
        alert('Error generating WOD: ' + error.message);
    }
}

// Workout Entry Functions
let exerciseCounter = 0;

function addExerciseRow() {
    exerciseCounter++;
    const exerciseItem = document.createElement('div');
    exerciseItem.className = 'exercise-item';
    exerciseItem.id = `exercise-${exerciseCounter}`;
    
    exerciseItem.innerHTML = `
        <div class="exercise-item-header">
            <h4>Exercise ${exerciseCounter}</h4>
            <button class="remove-exercise-btn" onclick="removeExercise(${exerciseCounter})">Remove</button>
        </div>
        <div class="exercise-fields">
            <div>
                <label>Exercise Name</label>
                <input type="text" class="exercise-name" placeholder="e.g., Bench Press" required>
            </div>
            <div>
                <label>Sets</label>
                <input type="number" class="exercise-sets" placeholder="" min="1" required>
            </div>
            <div>
                <label>Reps</label>
                <input type="number" class="exercise-reps" placeholder="" min="1" required>
            </div>
            <div>
                <label>Weight (lbs)</label>
                <input type="number" class="exercise-weight" placeholder="" min="0" step="2.5">
            </div>
        </div>
    `;
    
    exercisesList.appendChild(exerciseItem);
}

function removeExercise(id) {
    const exerciseItem = document.getElementById(`exercise-${id}`);
    if (exerciseItem) {
        exerciseItem.remove();
    }
}

// Helper function to format date for input (avoids timezone issues)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to parse date string to local Date (avoids timezone issues)
function parseDateFromInput(dateString) {
    if (!dateString) return new Date();
    // Parse YYYY-MM-DD format and create date in local timezone
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // month is 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 12, 0, 0); // Use noon to avoid DST issues
    }
    return new Date(dateString);
}

function clearWorkoutForm() {
    exercisesList.innerHTML = '';
    if (workoutNameInput) workoutNameInput.value = '';
    if (workoutDateInput) {
        workoutDateInput.value = formatDateForInput(new Date());
    }
    exerciseCounter = 0;
    delete window.editingWorkoutId;
    if (saveWorkoutBtn) saveWorkoutBtn.textContent = 'Save Workout';
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

function cancelEdit() {
    clearWorkoutForm();
    navigateTo('history');
}

async function saveManualWorkout() {
    if (!db) {
        alert('Firebase is not configured. Please set up your Firebase config to save workouts.');
        return;
    }
    if (!currentUser) {
        alert('Please login to save workouts');
        return;
    }

    const exerciseItems = exercisesList.querySelectorAll('.exercise-item');
    if (exerciseItems.length === 0) {
        alert('Please add at least one exercise');
        return;
    }

    const exercises = [];
    let totalVolume = 0;

    exerciseItems.forEach(item => {
        const name = item.querySelector('.exercise-name').value.trim();
        const sets = parseInt(item.querySelector('.exercise-sets').value);
        const reps = parseInt(item.querySelector('.exercise-reps').value);
        const weight = parseFloat(item.querySelector('.exercise-weight').value) || 0;

        if (!name || !sets || !reps) {
            return; // Skip incomplete exercises
        }

        exercises.push({
            name,
            sets,
            reps,
            weight: weight > 0 ? weight : null
        });

        totalVolume += sets * reps * weight;
    });

    if (exercises.length === 0) {
        alert('Please fill in all required fields for at least one exercise');
        return;
    }

    const workoutName = workoutNameInput.value.trim() || 'Custom Workout';
    const workoutDate = parseDateFromInput(workoutDateInput.value);

    try {
        const workoutData = {
            type: workoutName,
            userId: currentUser.uid,
            timestamp: Timestamp.fromDate(workoutDate),
            exercises: exercises,
            totalVolume: totalVolume
        };

        if (window.editingWorkoutId) {
            // Update existing workout
            await updateDoc(doc(db, 'workouts', window.editingWorkoutId), workoutData);
            alert('Workout updated successfully!');
        } else {
            // Create new workout
            await addDoc(collection(db, 'workouts'), workoutData);
            alert('Workout saved successfully!');
        }
        
        clearWorkoutForm();
        await loadWorkouts();
        navigateTo('history');
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout. Please try again.');
    }
}

// Delete workout function
async function deleteWorkout(workoutId) {
    if (!db || !currentUser) {
        alert('Not authenticated. Please log in.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'workouts', workoutId));
        await loadWorkouts();
        renderHistory();
        alert('Workout deleted successfully!');
    } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Error deleting workout. Please try again.');
    }
}

// Make functions available globally for onclick handlers
window.removeExercise = removeExercise;
window.toggleWorkoutDetails = toggleWorkoutDetails;
window.editWorkout = editWorkout;
window.deleteWorkout = deleteWorkout;

function toggleWorkoutDetails(workoutId) {
    const detailsDiv = document.getElementById(`details-${workoutId}`);
    const workoutItem = document.querySelector(`[data-workout-id="${workoutId}"]`);
    if (detailsDiv && workoutItem) {
        const expandIcon = workoutItem.querySelector('.expand-icon');
        detailsDiv.classList.toggle('hidden');
        if (expandIcon) {
            expandIcon.textContent = detailsDiv.classList.contains('hidden') ? '▼' : '▲';
        }
    }
}

async function editWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) {
        alert('Workout not found');
        return;
    }

    // Navigate to log page
    navigateTo('log');
    
    // Populate form
    if (workoutNameInput) workoutNameInput.value = workout.type || '';
    
    if (workoutDateInput) {
        // Convert Firestore timestamp to Date if needed
        const dateObj = workout.timestamp instanceof Date ? workout.timestamp : workout.timestamp.toDate();
        workoutDateInput.value = formatDateForInput(dateObj);
    }
    
    // Clear existing exercises
    exercisesList.innerHTML = '';
    exerciseCounter = 0;
    
    // Add exercises
    if (workout.exercises) {
        workout.exercises.forEach(ex => {
            exerciseCounter++;
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.id = `exercise-${exerciseCounter}`;
            
            exerciseItem.innerHTML = `
                <div class="exercise-item-header">
                    <h4>Exercise ${exerciseCounter}</h4>
                    <button class="remove-exercise-btn" onclick="removeExercise(${exerciseCounter})">Remove</button>
                </div>
                <div class="exercise-fields">
                    <div>
                        <label>Exercise Name</label>
                        <input type="text" class="exercise-name" placeholder="e.g., Bench Press" value="${ex.name || ''}" required>
                    </div>
                    <div>
                        <label>Sets</label>
                        <input type="number" class="exercise-sets" placeholder="" value="${ex.sets || ''}" min="1" required>
                    </div>
                    <div>
                        <label>Reps</label>
                        <input type="number" class="exercise-reps" placeholder="" value="${ex.reps || ''}" min="1" required>
                    </div>
                    <div>
                        <label>Weight (lbs)</label>
                        <input type="number" class="exercise-weight" placeholder="" value="${ex.weight || ''}" min="0" step="2.5">
                    </div>
                </div>
            `;
            
            exercisesList.appendChild(exerciseItem);
        });
    }
    
    // Store workout ID for updating
    window.editingWorkoutId = workoutId;
    
    // Change save button text and show cancel button
    if (saveWorkoutBtn) {
        saveWorkoutBtn.textContent = 'Update Workout';
    }
    if (cancelEditBtn) {
        cancelEditBtn.classList.remove('hidden');
    }
}

// Helper function to calculate volume from exercise
function calculateExerciseVolume(exercise) {
    if (!exercise.weight) return 0;
    
    const sets = parseInt(exercise.sets) || 1;
    const repsStr = exercise.reps.toString();
    // Extract numeric value from reps (handles "10 each", "10", etc.)
    const repsMatch = repsStr.match(/\d+/);
    const reps = repsMatch ? parseInt(repsMatch[0]) : 1;
    
    // Convert weight description to numeric estimate
    let weight = 0;
    if (typeof exercise.weight === 'number') {
        weight = exercise.weight;
    } else if (exercise.weight === 'light') {
        weight = 45; // Estimate for light weight
    } else if (exercise.weight === 'moderate') {
        weight = 95; // Estimate for moderate weight
    } else if (exercise.weight === 'heavy') {
        weight = 135; // Estimate for heavy weight
    }
    
    return sets * reps * weight;
}

async function saveGeneratedWOD() {
    if (!db) {
        alert('Firebase is not configured. Please set up your Firebase config to save workouts.');
        return;
    }
    if (!currentUser) {
        alert('Please login to save workouts');
        return;
    }

    if (!window.currentGeneratedWOD) {
        alert('No workout to save');
        return;
    }

    try {
        const exercises = window.currentGeneratedWOD.exercises.map(ex => ({
            name: ex.name,
            sets: parseInt(ex.sets),
            reps: ex.reps,
            weight: ex.weight || null,
            rest: ex.rest
        }));

        const totalVolume = exercises.reduce((sum, ex) => sum + calculateExerciseVolume(ex), 0);

        const workoutData = {
            ...window.currentGeneratedWOD,
            userId: currentUser.uid,
            timestamp: serverTimestamp(),
            exercises: exercises,
            totalVolume: totalVolume
        };

        await addDoc(collection(db, 'workouts'), workoutData);
        alert('Workout saved!');
        await loadWorkouts();
        navigateTo('history');
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout. Please try again.');
    }
}

// Load Workouts
async function loadWorkouts() {
    if (!db || !currentUser) {
        workouts = [];
        return;
    }

    try {
        const workoutsQuery = query(
            collection(db, 'workouts'),
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(workoutsQuery);
        workouts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
            };
        });
        
        updateExerciseSelect();
        updateDashboard();
    } catch (error) {
        console.error('Error loading workouts:', error);
        // If error is about missing index, try querying without orderBy first
        if (error.code === 'failed-precondition') {
            console.warn('Firestore index required. Trying query without orderBy...');
            try {
                const simpleQuery = query(
                    collection(db, 'workouts'),
                    where('userId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(simpleQuery);
                workouts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
                    };
                }).sort((a, b) => b.timestamp - a.timestamp);
                updateExerciseSelect();
                updateDashboard();
            } catch (fallbackError) {
                console.error('Fallback query also failed:', fallbackError);
                workouts = [];
            }
        } else {
            workouts = [];
        }
    }
}

// Dashboard
function updateDashboard() {
    document.getElementById('total-workouts').textContent = workouts.length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekWorkouts = workouts.filter(w => w.timestamp >= weekAgo).length;
    document.getElementById('week-workouts').textContent = weekWorkouts;

    const totalVolume = workouts.reduce((sum, workout) => {
        return sum + (workout.totalVolume || 0);
    }, 0);
    document.getElementById('total-volume').textContent = totalVolume.toLocaleString();

    const exerciseCounts = {};
    workouts.forEach(workout => {
        if (workout.exercises) {
            workout.exercises.forEach(ex => {
                exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
            });
        }
    });

    const favoriteExercise = Object.keys(exerciseCounts).reduce((a, b) => 
        exerciseCounts[a] > exerciseCounts[b] ? a : b, 'None'
    );
    document.getElementById('favorite-exercise').textContent = favoriteExercise;
}

// Progress Chart
function updateExerciseSelect() {
    const exercises = new Set();
    workouts.forEach(workout => {
        if (workout.exercises) {
            workout.exercises.forEach(ex => exercises.add(ex.name));
        }
    });

    exerciseSelect.innerHTML = '<option value="">Select an exercise...</option>';
    exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        exerciseSelect.appendChild(option);
    });

    updateProgressChart();
}

function updateProgressChart() {
    const selectedExercise = exerciseSelect ? exerciseSelect.value : '';
    const selectedMetric = metricSelect ? metricSelect.value : 'maxWeight';
    const ctx = document.getElementById('progress-chart');

    if (!selectedExercise) {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        const canvas = ctx.getContext('2d');
        if (canvas) canvas.clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    if (progressChart) {
        progressChart.destroy();
    }

    // Group data by date
    let chartDataByDate = {};
    
    workouts.forEach(workout => {
        if (!workout.exercises) return;
        
        const date = workout.timestamp.toISOString().split('T')[0];
        
        workout.exercises.forEach(ex => {
            if (ex.name === selectedExercise) {
                if (!chartDataByDate[date]) {
                    chartDataByDate[date] = { maxWeight: 0, volume: 0, weights: [] };
                }
                
                const weight = ex.weight || 0;
                const sets = ex.sets || 1;
                const reps = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps) || 1;
                
                // Track max weight
                if (weight > chartDataByDate[date].maxWeight) {
                    chartDataByDate[date].maxWeight = weight;
                }
                
                // Track volume
                chartDataByDate[date].volume += sets * reps * weight;
                
                // Track weights for average
                chartDataByDate[date].weights.push(weight);
            }
        });
    });

    // Convert to chart format
    const sortedDates = Object.keys(chartDataByDate).sort();
    const labels = sortedDates;
    const data = sortedDates.map(date => {
        switch(selectedMetric) {
            case 'maxWeight':
                return chartDataByDate[date].maxWeight || 0;
            case 'volume':
                return chartDataByDate[date].volume || 0;
            case 'avgWeight':
                const weights = chartDataByDate[date].weights || [];
                return weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
            default:
                return 0;
        }
    });

    const metricLabels = {
        'maxWeight': 'Max Weight (lbs)',
        'volume': 'Total Volume (lbs)',
        'avgWeight': 'Average Weight (lbs)'
    };

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${selectedExercise} - ${metricLabels[selectedMetric]}`,
                data: data,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#6366f1',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: selectedMetric === 'volume' ? true : false,
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// This function is now defined above - removing duplicate

// History
function renderHistory() {
    if (!historyList) {
        return;
    }
    
    const searchTerm = historySearch ? historySearch.value.toLowerCase() : '';
    const sortOrder = historySort ? historySort.value : 'newest';

    let filteredWorkouts = workouts.filter(workout => {
        if (!searchTerm) return true;
        const exerciseNames = workout.exercises?.map(ex => ex.name.toLowerCase()).join(' ') || '';
        return exerciseNames.includes(searchTerm) || workout.type?.toLowerCase().includes(searchTerm);
    });

    if (sortOrder === 'oldest') {
        filteredWorkouts = filteredWorkouts.reverse();
    }

    historyList.innerHTML = '';

    if (filteredWorkouts.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No workouts found</p>';
        return;
    }

    filteredWorkouts.forEach(workout => {
        const exerciseNames = workout.exercises?.map(ex => ex.name) || [];
        const uniqueExercises = [...new Set(exerciseNames)];
        const totalExercises = workout.exercises?.length || 0;
        const totalVolume = workout.totalVolume || 0;

        const date = workout.timestamp.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const item = document.createElement('div');
        item.className = 'history-item';
        item.setAttribute('data-workout-id', workout.id);
        item.innerHTML = `
            <div class="history-header">
                <div class="history-date">${date}</div>
                <div class="history-actions">
                    <button class="btn-icon" onclick="toggleWorkoutDetails('${workout.id}')" title="View Details">
                        <span class="expand-icon">▼</span>
                    </button>
                    <button class="btn-icon edit-btn" onclick="editWorkout('${workout.id}')" title="Edit Workout">
                        ✏️
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteWorkout('${workout.id}')" title="Delete Workout">
                        🗑️
                    </button>
                </div>
                <div class="history-meta">
                    <div class="meta-item">
                        <span class="meta-label">Type</span>
                        <span class="meta-value">${workout.type || 'Workout'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Exercises</span>
                        <span class="meta-value">${totalExercises}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Volume</span>
                        <span class="meta-value">${totalVolume.toLocaleString()} lbs</span>
                    </div>
                </div>
            </div>
            <div class="history-exercises-preview">
                <div class="exercise-tags">
                    ${uniqueExercises.map(name => `<span class="exercise-tag">${name}</span>`).join('')}
                </div>
            </div>
            <div class="workout-details hidden" id="details-${workout.id}">
                <div class="exercises-detail-list">
                    ${workout.exercises?.map((ex, idx) => `
                        <div class="exercise-detail-item">
                            <div class="exercise-detail-header">
                                <h4>${ex.name}</h4>
                            </div>
                            <div class="exercise-detail-stats">
                                <div class="detail-stat">
                                    <span class="detail-label">Sets:</span>
                                    <span class="detail-value">${ex.sets}</span>
                                </div>
                                <div class="detail-stat">
                                    <span class="detail-label">Reps:</span>
                                    <span class="detail-value">${ex.reps}</span>
                                </div>
                                ${ex.weight ? `
                                <div class="detail-stat">
                                    <span class="detail-label">Weight:</span>
                                    <span class="detail-value">${ex.weight} lbs</span>
                                </div>
                                ` : ''}
                                <div class="detail-stat">
                                    <span class="detail-label">Volume:</span>
                                    <span class="detail-value">${(ex.sets * (typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps)) * (ex.weight || 0)).toLocaleString()} lbs</span>
                                </div>
                            </div>
                        </div>
                    `).join('') || '<p>No exercises found</p>'}
                </div>
            </div>
        `;
        historyList.appendChild(item);
    });
}

// Initialize dashboard on load
setTimeout(() => {
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        updateDashboard();
    }
}, 500);

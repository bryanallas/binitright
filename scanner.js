// Scanner Logic for Bin It Right
// Using Google's Teachable Machine

// Configuration
const MODEL_URL = './model/'; // Update with your model path
let model, webcam, labelContainer, maxPredictions;
let currentPrediction = null;
let scanning = false;

// Points system
const POINTS = {
    general: 3,
    recycling: 5,
    compost: 5,
    ewaste: 5,
    wrong: 1
};

// UI Elements
const startView = document.getElementById('startView');
const cameraView = document.getElementById('cameraView');
const quizView = document.getElementById('quizView');
const resultView = document.getElementById('resultView');
const startScanBtn = document.getElementById('startScanBtn');
const scanAnotherBtn = document.getElementById('scanAnotherBtn');

// Event Listeners
startScanBtn.addEventListener('click', startScanning);
scanAnotherBtn.addEventListener('click', resetScanner);

// Bin option buttons
document.querySelectorAll('.bin-option').forEach(btn => {
    btn.addEventListener('click', () => handleBinSelection(btn.dataset.bin));
});

// Start scanning
async function startScanning() {
    try {
        await initCamera();
        showView('camera');
        scanning = true;
        await loadModel();
        startPredicting();
    } catch (error) {
        console.error('Error starting scanner:', error);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
}

// Initialize camera
async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        } 
    });
    
    const video = document.getElementById('webcam');
    video.srcObject = stream;
    
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            video.play();
            resolve();
        };
    });
}

// Load Teachable Machine model
async function loadModel() {
    // TODO: Replace with your actual Teachable Machine model
    // For now, we'll use a placeholder that simulates the model
    console.log('Loading model...');
    
    // Simulated model loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, use:
    // const modelURL = MODEL_URL + 'model.json';
    // const metadataURL = MODEL_URL + 'metadata.json';
    // model = await tmImage.load(modelURL, metadataURL);
    // maxPredictions = model.getTotalClasses();
}

// Start predicting
async function startPredicting() {
    if (!scanning) return;
    
    // Simulate prediction - replace with actual model prediction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated prediction result
    const predictions = simulatePrediction();
    const topPrediction = predictions[0];
    
    // Check if it's actually trash
    if (topPrediction.className === 'not-trash' && topPrediction.probability > 0.7) {
        // Keep scanning
        document.getElementById('predicting').innerHTML = `
            <div class="spinner"></div>
            <p>Please show a waste item...</p>
        `;
        setTimeout(() => startPredicting(), 1000);
    } else {
        // Found trash, stop camera and show quiz
        currentPrediction = topPrediction;
        stopCamera();
        showQuiz();
    }
}

// Simulate prediction (replace with actual Teachable Machine code)
function simulatePrediction() {
    const classes = [
        { className: 'general', probability: Math.random() },
        { className: 'recycling', probability: Math.random() },
        { className: 'compost', probability: Math.random() },
        { className: 'ewaste', probability: Math.random() },
        { className: 'not-trash', probability: Math.random() * 0.3 }
    ];
    
    classes.sort((a, b) => b.probability - a.probability);
    return classes;
}

// Stop camera
function stopCamera() {
    const video = document.getElementById('webcam');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    scanning = false;
}

// Show quiz view
function showQuiz() {
    showView('quiz');
}

// Handle bin selection
async function handleBinSelection(selectedBin) {
    const correctBin = currentPrediction.className;
    const isCorrect = selectedBin === correctBin;
    
    // Calculate points
    const points = isCorrect ? POINTS[selectedBin] : POINTS.wrong;
    
    // Save scan data
    await saveScanData(selectedBin, correctBin, points);
    
    // Show result
    showResult(isCorrect, correctBin, points);
}

// Save scan data
async function saveScanData(selectedBin, correctBin, points) {
    const scanData = {
        timestamp: Date.now(),
        selectedBin,
        correctBin,
        points,
        correct: selectedBin === correctBin
    };
    
    // Check if user is logged in
    const user = localStorage.getItem('binItRight_user');
    
    if (user) {
        // Save to user's account (Firebase)
        // TODO: Implement Firebase save
        console.log('Saving to user account:', scanData);
    }
    
    // Always save to community stats
    // TODO: Implement Firebase community stats update
    console.log('Updating community stats:', scanData);
    
    // Update local storage for now
    updateLocalStats(scanData);
}

// Update local storage stats
function updateLocalStats(scanData) {
    let stats = JSON.parse(localStorage.getItem('binItRight_communityStats') || '{}');
    
    stats.totalScans = (stats.totalScans || 0) + 1;
    stats.totalPoints = (stats.totalPoints || 0) + scanData.points;
    stats[scanData.correctBin] = (stats[scanData.correctBin] || 0) + 1;
    
    localStorage.setItem('binItRight_communityStats', JSON.stringify(stats));
}

// Show result
function showResult(isCorrect, correctBin, points) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const pointsEarned = document.getElementById('pointsEarned');
    const loginPrompt = document.getElementById('loginPrompt');
    
    const binNames = {
        general: 'General Waste',
        recycling: 'Recycling',
        compost: 'Compost',
        ewaste: 'E-Waste'
    };
    
    const binIcons = {
        general: '🗑️',
        recycling: '♻️',
        compost: '🌱',
        ewaste: '🔌'
    };
    
    if (isCorrect) {
        resultIcon.textContent = '✅';
        resultTitle.textContent = 'Correct!';
        resultMessage.textContent = `Great job! This item belongs in ${binNames[correctBin]}.`;
    } else {
        resultIcon.textContent = '❌';
        resultTitle.textContent = 'Not quite...';
        resultMessage.textContent = `This item actually belongs in ${binNames[correctBin]} ${binIcons[correctBin]}. Keep learning!`;
    }
    
    pointsEarned.textContent = `+${points}`;
    
    // Show login prompt if not logged in
    const user = localStorage.getItem('binItRight_user');
    if (!user) {
        loginPrompt.style.display = 'block';
    }
    
    showView('result');
}

// Reset scanner
function resetScanner() {
    currentPrediction = null;
    showView('start');
}

// Show specific view
function showView(viewName) {
    const views = {
        start: startView,
        camera: cameraView,
        quiz: quizView,
        result: resultView
    };
    
    Object.values(views).forEach(view => view.classList.remove('active'));
    views[viewName].classList.add('active');
}

// Check auth status on page load
function checkAuthStatus() {
    const user = localStorage.getItem('binItRight_user');
    const lockIcon = document.getElementById('statsLock');
    
    if (user) {
        lockIcon.style.display = 'none';
    }
}

checkAuthStatus();
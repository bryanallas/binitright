// Scanner Logic for Bin It Right
// Using Google's Teachable Machine

// Configuration - UPDATE THIS WITH YOUR MODEL PATH
const MODEL_URL = './model/'; // Change to './my_model/' if that's your folder name
let model, webcam, maxPredictions;
let currentPrediction = null;
let cameraReady = false;

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
const analyzingView = document.getElementById('analyzingView');
const quizView = document.getElementById('quizView');
const resultView = document.getElementById('resultView');
const startCameraBtn = document.getElementById('startCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const scanAnotherBtn = document.getElementById('scanAnotherBtn');

// Event Listeners
startCameraBtn.addEventListener('click', enableCamera);
captureBtn.addEventListener('click', captureAndAnalyze);
scanAnotherBtn.addEventListener('click', resetScanner);

// Bin option buttons
document.querySelectorAll('.bin-option').forEach(btn => {
    btn.addEventListener('click', () => handleBinSelection(btn.dataset.bin));
});

// Enable camera
async function enableCamera() {
    try {
        startCameraBtn.disabled = true;
        startCameraBtn.textContent = 'Loading...';
        
        // Load model first
        await loadModel();
        
        // Initialize camera
        await initCamera();
        
        cameraReady = true;
        showView('camera');
    } catch (error) {
        console.error('Error enabling camera:', error);
        alert('Unable to access camera or load model. Please check: 1) Camera permissions granted, 2) Model files in correct folder');
        startCameraBtn.disabled = false;
        startCameraBtn.textContent = 'Enable Camera';
    }
}

// Load Teachable Machine model
async function loadModel() {
    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';
    
    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    console.log('Model loaded successfully. Classes:', maxPredictions);
}

// Initialize camera using Teachable Machine webcam
async function initCamera() {
    const flip = true; // flip camera for mirror effect
    webcam = new tmImage.Webcam(640, 480, flip);
    await webcam.setup({ facingMode: 'environment' }); // Use back camera on mobile
    await webcam.play();
    
    // Start the update loop to show live camera feed
    requestAnimationFrame(updateCamera);
    
    // Replace the existing video element with webcam canvas
    const videoContainer = document.querySelector('.camera-container');
    const existingVideo = document.getElementById('webcam');
    if (existingVideo) {
        existingVideo.style.display = 'none';
    }
    videoContainer.insertBefore(webcam.canvas, videoContainer.firstChild);
}

// Update camera feed continuously
async function updateCamera() {
    if (webcam && cameraReady) {
        webcam.update();
        requestAnimationFrame(updateCamera);
    }
}

// Capture and analyze the current frame
async function captureAndAnalyze() {
    if (!cameraReady || !webcam) {
        alert('Camera not ready. Please wait...');
        return;
    }
    
    try {
        // Show analyzing view
        showView('analyzing');
        
        // Get prediction from current webcam frame
        const predictions = await model.predict(webcam.canvas);
        
        // Sort predictions by probability
        predictions.sort((a, b) => b.probability - a.probability);
        const topPrediction = predictions[0];
        
        console.log('Top prediction:', topPrediction.className, topPrediction.probability);
        
        // Add a small delay for better UX (feels more like it's "analyzing")
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if it's nontrash - if so, ask user to scan a waste item
        const className = topPrediction.className.toLowerCase();
        if (className.includes('nontrash') || className.includes('non-trash') || 
            className.includes('not trash') || className.includes('nottras')) {
            // Not trash - show alert and go back to camera
            alert('No waste item detected. Please position a waste item (trash, recyclables, compost, or e-waste) in the camera and try again.');
            showView('camera');
            return;
        }
        
        // Check if prediction confidence is high enough
        if (topPrediction.probability < 0.5) {
            // Not confident - ask to try again
            alert('Unable to clearly identify the item. Please ensure good lighting and the item is clearly visible, then try again.');
            showView('camera');
            return;
        }
        
        // Valid trash item found!
        currentPrediction = topPrediction;
        showQuiz();
        
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image. Please try again.');
        showView('camera');
    }
}

// Stop camera
function stopCamera() {
    cameraReady = false;
    if (webcam) {
        webcam.stop();
    }
}

// Show quiz view
function showQuiz() {
    showView('quiz');
}

// Handle bin selection
async function handleBinSelection(selectedBin) {
    // Map the prediction class name to our bin types
    const correctBin = mapPredictionToBin(currentPrediction.className);
    const isCorrect = selectedBin === correctBin;
    
    // Calculate points
    const points = isCorrect ? POINTS[selectedBin] : POINTS.wrong;
    
    // Save scan data
    await saveScanData(selectedBin, correctBin, points);
    
    // Show result
    showResult(isCorrect, correctBin, points);
}

// Map Teachable Machine class names to bin types
function mapPredictionToBin(className) {
    const lower = className.toLowerCase();
    
    // Map based on your exact Teachable Machine class names
    if (lower.includes('waste')) {
        return 'general';
    } else if (lower.includes('recycl')) {
        return 'recycling';
    } else if (lower.includes('compost')) {
        return 'compost';
    } else if (lower.includes('ewaste')) {
        return 'ewaste';
    }
    
    // Default to general if can't determine
    return 'general';
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
        // Save to user's account
        const userData = JSON.parse(user);
        const users = JSON.parse(localStorage.getItem('binItRight_users') || '{}');
        const userAccount = users[userData.username];
        
        if (userAccount) {
            // Update user stats
            if (!userAccount.stats) {
                userAccount.stats = {
                    totalPoints: 0,
                    totalItems: 0,
                    general: 0,
                    recycling: 0,
                    compost: 0,
                    ewaste: 0,
                    streak: 0,
                    scans: []
                };
            }
            
            userAccount.stats.totalPoints += points;
            userAccount.stats.totalItems += 1;
            userAccount.stats[correctBin] = (userAccount.stats[correctBin] || 0) + 1;
            userAccount.stats.scans.push(scanData);
            
            // Save back to localStorage
            users[userData.username] = userAccount;
            localStorage.setItem('binItRight_users', JSON.stringify(users));
            
            console.log('User stats updated:', userAccount.stats);
        }
    }
    
    // Always save to community stats
    updateCommunityStats(scanData);
}

// Update community statistics
function updateCommunityStats(scanData) {
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

// Reset scanner - go back to camera view (not start view)
function resetScanner() {
    currentPrediction = null;
    
    // If camera was enabled, go back to camera view
    if (cameraReady) {
        showView('camera');
    } else {
        // Otherwise go to start
        stopCamera();
        showView('start');
        startCameraBtn.disabled = false;
        startCameraBtn.textContent = 'Enable Camera';
    }
}

// Show specific view
function showView(viewName) {
    const views = {
        start: startView,
        camera: cameraView,
        analyzing: analyzingView,
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
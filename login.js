// Login and Authentication Logic
// Using Google Firebase (configuration to be added)

// Firebase configuration (replace with your own config)
// TODO: Set up Firebase project and add config
const firebaseConfig = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "YOUR_AUTH_DOMAIN",
    // projectId: "YOUR_PROJECT_ID",
    // storageBucket: "YOUR_STORAGE_BUCKET",
    // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    // appId: "YOUR_APP_ID"
};

// For now, using local storage simulation
// In production, replace with actual Firebase authentication

let currentMode = 'signin';

// Get form elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('messageBox');

// Handle form submission
submitBtn.addEventListener('click', handleSubmit);

// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
});

// Handle form submission
async function handleSubmit() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validation
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Determine which action to perform
    const urlParams = new URLSearchParams(window.location.search);
    currentMode = urlParams.get('mode') || 'signin';
    
    if (submitBtn.textContent === 'Create Account') {
        await handleSignup(username, password);
    } else {
        await handleSignin(username, password);
    }
}

// Handle signup
async function handleSignup(username, password) {
    try {
        // TODO: Replace with Firebase authentication
        // For now, using local storage
        
        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('binItRight_users') || '{}');
        
        if (users[username]) {
            showMessage('Username already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            username,
            password, // In production, this should be hashed
            createdAt: Date.now(),
            stats: {
                totalPoints: 0,
                totalItems: 0,
                general: 0,
                recycling: 0,
                compost: 0,
                ewaste: 0,
                streak: 0,
                lastScanDate: null,
                scans: []
            }
        };
        
        users[username] = newUser;
        localStorage.setItem('binItRight_users', JSON.stringify(users));
        
        // Auto login
        localStorage.setItem('binItRight_user', JSON.stringify({
            username,
            createdAt: newUser.createdAt
        }));
        
        showMessage('Thanks for signing up! Redirecting...', 'success');
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('An error occurred during signup', 'error');
    }
}

// Handle signin
async function handleSignin(username, password) {
    try {
        // TODO: Replace with Firebase authentication
        // For now, using local storage
        
        const users = JSON.parse(localStorage.getItem('binItRight_users') || '{}');
        const user = users[username];
        
        if (!user) {
            showMessage('Username not found', 'error');
            return;
        }
        
        if (user.password !== password) {
            showMessage('Incorrect password', 'error');
            return;
        }
        
        // Login successful
        localStorage.setItem('binItRight_user', JSON.stringify({
            username,
            createdAt: user.createdAt
        }));
        
        showMessage(`Welcome back, ${username}! Redirecting...`, 'success');
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signin error:', error);
        showMessage('An error occurred during signin', 'error');
    }
}

// Show message
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    // Hide after 5 seconds if not redirecting
    if (!text.includes('Redirecting')) {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
}

// Firebase Integration Guide (for production):
// 
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Enable Authentication > Email/Password
// 3. Enable Firestore Database
// 4. Add your Firebase config above
// 5. Include Firebase SDK in your HTML:
//    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
// 
// Example Firebase implementation:
// 
// import { initializeApp } from 'firebase/app';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// 
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// 
// async function firebaseSignup(username, password) {
//     const email = `${username}@binitright.app`; // Convert username to email
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     
//     // Create user document in Firestore
//     await setDoc(doc(db, 'users', userCredential.user.uid), {
//         username,
//         createdAt: Date.now(),
//         stats: { ... }
//     });
// }
// 
// async function firebaseSignin(username, password) {
//     const email = `${username}@binitright.app`;
//     await signInWithEmailAndPassword(auth, email, password);
// }
//
// Security Notes:
// - For GitHub Pages deployment, use environment variables or Firebase hosting
// - Never commit API keys directly to public repositories
// - Use Firebase Security Rules to protect data
// - Consider using Firebase Anonymous Authentication for guest users
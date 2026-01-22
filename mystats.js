// My Stats Page Logic - Personal Statistics
// Using Google Firebase for data tracking

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Check authentication and load data
function checkAuth() {
    const user = localStorage.getItem('binItRight_user');
    
    if (!user) {
        // User not logged in
        document.getElementById('loginRequired').style.display = 'flex';
        document.getElementById('statsContent').style.display = 'none';
        return;
    }
    
    // User is logged in
    document.getElementById('loginRequired').style.display = 'none';
    document.getElementById('statsContent').style.display = 'block';
    
    const userData = JSON.parse(user);
    loadUserStats(userData.username);
    
    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Load user statistics
async function loadUserStats(username) {
    try {
        // TODO: Replace with Firebase Firestore query
        // For now, using local storage
        
        const users = JSON.parse(localStorage.getItem('binItRight_users') || '{}');
        const user = users[username];
        
        if (!user) {
            console.error('User not found');
            return;
        }
        
        const stats = user.stats || {
            totalPoints: 0,
            totalItems: 0,
            general: 0,
            recycling: 0,
            compost: 0,
            ewaste: 0,
            streak: 0,
            scans: []
        };
        
        // Update UI
        document.getElementById('username').textContent = username;
        document.getElementById('userPoints').textContent = stats.totalPoints.toLocaleString();
        document.getElementById('userItems').textContent = stats.totalItems.toLocaleString();
        document.getElementById('userStreak').textContent = stats.streak || 0;
        
        document.getElementById('userGeneral').textContent = stats.general || 0;
        document.getElementById('userRecycling').textContent = stats.recycling || 0;
        document.getElementById('userCompost').textContent = stats.compost || 0;
        document.getElementById('userEwaste').textContent = stats.ewaste || 0;
        
        // Load weekly goals
        generateWeeklyGoals(stats);
        
        // Create activity chart
        createUserActivityChart(stats.scans || []);
        
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Generate random weekly goals
function generateWeeklyGoals(stats) {
    const goalsContainer = document.getElementById('weeklyGoals');
    goalsContainer.innerHTML = '';
    
    // Goal templates
    const goalTemplates = [
        {
            text: 'Scan 20 items this week',
            target: 20,
            current: Math.min(stats.totalItems % 20, 20),
            points: 50
        },
        {
            text: 'Scan 5 recyclable items',
            target: 5,
            current: Math.min(stats.recycling % 5, 5),
            points: 25
        },
        {
            text: 'Maintain a 3-day streak',
            target: 3,
            current: Math.min(stats.streak || 0, 3),
            points: 30
        },
        {
            text: 'Scan 3 compost items',
            target: 3,
            current: Math.min(stats.compost % 3, 3),
            points: 20
        }
    ];
    
    // Shuffle and take 3 goals
    const selectedGoals = goalTemplates.sort(() => Math.random() - 0.5).slice(0, 3);
    
    selectedGoals.forEach(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        const isComplete = progress >= 100;
        
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.innerHTML = `
            <div>
                <div style="font-weight: 600; margin-bottom: 0.5rem;">
                    ${isComplete ? '✅' : '⏳'} ${goal.text}
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    Reward: +${goal.points} points
                </div>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span style="color: var(--primary-green); font-weight: 600; min-width: 60px; text-align: right;">
                    ${goal.current}/${goal.target}
                </span>
            </div>
        `;
        
        goalsContainer.appendChild(goalElement);
    });
}

// Create user activity chart
function createUserActivityChart(scans) {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    
    // Generate data for the last 30 days
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Count scans for this day
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
        
        const dayScans = scans.filter(scan => 
            scan.timestamp >= dayStart && scan.timestamp <= dayEnd
        ).length;
        
        data.push(dayScans);
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Items Scanned',
                data: data,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: '#2ecc71',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 26, 0.95)',
                    titleColor: '#2ecc71',
                    bodyColor: '#ecf0f1',
                    borderColor: '#2ecc71',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `${context.parsed.y} items scanned`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#95a5a6'
                    },
                    grid: {
                        color: 'rgba(61, 90, 61, 0.3)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#95a5a6',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('binItRight_user');
        window.location.href = 'index.html';
    }
}

// Calculate streak
function calculateStreak(scans) {
    if (!scans || scans.length === 0) return 0;
    
    // Sort scans by date (most recent first)
    const sortedScans = [...scans].sort((a, b) => b.timestamp - a.timestamp);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) {
        const dayStart = currentDate.getTime();
        const dayEnd = new Date(currentDate).setHours(23, 59, 59, 999);
        
        const hasScannedToday = sortedScans.some(scan => 
            scan.timestamp >= dayStart && scan.timestamp <= dayEnd
        );
        
        if (hasScannedToday) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Update user stats (call after new scan)
async function updateUserStats(scanData) {
    const user = JSON.parse(localStorage.getItem('binItRight_user'));
    if (!user) return;
    
    const users = JSON.parse(localStorage.getItem('binItRight_users') || '{}');
    const userData = users[user.username];
    
    if (!userData) return;
    
    // Update stats
    userData.stats.totalPoints += scanData.points;
    userData.stats.totalItems += 1;
    userData.stats[scanData.correctBin] = (userData.stats[scanData.correctBin] || 0) + 1;
    
    // Add scan to history
    if (!userData.stats.scans) {
        userData.stats.scans = [];
    }
    userData.stats.scans.push(scanData);
    
    // Update streak
    userData.stats.streak = calculateStreak(userData.stats.scans);
    
    // Save to localStorage
    users[user.username] = userData;
    localStorage.setItem('binItRight_users', JSON.stringify(users));
    
    // TODO: Save to Firebase Firestore
    // await updateDoc(doc(db, 'users', user.uid), {
    //     stats: userData.stats
    // });
}

// Firebase Integration Guide:
//
// 1. User stats structure in Firestore:
// {
//   users: {
//     [userId]: {
//       username: string,
//       stats: {
//         totalPoints: number,
//         totalItems: number,
//         general: number,
//         recycling: number,
//         compost: number,
//         ewaste: number,
//         streak: number,
//         lastScanDate: timestamp,
//         scans: [
//           {
//             timestamp: number,
//             bin: string,
//             points: number,
//             correct: boolean
//           }
//         ]
//       }
//     }
//   }
// }
//
// 2. Real-time updates:
// const auth = getAuth();
// const db = getFirestore();
// 
// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const userDoc = await getDoc(doc(db, 'users', user.uid));
//     loadUserStats(userDoc.data());
//     
//     // Listen for real-time updates
//     onSnapshot(doc(db, 'users', user.uid), (doc) => {
//       loadUserStats(doc.data());
//     });
//   }
// });
//
// 3. Update stats after scan:
// async function updateFirebaseStats(scanData) {
//   const user = auth.currentUser;
//   if (!user) return;
//   
//   const userRef = doc(db, 'users', user.uid);
//   await updateDoc(userRef, {
//     'stats.totalPoints': increment(scanData.points),
//     'stats.totalItems': increment(1),
//     [`stats.${scanData.bin}`]: increment(1),
//     'stats.scans': arrayUnion(scanData)
//   });
// }
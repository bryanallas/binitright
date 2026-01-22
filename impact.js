// Impact Page Logic - Community Statistics and Leaderboards
// Using Google Firebase for data tracking

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCommunityStats();
    loadLeaderboards();
    setupTabs();
    createActivityChart();
});

// Setup tab navigation
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.leaderboard-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            const targetPanel = document.getElementById(btn.dataset.tab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Load community statistics
async function loadCommunityStats() {
    try {
        // TODO: Replace with Firebase Firestore query
        // For now, using simulated/local data
        
        const stats = getSimulatedStats();
        
        // Update stat cards
        document.getElementById('totalItems').textContent = stats.totalItems.toLocaleString();
        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('generalWaste').textContent = stats.general.toLocaleString();
        document.getElementById('recycling').textContent = stats.recycling.toLocaleString();
        document.getElementById('compost').textContent = stats.compost.toLocaleString();
        document.getElementById('ewaste').textContent = stats.ewaste.toLocaleString();
        
    } catch (error) {
        console.error('Error loading community stats:', error);
    }
}

// Load all leaderboards
async function loadLeaderboards() {
    try {
        // TODO: Replace with Firebase Firestore queries
        const leaderboardData = getSimulatedLeaderboards();
        
        populateLeaderboard('pointsLeaderboard', leaderboardData.topPoints, 'points');
        populateLeaderboard('scansLeaderboard', leaderboardData.topScans, 'scans');
        populateLeaderboard('streaksLeaderboard', leaderboardData.topStreaks, 'days');
        populateLeaderboard('weeklyLeaderboard', leaderboardData.topWeekly, 'points', 5);
        
        // Category leaderboards
        populateLeaderboard('recyclingLeaderboard', leaderboardData.topRecycling, 'items', 5);
        populateLeaderboard('compostLeaderboard', leaderboardData.topCompost, 'items', 5);
        populateLeaderboard('generalLeaderboard', leaderboardData.topGeneral, 'items', 5);
        populateLeaderboard('ewasteLeaderboard', leaderboardData.topEwaste, 'items', 5);
        
    } catch (error) {
        console.error('Error loading leaderboards:', error);
    }
}

// Populate a leaderboard
function populateLeaderboard(elementId, data, valueLabel, maxItems = 10) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const items = data.slice(0, maxItems);
    
    items.forEach((item, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        
        const rank = index + 1;
        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        
        leaderboardItem.innerHTML = `
            <span class="leaderboard-rank">${rankEmoji}</span>
            <span class="leaderboard-user">${item.username}</span>
            <span class="leaderboard-value">${item.value.toLocaleString()} ${valueLabel}</span>
        `;
        
        container.appendChild(leaderboardItem);
    });
}

// Create activity chart
function createActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    // Generate data for the last 30 days
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Simulated data - replace with actual Firebase data
        data.push(Math.floor(Math.random() * 5000) + 10000);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Items Scanned',
                data: data,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#2ecc71',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
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
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(61, 90, 61, 0.3)'
                    },
                    ticks: {
                        color: '#95a5a6'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(61, 90, 61, 0.3)'
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

// Simulated data (replace with Firebase queries)
function getSimulatedStats() {
    return {
        totalItems: 1432587,
        totalUsers: 12847,
        general: 423156,
        recycling: 687234,
        compost: 256891,
        ewaste: 65306
    };
}

function getSimulatedLeaderboards() {
    const usernames = [
        'EcoWarrior', 'GreenThumb', 'RecycleKing', 'PlanetSaver', 'WasteWizard',
        'EarthGuardian', 'CompostChamp', 'ZeroWasteHero', 'SustainableSam', 'GreenGoddess',
        'EcoNinja', 'TrashTitan', 'RecycleRanger', 'NatureLover', 'CleanQueen',
        'GreenGiant', 'WasteWarrior', 'EcoExpert', 'PlanetProtector', 'RecycleRebel'
    ];
    
    function generateLeaderboard(maxValue) {
        return usernames.map(username => ({
            username,
            value: Math.floor(Math.random() * maxValue) + Math.floor(maxValue * 0.1)
        })).sort((a, b) => b.value - a.value);
    }
    
    return {
        topPoints: generateLeaderboard(50000),
        topScans: generateLeaderboard(10000),
        topStreaks: generateLeaderboard(365),
        topWeekly: generateLeaderboard(1000),
        topRecycling: generateLeaderboard(5000),
        topCompost: generateLeaderboard(3000),
        topGeneral: generateLeaderboard(4000),
        topEwaste: generateLeaderboard(1000)
    };
}

// Firebase Integration Guide:
// 
// 1. Set up Firestore collections:
//    - 'communityStats': { totalScans, general, recycling, compost, ewaste, totalUsers }
//    - 'users': { username, stats: { totalPoints, totalItems, streak, etc } }
//    - 'scans': { userId, timestamp, bin, points, correct }
//
// 2. Query examples:
//
// async function loadFirebaseStats() {
//     const db = getFirestore();
//     const statsDoc = await getDoc(doc(db, 'communityStats', 'global'));
//     return statsDoc.data();
// }
//
// async function loadTopPointsLeaderboard() {
//     const db = getFirestore();
//     const q = query(
//         collection(db, 'users'),
//         orderBy('stats.totalPoints', 'desc'),
//         limit(10)
//     );
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map(doc => ({
//         username: doc.data().username,
//         value: doc.data().stats.totalPoints
//     }));
// }
//
// 3. Real-time updates with onSnapshot:
//
// onSnapshot(doc(db, 'communityStats', 'global'), (doc) => {
//     updateStatsUI(doc.data());
// });
// Admin credentials
const ADMIN_CREDENTIALS = {
    username: "Pksss",
    password: "654321"
};

// Global variables
let isTopperListOpen = false;
let currentToppers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 2000);

        // Setup real-time listeners
        setupRealTimeListeners();
        
        // Load initial data
        await loadDatabaseStats();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing application', 'error');
    }
}

// Real-time listeners setup
function setupRealTimeListeners() {
    // Toppers real-time listener
    const toppersRef = ref(database, 'toppers');
    onValue(toppersRef, (snapshot) => {
        if (snapshot.exists()) {
            currentToppers = Object.values(snapshot.val());
            if (isTopperListOpen) {
                displayToppers(currentToppers);
            }
            updateTopperCount();
        } else {
            currentToppers = [];
            if (isTopperListOpen) {
                document.getElementById('topperList').innerHTML = 
                    '<div class="loading">No toppers found. Admin can upload topper list.</div>';
            }
            updateTopperCount();
        }
        updateDatabaseStats();
    });

    // Results real-time listener
    const resultsRef = ref(database, 'results');
    onValue(resultsRef, (snapshot) => {
        updateDatabaseStats();
    });
}

// Topper List Functions
async function toggleTopperList() {
    const topperListContainer = document.getElementById('topperListContainer');
    
    if (!isTopperListOpen) {
        if (currentToppers.length === 0) {
            await loadToppers();
        } else {
            displayToppers(currentToppers);
        }
        topperListContainer.style.display = 'block';
        isTopperListOpen = true;
    } else {
        topperListContainer.style.display = 'none';
        isTopperListOpen = false;
    }
}

async function loadToppers() {
    const topperList = document.getElementById('topperList');
    topperList.innerHTML = '<div class="loading">Loading toppers...</div>';
    
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'toppers'));
        
        if (snapshot.exists()) {
            const toppers = snapshot.val();
            currentToppers = Object.values(toppers);
            displayToppers(currentToppers);
        } else {
            topperList.innerHTML = '<div class="loading">No toppers found. Admin can upload topper list.</div>';
        }
    } catch (error) {
        console.error('Error loading toppers:', error);
        topperList.innerHTML = '<div class="loading">Error loading toppers. Please try again.</div>';
    }
}

function displayToppers(toppers) {
    const topperList = document.getElementById('topperList');
    
    // Sort toppers by rank
    const sortedToppers = toppers.sort((a, b) => a.rank - b.rank);
    
    topperList.innerHTML = '';
    
    if (sortedToppers.length === 0) {
        topperList.innerHTML = '<div class="loading">No toppers found. Admin can upload topper list.</div>';
        return;
    }
    
    sortedToppers.forEach((topper) => {
        const topperItem = document.createElement('div');
        topperItem.className = `topper-item rank-${topper.rank <= 3 ? topper.rank : 'other'}`;
        
        topperItem.innerHTML = `
            <div class="topper-info">
                <div class="rank-badge">${topper.rank}</div>
                <div class="topper-details">
                    <span class="topper-name">${topper.name}</span>
                    <span class="topper-rank">Rank: ${topper.rank}</span>
                </div>
            </div>
            <span class="topper-marks">${topper.marks}/100</span>
        `;
        
        topperList.appendChild(topperItem);
    });
    
    updateTopperCount();
}

function updateTopperCount() {
    const count = currentToppers.length;
    document.getElementById('topperCount').textContent = 
        `${count} ${count === 1 ? 'student' : 'students'}`;
}

// Check Result Function
async function checkResult() {
    const name = document.getElementById('studentName').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    
    if (!name || !rollNumber) {
        showNotification('Please enter both name and roll number', 'warning');
        return;
    }
    
    showLoading('Checking result...');
    
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `results/${rollNumber}`));
        
        if (snapshot.exists()) {
            const result = snapshot.val();
            
            // Check if name matches (case insensitive)
            if (result.name.toLowerCase() !== name.toLowerCase()) {
                showNotification('Name does not match with roll number! Please check your details.', 'error');
                hideLoading();
                return;
            }
            
            // Display result
            displayResult(result, rollNumber);
            hideLoading();
            
        } else {
            hideLoading();
            showNotification('Result not found! Please check your name and roll number.', 'error');
        }
    } catch (error) {
        console.error('Error fetching result:', error);
        hideLoading();
        showNotification('Error fetching result. Please try again.', 'error');
    }
}

function displayResult(result, rollNumber) {
    document.getElementById('resultName').textContent = result.name;
    document.getElementById('resultRoll').textContent = rollNumber;
    document.getElementById('resultMarks').textContent = result.marks;
    
    // Calculate grade and status
    const grade = calculateGrade(result.marks);
    const status = result.marks >= 33 ? 'Pass' : 'Fail';
    
    document.getElementById('resultGrade').textContent = grade;
    document.getElementById('resultStatus').textContent = status;
    
    // Update status badge
    const statusBadge = document.getElementById('resultStatusBadge');
    statusBadge.textContent = status;
    statusBadge.style.background = status === 'Pass' ? 'var(--success)' : 'var(--danger)';
    
    // Show result section
    document.getElementById('checkResultSection').style.display = 'none';
    document.getElementById('resultDetails').style.display = 'block';
    
    showNotification('Result loaded successfully!', 'success');
}

// Calculate Grade Function
function calculateGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    if (marks >= 33) return 'E';
    return 'F';
}

// Cancel Result Function
function cancelResult() {
    document.getElementById('checkResultSection').style.display = 'block';
    document.getElementById('resultDetails').style.display = 'none';
    document.getElementById('studentName').value = '';
    document.getElementById('rollNumber').value = '';
}

// Download PDF Function
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // School Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('MM Public School Mundeshwari', 105, 20, null, null, 'center');
    
    // Result Details Heading
    doc.setFontSize(16);
    doc.text('Academic Result 2024', 105, 35, null, null, 'center');
    
    // Line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 42, 190, 42);
    
    // Box
    doc.rect(15, 50, 180, 80);
    
    // Result Information
    doc.setFontSize(12);
    doc.text(`Student Name: ${document.getElementById('resultName').textContent}`, 25, 65);
    doc.text(`Roll Number: ${document.getElementById('resultRoll').textContent}`, 25, 75);
    doc.text(`Marks Obtained: ${document.getElementById('resultMarks').textContent}/100`, 25, 85);
    doc.text(`Grade: ${document.getElementById('resultGrade').textContent}`, 25, 95);
    doc.text(`Status: ${document.getElementById('resultStatus').textContent}`, 25, 105);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by MM Public School Result Portal', 105, 140, null, null, 'center');
    doc.text(new Date().toLocaleDateString(), 105, 145, null, null, 'center');
    
    // Save PDF
    const fileName = `MMPS_Result_${document.getElementById('resultRoll').textContent}.pdf`;
    doc.save(fileName);
    showNotification('PDF downloaded successfully!', 'success');
}

// Admin Functions
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminPassword').value = '';
        showNotification('Admin login successful!', 'success');
    } else {
        showNotification('Invalid username or password!', 'error');
    }
}

function adminLogout() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    showNotification('Admin logout successful!', 'success');
}

async function uploadResult() {
    const name = document.getElementById('uploadName').value.trim();
    const roll = document.getElementById('uploadRoll').value.trim();
    const marks = parseInt(document.getElementById('uploadMarks').value);
    
    if (!name || !roll || isNaN(marks)) {
        showNotification('Please fill all fields correctly!', 'warning');
        return;
    }
    
    if (marks < 0 || marks > 100) {
        showNotification('Marks should be between 0 and 100!', 'warning');
        return;
    }
    
    showLoading('Uploading result...');
    
    try {
        // Check if result already exists
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `results/${roll}`));
        
        if (snapshot.exists()) {
            if (!confirm('Result for this roll number already exists. Do you want to update it?')) {
                hideLoading();
                return;
            }
        }
        
        await set(ref(database, `results/${roll}`), {
            name: name,
            marks: marks,
            timestamp: Date.now()
        });
        
        hideLoading();
        showNotification('Result uploaded successfully!', 'success');
        
        // Clear fields
        document.getElementById('uploadName').value = '';
        document.getElementById('uploadRoll').value = '';
        document.getElementById('uploadMarks').value = '';
        
    } catch (error) {
        console.error('Error uploading result:', error);
        hideLoading();
        showNotification('Error uploading result!', 'error');
    }
}

async function removeAllResults() {
    if (confirm('Are you sure you want to remove ALL results? This action cannot be undone!')) {
        showLoading('Removing all results...');
        
        try {
            await remove(ref(database, 'results'));
            hideLoading();
            showNotification('All results removed successfully!', 'success');
        } catch (error) {
            console.error('Error removing results:', error);
            hideLoading();
            showNotification('Error removing results!', 'error');
        }
    }
}

async function uploadTopper() {
    const name = document.getElementById('topperName').value.trim();
    const marks = parseInt(document.getElementById('topperMarks').value);
    const rank = parseInt(document.getElementById('topperRank').value);
    
    if (!name || isNaN(marks) || isNaN(rank)) {
        showNotification('Please fill all fields correctly!', 'warning');
        return;
    }
    
    if (marks < 0 || marks > 100) {
        showNotification('Marks should be between 0 and 100!', 'warning');
        return;
    }
    
    if (rank < 1) {
        showNotification('Rank should be 1 or greater!', 'warning');
        return;
    }
    
    showLoading('Uploading topper...');
    
    try {
        // Check if topper with same rank already exists
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `toppers/rank${rank}`));
        
        if (snapshot.exists()) {
            if (!confirm(`Topper with rank ${rank} already exists. Do you want to update it?`)) {
                hideLoading();
                return;
            }
        }
        
        await set(ref(database, `toppers/rank${rank}`), {
            name: name,
            marks: marks,
            rank: rank,
            timestamp: Date.now()
        });
        
        hideLoading();
        showNotification('Topper uploaded successfully!', 'success');
        
        // Clear fields
        document.getElementById('topperName').value = '';
        document.getElementById('topperMarks').value = '';
        document.getElementById('topperRank').value = '';
        
    } catch (error) {
        console.error('Error uploading topper:', error);
        hideLoading();
        showNotification('Error uploading topper!', 'error');
    }
}

async function removeAllToppers() {
    if (confirm('Are you sure you want to remove ALL toppers? This action cannot be undone!')) {
        showLoading('Removing all toppers...');
        
        try {
            await remove(ref(database, 'toppers'));
            hideLoading();
            showNotification('All toppers removed successfully!', 'success');
        } catch (error) {
            console.error('Error removing toppers:', error);
            hideLoading();
            showNotification('Error removing toppers!', 'error');
        }
    }
}

// Database Statistics
async function loadDatabaseStats() {
    await updateDatabaseStats();
}

async function updateDatabaseStats() {
    try {
        const dbRef = ref(database);
        
        // Count results
        const resultsSnapshot = await get(child(dbRef, 'results'));
        const resultsCount = resultsSnapshot.exists() ? Object.keys(resultsSnapshot.val()).length : 0;
        document.getElementById('totalResults').textContent = resultsCount;
        
        // Count toppers
        const toppersSnapshot = await get(child(dbRef, 'toppers'));
        const toppersCount = toppersSnapshot.exists() ? Object.keys(toppersSnapshot.val()).length : 0;
        document.getElementById('totalToppers').textContent = toppersCount;
        
    } catch (error) {
        console.error('Error updating database stats:', error);
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: var(--success); }
            .notification-error { background: var(--danger); }
            .notification-warning { background: var(--warning); color: black; }
            .notification-info { background: var(--info); }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showLoading(message = 'Loading...') {
    // You can implement a loading spinner here
    console.log(message);
}

function hideLoading() {
    // Hide loading spinner
    console.log('Loading complete');
}
// script.js
// Data storage with Firebase
let studentResults = [];
let studentAdmitCards = [];

// Check if Firebase is ready
function isFirebaseReady() {
    return window.firebaseReady && window.firebase && window.firebase.database;
}

// Save data to Firebase
async function saveDataToFirebase() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return false;
    }
    
    try {
        await window.firebase.set(window.firebase.ref(window.firebase.database, 'schoolData'), {
            results: studentResults,
            admitCards: studentAdmitCards,
            lastUpdated: new Date().toISOString()
        });
        console.log('✅ Data saved to Firebase successfully!');
        updateDataStatus();
        return true;
    } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
        alert('Error saving data. Please check your connection.');
        return false;
    }
}

// Load data from Firebase
async function loadDataFromFirebase() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return false;
    }
    
    try {
        showLoading('checkResult');
        const snapshot = await window.firebase.get(window.firebase.child(window.firebase.ref(window.firebase.database), 'schoolData'));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            studentResults = data.results || [];
            studentAdmitCards = data.admitCards || [];
            console.log('✅ Data loaded from Firebase successfully!');
            console.log('Results:', studentResults.length);
            console.log('Admit Cards:', studentAdmitCards.length);
        } else {
            console.log('ℹ️ No data available in Firebase');
            studentResults = [];
            studentAdmitCards = [];
        }
        updateDataStatus();
        hideLoading('checkResult');
        return true;
    } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        hideLoading('checkResult');
        alert('Error loading data. Please check your connection.');
        return false;
    }
}

// Show loading indicator
function showLoading(type) {
    if (type === 'checkResult') {
        document.getElementById('checkResultText').style.display = 'none';
        document.getElementById('checkResultLoading').style.display = 'inline-block';
        document.getElementById('checkResultBtn').disabled = true;
    } else if (type === 'checkAdmit') {
        document.getElementById('checkAdmitText').style.display = 'none';
        document.getElementById('checkAdmitLoading').style.display = 'inline-block';
        document.getElementById('checkAdmitBtn').disabled = true;
    }
}

// Hide loading indicator
function hideLoading(type) {
    if (type === 'checkResult') {
        document.getElementById('checkResultText').style.display = 'inline-block';
        document.getElementById('checkResultLoading').style.display = 'none';
        document.getElementById('checkResultBtn').disabled = false;
    } else if (type === 'checkAdmit') {
        document.getElementById('checkAdmitText').style.display = 'inline-block';
        document.getElementById('checkAdmitLoading').style.display = 'none';
        document.getElementById('checkAdmitBtn').disabled = false;
    }
}

// Update data status display
function updateDataStatus() {
    document.getElementById('totalResults').textContent = studentResults.length;
    document.getElementById('totalAdmitCards').textContent = studentAdmitCards.length;
    
    // Update connection status
    const statusElement = document.getElementById('firebaseStatus');
    if (isFirebaseReady()) {
        statusElement.textContent = "Connected ✅";
        statusElement.style.color = "green";
    } else {
        statusElement.textContent = "Connecting...";
        statusElement.style.color = "orange";
    }
}

// Initialize app when Firebase is ready
window.initApp = async function() {
    console.log("🚀 Initializing application...");
    await loadDataFromFirebase();
    
    // Add sample data if empty (for testing)
    if (studentResults.length === 0) {
        console.log("📝 Adding sample data...");
        studentResults = [
            { name: "Rahul Kumar", roll: "2025001", marks: 85, createdAt: new Date().toISOString() },
            { name: "Priya Singh", roll: "2025002", marks: 92, createdAt: new Date().toISOString() },
            { name: "Amit Sharma", roll: "2025003", marks: 78, createdAt: new Date().toISOString() }
        ];
        await saveDataToFirebase();
    }
    
    updateDataStatus();
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM loaded, waiting for Firebase...");
    
    // Check if Firebase is already ready
    if (isFirebaseReady()) {
        window.initApp();
    } else {
        // Wait for Firebase to be ready
        const checkInterval = setInterval(() => {
            if (isFirebaseReady()) {
                clearInterval(checkInterval);
                window.initApp();
            }
        }, 100);
    }
});

// ... (Rest of your functions remain the same - checkResult, checkAdmit, login, etc.)

// Check Result Functionality
document.getElementById('checkResultBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const name = document.getElementById('studentName').value.trim();
    const roll = document.getElementById('rollNumber').value.trim();
    const resultDisplay = document.getElementById('resultDisplay');
    
    if (!name || !roll) {
        resultDisplay.textContent = "Please enter both name and roll number.";
        resultDisplay.className = "result-display error";
        resultDisplay.style.display = "block";
        return;
    }
    
    showLoading('checkResult');
    await loadDataFromFirebase(); // Refresh data from Firebase
    
    const student = studentResults.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && s.roll === roll
    );
    
    if (student) {
        resultDisplay.innerHTML = `
            <strong>Result Found!</strong><br>
            Name: ${student.name}<br>
            Roll Number: ${student.roll}<br>
            Marks: ${student.marks}/100<br>
            Status: ${student.marks >= 33 ? 'Pass' : 'Fail'}<br>
            <small>Checked on: ${new Date().toLocaleString()}</small>
        `;
        resultDisplay.className = "result-display success";
    } else {
        resultDisplay.textContent = "No result found. Please check your details.";
        resultDisplay.className = "result-display error";
    }
    
    resultDisplay.style.display = "block";
    hideLoading('checkResult');
});

// Check Admit Card Functionality
document.getElementById('checkAdmitBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const name = document.getElementById('admitName').value.trim();
    const father = document.getElementById('fatherName').value.trim();
    const dob = document.getElementById('dob').value;
    const admitDisplay = document.getElementById('admitDisplay');
    const admitCardTemplate = document.getElementById('admitCardTemplate');
    
    if (!name || !father || !dob) {
        admitDisplay.textContent = "Please enter all details.";
        admitDisplay.className = "admit-card-display error";
        admitDisplay.style.display = "block";
        admitCardTemplate.style.display = "none";
        return;
    }
    
    showLoading('checkAdmit');
    await loadDataFromFirebase(); // Refresh data from Firebase
    
    const student = studentAdmitCards.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        s.father.toLowerCase() === father.toLowerCase() && 
        s.dob === dob
    );
    
    if (student) {
        // Populate admit card template
        document.getElementById('acName').textContent = student.name;
        document.getElementById('acFather').textContent = student.father;
        document.getElementById('acMother').textContent = student.mother;
        document.getElementById('acRoll').textContent = student.roll;
        document.getElementById('acDob').textContent = formatDate(student.dob);
        document.getElementById('acMobile').textContent = student.mobile;
        document.getElementById('acCenter').textContent = student.center;
        document.getElementById('acDate').textContent = formatDate(student.date);
        document.getElementById('acTime').textContent = student.time;
        
        admitCardTemplate.style.display = "block";
        admitDisplay.style.display = "none";
    } else {
        admitDisplay.textContent = "No admit card found. Please check your details.";
        admitDisplay.className = "admit-card-display error";
        admitDisplay.style.display = "block";
        admitCardTemplate.style.display = "none";
    }
    
    hideLoading('checkAdmit');
});

// Login Functionality
document.getElementById('loginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginMessage = document.getElementById('loginMessage');
    const adminPanel = document.getElementById('adminPanel');
    const loginSection = document.getElementById('loginSection');
    
    if (username === "Pksss" && password === "PKSSS@123") {
        loginSection.style.display = "none";
        adminPanel.style.display = "block";
        loginMessage.textContent = "";
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    } else {
        loginMessage.textContent = "Invalid username or password!";
        loginMessage.style.color = "red";
    }
});

// Logout Functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    const adminPanel = document.getElementById('adminPanel');
    const loginSection = document.getElementById('loginSection');
    
    adminPanel.style.display = "none";
    loginSection.style.display = "block";
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('loginMessage').textContent = "";
    loginSection.scrollIntoView({ behavior: 'smooth' });
});

// Upload Result Functionality
document.getElementById('uploadResultBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const name = document.getElementById('resultName').value.trim();
    const roll = document.getElementById('resultRoll').value.trim();
    const marks = parseInt(document.getElementById('resultMarks').value);
    
    if (!name || !roll || isNaN(marks) || marks < 0 || marks > 100) {
        alert("Please enter valid name, roll number and marks (0-100).");
        return;
    }
    
    await loadDataFromFirebase(); // Load current data
    
    const existingIndex = studentResults.findIndex(s => s.roll === roll);
    
    if (existingIndex !== -1) {
        studentResults[existingIndex].name = name;
        studentResults[existingIndex].marks = marks;
        studentResults[existingIndex].updatedAt = new Date().toISOString();
        alert("Result updated successfully!");
    } else {
        studentResults.push({ 
            name, 
            roll, 
            marks,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        alert("Result uploaded successfully!");
    }
    
    const success = await saveDataToFirebase();
    if (success) {
        document.getElementById('resultName').value = "";
        document.getElementById('resultRoll').value = "";
        document.getElementById('resultMarks').value = "";
    }
});

// Remove Result Functionality
document.getElementById('removeResultBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const roll = document.getElementById('resultRoll').value.trim();
    
    if (!roll) {
        alert("Please enter a roll number.");
        return;
    }
    
    await loadDataFromFirebase(); // Load current data
    
    const existingIndex = studentResults.findIndex(s => s.roll === roll);
    
    if (existingIndex !== -1) {
        studentResults.splice(existingIndex, 1);
        alert("Result removed successfully!");
        const success = await saveDataToFirebase();
        if (success) {
            document.getElementById('resultName').value = "";
            document.getElementById('resultRoll').value = "";
            document.getElementById('resultMarks').value = "";
        }
    } else {
        alert("No result found for this roll number.");
    }
});

// Upload Admit Card Functionality
document.getElementById('uploadAdmitBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const name = document.getElementById('admitCardName').value.trim();
    const father = document.getElementById('admitFatherName').value.trim();
    const mother = document.getElementById('admitMotherName').value.trim();
    const roll = document.getElementById('admitRoll').value.trim();
    const mobile = document.getElementById('mobileNumber').value.trim();
    const dob = document.getElementById('admitDob').value;
    const center = document.getElementById('examCenter').value;
    const date = document.getElementById('examDate').value;
    const startTime = document.getElementById('examStartTime').value;
    const endTime = document.getElementById('examEndTime').value;
    
    if (!name || !father || !mother || !roll || !mobile || !dob || !center || !date || !startTime || !endTime) {
        alert("Please fill all fields.");
        return;
    }
    
    await loadDataFromFirebase(); // Load current data
    
    const time = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    const existingIndex = studentAdmitCards.findIndex(s => s.roll === roll);
    
    const admitData = {
        name, father, mother, roll, mobile, dob, center, date, time,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        studentAdmitCards[existingIndex] = admitData;
        alert("Admit card updated successfully!");
    } else {
        studentAdmitCards.push(admitData);
        alert("Admit card uploaded successfully!");
    }
    
    const success = await saveDataToFirebase();
    if (success) {
        document.getElementById('admitCardName').value = "";
        document.getElementById('admitFatherName').value = "";
        document.getElementById('admitMotherName').value = "";
        document.getElementById('admitRoll').value = "";
        document.getElementById('mobileNumber').value = "";
        document.getElementById('admitDob').value = "";
        document.getElementById('examCenter').value = "";
        document.getElementById('examDate').value = "";
        document.getElementById('examStartTime').value = "";
        document.getElementById('examEndTime').value = "";
    }
});

// Remove Admit Card Functionality
document.getElementById('removeAdmitBtn').addEventListener('click', async function() {
    if (!isFirebaseReady()) {
        alert("Firebase is not ready yet. Please wait...");
        return;
    }
    
    const roll = document.getElementById('admitRoll').value.trim();
    
    if (!roll) {
        alert("Please enter a roll number.");
        return;
    }
    
    await loadDataFromFirebase(); // Load current data
    
    const existingIndex = studentAdmitCards.findIndex(s => s.roll === roll);
    
    if (existingIndex !== -1) {
        studentAdmitCards.splice(existingIndex, 1);
        alert("Admit card removed successfully!");
        const success = await saveDataToFirebase();
        if (success) {
            document.getElementById('admitCardName').value = "";
            document.getElementById('admitFatherName').value = "";
            document.getElementById('admitMotherName').value = "";
            document.getElementById('admitRoll').value = "";
            document.getElementById('mobileNumber').value = "";
            document.getElementById('admitDob').value = "";
            document.getElementById('examCenter').value = "";
            document.getElementById('examDate').value = "";
            document.getElementById('examStartTime').value = "";
            document.getElementById('examEndTime').value = "";
        }
    } else {
        alert("No admit card found for this roll number.");
    }
});

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper function to format time
function formatTime(timeString) {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
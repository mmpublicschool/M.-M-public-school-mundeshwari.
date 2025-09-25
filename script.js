// Wait for Firebase to be ready
function initApp() {
console.log("🚀 App initialized!");

// DOM Elements  
const checkResultBtn = document.getElementById('checkResultBtn');  
const checkAdmitBtn = document.getElementById('checkAdmitBtn');  
const checkTopperBtn = document.getElementById('checkTopperBtn');  
const loginBtn = document.getElementById('loginBtn');  
const logoutBtn = document.getElementById('logoutBtn');  
const openAdmissionBtn = document.getElementById('openAdmissionBtn');  
const admissionModal = document.getElementById('admissionModal');  
const admissionClose = document.querySelector('.admission-close');  
  
// Admin buttons  
const uploadResultBtn = document.getElementById('uploadResultBtn');  
const removeResultBtn = document.getElementById('removeResultBtn');  
const uploadAdmitBtn = document.getElementById('uploadAdmitBtn');  
const removeAdmitBtn = document.getElementById('removeAdmitBtn');  
const uploadTopperBtn = document.getElementById('uploadTopperBtn');  
const removeTopperBtn = document.getElementById('removeTopperBtn');  
  
// Firebase references  
const db = window.firebase.database;  
const dbRef = window.firebase.ref;  
const dbSet = window.firebase.set;  
const dbGet = window.firebase.get;  
const dbChild = window.firebase.child;  
const dbRemove = window.firebase.remove;  
  
// Check if user is logged in  
function checkLoginStatus() {  
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';  
    if (isLoggedIn) {  
        document.getElementById('loginSection').style.display = 'none';  
        document.getElementById('adminPanel').style.display = 'block';  
        updateDataStatus();  
    } else {  
        document.getElementById('loginSection').style.display = 'block';  
        document.getElementById('adminPanel').style.display = 'none';  
    }  
}  
  
// Update data status display  
function updateDataStatus() {  
    // Get results count  
    dbGet(dbChild(dbRef(db), 'results')).then((snapshot) => {  
        const results = snapshot.val();  
        document.getElementById('totalResults').textContent = results ? Object.keys(results).length : 0;  
    });  
      
    // Get admit cards count  
    dbGet(dbChild(dbRef(db), 'admitCards')).then((snapshot) => {  
        const admitCards = snapshot.val();  
        document.getElementById('totalAdmitCards').textContent = admitCards ? Object.keys(admitCards).length : 0;  
    });  
      
    // Get toppers count  
    dbGet(dbChild(dbRef(db), 'toppers')).then((snapshot) => {  
        const toppers = snapshot.val();  
        document.getElementById('totalToppers').textContent = toppers ? Object.keys(toppers).length : 0;  
    });  
}  
  
// Show loading state for button  
function showLoading(buttonId, textId, loadingId) {  
    document.getElementById(textId).style.display = 'none';  
    document.getElementById(loadingId).style.display = 'inline-block';  
    document.getElementById(buttonId).disabled = true;  
}  
  
// Hide loading state for button  
function hideLoading(buttonId, textId, loadingId) {  
    document.getElementById(textId).style.display = 'inline-block';  
    document.getElementById(loadingId).style.display = 'none';  
    document.getElementById(buttonId).disabled = false;  
}  
  
// Show message in display area  
function showMessage(displayId, message, type) {  
    const display = document.getElementById(displayId);  
    display.innerHTML = message;  
    display.className = `${displayId.split('Display')[0]}-display ${type}`;  
    display.style.display = 'block';  
}  
  
// Check Result  
checkResultBtn.addEventListener('click', () => {  
    const name = document.getElementById('studentName').value.trim();  
    const roll = document.getElementById('rollNumber').value.trim();  
      
    if (!name || !roll) {  
        showMessage('resultDisplay', 'Please enter both name and roll number.', 'error');  
        return;  
    }  
      
    showLoading('checkResultBtn', 'checkResultText', 'checkResultLoading');  
      
    dbGet(dbChild(dbRef(db), `results/${roll}`)).then((snapshot) => {  
        hideLoading('checkResultBtn', 'checkResultText', 'checkResultLoading');  
          
        if (snapshot.exists()) {  
            const result = snapshot.val();  
            if (result.name.toLowerCase() === name.toLowerCase()) {  
                showMessage('resultDisplay',   
                    `<strong>Name:</strong> ${result.name}<br>  
                     <strong>Roll No:</strong> ${roll}<br>  
                     <strong>Marks:</strong> ${result.marks}/100<br>  
                     <strong>Status:</strong> ${result.marks >= 33 ? 'Pass' : 'Fail'}`,   
                    'success');  
            } else {  
                showMessage('resultDisplay', 'Name does not match with roll number.', 'error');  
            }  
        } else {  
            showMessage('resultDisplay', 'Result not found for this roll number.', 'error');  
        }  
    }).catch((error) => {  
        hideLoading('checkResultBtn', 'checkResultText', 'checkResultLoading');  
        showMessage('resultDisplay', 'Error fetching result. Please try again.', 'error');  
        console.error('Error:', error);  
    });  
});  
  
// Check Admit Card  
checkAdmitBtn.addEventListener('click', () => {  
    const name = document.getElementById('admitName').value.trim();  
    const fatherName = document.getElementById('fatherName').value.trim();  
    const dob = document.getElementById('dob').value;  
      
    if (!name || !fatherName || !dob) {  
        showMessage('admitDisplay', 'Please fill all fields.', 'error');  
        return;  
    }  
      
    showLoading('checkAdmitBtn', 'checkAdmitText', 'checkAdmitLoading');  
      
    dbGet(dbChild(dbRef(db), 'admitCards')).then((snapshot) => {  
        hideLoading('checkAdmitBtn', 'checkAdmitText', 'checkAdmitLoading');  
          
        if (snapshot.exists()) {  
            const admitCards = snapshot.val();  
            let found = false;  
              
            for (const roll in admitCards) {  
                const card = admitCards[roll];  
                if (card.name.toLowerCase() === name.toLowerCase() &&   
                    card.fatherName.toLowerCase() === fatherName.toLowerCase() &&   
                    card.dob === dob) {  
                      
                    // Populate admit card template  
                    document.getElementById('acName').textContent = card.name;  
                    document.getElementById('acFather').textContent = card.fatherName;  
                    document.getElementById('acMother').textContent = card.motherName || '-';  
                    document.getElementById('acRoll').textContent = roll;  
                    document.getElementById('acDob').textContent = card.dob;  
                    document.getElementById('acMobile').textContent = card.mobile || '-';  
                    document.getElementById('acCenter').textContent = card.examCenter || '-';  
                    document.getElementById('acDate').textContent = card.examDate || '-';  
                      
                    if (card.examStartTime && card.examEndTime) {  
                        document.getElementById('acTime').textContent = `${card.examStartTime} - ${card.examEndTime}`;  
                    } else {  
                        document.getElementById('acTime').textContent = '-';  
                    }  
                      
                    const admitCard = document.getElementById('admitCardTemplate').cloneNode(true);  
                    admitCard.id = 'admitCardDisplay';  
                    admitCard.style.display = 'block';  
                      
                    document.getElementById('admitDisplay').innerHTML = '';  
                    document.getElementById('admitDisplay').appendChild(admitCard);  
                    document.getElementById('admitDisplay').className = 'admit-card-display success';  
                    document.getElementById('admitDisplay').style.display = 'block';  
                      
                    found = true;  
                    break;  
                }  
            }  
              
            if (!found) {  
                showMessage('admitDisplay', 'Admit card not found with provided details.', 'error');  
            }  
        } else {  
            showMessage('admitDisplay', 'No admit cards found in database.', 'error');  
        }  
    }).catch((error) => {  
        hideLoading('checkAdmitBtn', 'checkAdmitText', 'checkAdmitLoading');  
        showMessage('admitDisplay', 'Error fetching admit card. Please try again.', 'error');  
        console.error('Error:', error);  
    });  
});  
  
// Check Topper List  
checkTopperBtn.addEventListener('click', () => {  
    showLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');  
      
    dbGet(dbChild(dbRef(db), 'toppers')).then((snapshot) => {  
        hideLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');  
          
        if (snapshot.exists()) {  
            const toppers = snapshot.val();  
            const topperArray = [];  
              
            // Convert to array and sort by rank  
            for (const id in toppers) {  
                topperArray.push(toppers[id]);  
            }  
              
            topperArray.sort((a, b) => a.rank - b.rank);  
              
            let topperHTML = '';  
            topperArray.forEach(topper => {  
                let rankClass = '';  
                if (topper.rank === 1) rankClass = 'gold';  
                else if (topper.rank === 2) rankClass = 'silver';  
                else if (topper.rank === 3) rankClass = 'bronze';  
                  
                topperHTML += `  
                    <div class="topper-item">  
                        <div class="topper-rank ${rankClass}">${topper.rank}</div>  
                        <div class="topper-info">  
                            <div class="topper-name">${topper.name}</div>  
                            <div class="topper-marks">Marks: ${topper.marks}/100</div>  
                        </div>  
                    </div>  
                `;  
            });  
              
            document.getElementById('topperDisplay').innerHTML = topperHTML;  
            document.getElementById('topperDisplay').style.display = 'block';  
        } else {  
            showMessage('topperDisplay', 'No topper data available.', 'error');  
        }  
    }).catch((error) => {  
        hideLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');  
        showMessage('topperDisplay', 'Error fetching topper list. Please try again.', 'error');  
        console.error('Error:', error);  
    });  
});  
  
// ✅ Login Functionality (हर बार reload पर login माँगेगा)
document.getElementById('loginSection').style.display = 'block';
document.getElementById('adminPanel').style.display = 'none';

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === 'Pksss' && password === 'PKSSS123') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        updateDataStatus();
        document.getElementById('loginMessage').innerHTML = '<span style="color: green;">Login successful!</span>';
    } else {
        document.getElementById('loginMessage').innerHTML = '<span style="color: red;">Invalid username or password!</span>';
    }
});

// ✅ Logout Functionality (fields clear होंगे)
logoutBtn.addEventListener('click', () => {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});
  
// Logout Functionality  
logoutBtn.addEventListener('click', () => {  
    localStorage.removeItem('isLoggedIn');  
    checkLoginStatus();  
});  
  
// Admission Modal  
openAdmissionBtn.addEventListener('click', () => {  
    admissionModal.style.display = 'block';  
});  
  
admissionClose.addEventListener('click', () => {  
    admissionModal.style.display = 'none';  
});  
  
window.addEventListener('click', (event) => {  
    if (event.target === admissionModal) {  
        admissionModal.style.display = 'none';  
    }  
});  
  
// Upload Result  
uploadResultBtn.addEventListener('click', () => {  
    const name = document.getElementById('resultName').value.trim();  
    const roll = document.getElementById('resultRoll').value.trim();  
    const marks = document.getElementById('resultMarks').value;  
      
    if (!name || !roll || !marks) {  
        alert('Please fill all fields');  
        return;  
    }  
      
    dbSet(dbRef(db, `results/${roll}`), {  
        name: name,  
        marks: parseInt(marks)  
    }).then(() => {  
        alert('Result uploaded successfully!');  
        document.getElementById('resultName').value = '';  
        document.getElementById('resultRoll').value = '';  
        document.getElementById('resultMarks').value = '';  
        updateDataStatus();  
    }).catch((error) => {  
        alert('Error uploading result: ' + error.message);  
    });  
});  
  
// Remove Result  
removeResultBtn.addEventListener('click', () => {  
    const roll = document.getElementById('resultRoll').value.trim();  
      
    if (!roll) {  
        alert('Please enter roll number');  
        return;  
    }  
      
    if (confirm(`Are you sure you want to remove result for roll number ${roll}?`)) {  
        dbRemove(dbRef(db, `results/${roll}`)).then(() => {  
            alert('Result removed successfully!');  
            document.getElementById('resultRoll').value = '';  
            updateDataStatus();  
        }).catch((error) => {  
            alert('Error removing result: ' + error.message);  
        });  
    }  
});  
  
// Upload Admit Card  
uploadAdmitBtn.addEventListener('click', () => {  
    const name = document.getElementById('admitCardName').value.trim();  
    const fatherName = document.getElementById('admitFatherName').value.trim();  
    const motherName = document.getElementById('admitMotherName').value.trim();  
    const roll = document.getElementById('admitRoll').value.trim();  
    const mobile = document.getElementById('mobileNumber').value.trim();  
    const dob = document.getElementById('admitDob').value;  
    const examCenter = document.getElementById('examCenter').value;  
    const examDate = document.getElementById('examDate').value;  
    const examStartTime = document.getElementById('examStartTime').value;  
    const examEndTime = document.getElementById('examEndTime').value;  
      
    if (!name || !fatherName || !roll || !dob) {  
        alert('Please fill required fields (Name, Father\'s Name, Roll Number, DOB)');  
        return;  
    }  
      
    dbSet(dbRef(db, `admitCards/${roll}`), {  
        name: name,  
        fatherName: fatherName,  
        motherName: motherName,  
        dob: dob,  
        mobile: mobile,  
        examCenter: examCenter,  
        examDate: examDate,  
        examStartTime: examStartTime,  
        examEndTime: examEndTime  
    }).then(() => {  
        alert('Admit card uploaded successfully!');  
        // Clear form  
        document.querySelectorAll('.admin-card input, .admin-card select').forEach(input => {  
            if (input.type !== 'button') input.value = '';  
        });  
        updateDataStatus();  
    }).catch((error) => {  
        alert('Error uploading admit card: ' + error.message);  
    });  
});  
  
// Remove Admit Card  
removeAdmitBtn.addEventListener('click', () => {  
    const roll = document.getElementById('admitRoll').value.trim();  
      
    if (!roll) {  
        alert('Please enter roll number');  
        return;  
    }  
      
    if (confirm(`Are you sure you want to remove admit card for roll number ${roll}?`)) {  
        dbRemove(dbRef(db, `admitCards/${roll}`)).then(() => {  
            alert('Admit card removed successfully!');  
            document.getElementById('admitRoll').value = '';  
            updateDataStatus();  
        }).catch((error) => {  
            alert('Error removing admit card: ' + error.message);  
        });  
    }  
});  
  
// Upload Topper Student  
uploadTopperBtn.addEventListener('click', () => {  
    const name = document.getElementById('topperName').value.trim();  
    const marks = document.getElementById('topperMarks').value;  
    const rank = document.getElementById('topperRank').value;  
      
    if (!name || !marks || !rank) {  
        alert('Please fill all fields');  
        return;  
    }  
      
    // Generate a unique ID for the topper  
    const topperId = `topper_${Date.now()}`;  
      
    dbSet(dbRef(db, `toppers/${topperId}`), {  
        name: name,  
        marks: parseInt(marks),  
        rank: parseInt(rank)  
    }).then(() => {  
        alert('Topper student uploaded successfully!');  
        document.getElementById('topperName').value = '';  
        document.getElementById('topperMarks').value = '';  
        document.getElementById('topperRank').value = '';  
        updateDataStatus();  
    }).catch((error) => {  
        alert('Error uploading topper student: ' + error.message);  
    });  
});  
  
// Remove Topper Student  
removeTopperBtn.addEventListener('click', () => {  
    const name = document.getElementById('topperName').value.trim();  
    const rank = document.getElementById('topperRank').value;  
      
    if (!name || !rank) {  
        alert('Please enter name and rank to remove');  
        return;  
    }  
      
    if (confirm(`Are you sure you want to remove topper ${name} with rank ${rank}?`)) {  
        // We need to find the topper by name and rank  
        dbGet(dbChild(dbRef(db), 'toppers')).then((snapshot) => {  
            if (snapshot.exists()) {  
                const toppers = snapshot.val();  
                let topperId = null;  
                  
                for (const id in toppers) {  
                    if (toppers[id].name.toLowerCase() === name.toLowerCase() &&   
                        toppers[id].rank.toString() === rank) {  
                        topperId = id;  
                        break;  
                    }  
                }  
                  
                if (topperId) {  
                    dbRemove(dbRef(db, `toppers/${topperId}`)).then(() => {  
                        alert('Topper student removed successfully!');  
                        document.getElementById('topperName').value = '';  
                        document.getElementById('topperRank').value = '';  
                        updateDataStatus();  
                    }).catch((error) => {  
                        alert('Error removing topper student: ' + error.message);  
                    });  
                } else {  
                    alert('Topper student not found with provided name and rank');  
                }  
            } else {  
                alert('No topper data found');  
            }  
        }).catch((error) => {  
            alert('Error finding topper student: ' + error.message);  
        });  
    }  
});  
// === Cancel button functionality ===
document.addEventListener('click', function(event) {
    if (event.target.id === 'cancelBtn') {
        // Admit card ya details section ko hide karo
        const admitDisplay = document.getElementById('admitDisplay');
        if (admitDisplay) {
            admitDisplay.innerHTML = '';        // content clear kar do
            admitDisplay.style.display = 'none'; // container hide kar do
        }

        // Optional: agar tumhare paas initial options section hai to wapas dikha do
        const initialOptions = document.getElementById('initialOptions');
        if (initialOptions) {
            initialOptions.classList.remove('hidden');
            initialOptions.style.display = 'block';
        }

        // Optional: input fields clear kar do
        const admitNameInput = document.getElementById('admitName');
        const fatherNameInput = document.getElementById('fatherName');
        const dobInput = document.getElementById('dob');
        if (admitNameInput) admitNameInput.value = '';
        if (fatherNameInput) fatherNameInput.value = '';
        if (dobInput) dobInput.value = '';
    }
});
checkTopperBtn.addEventListener('click', () => {
    showLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');

    dbGet(dbChild(dbRef(db), 'toppers')).then((snapshot) => {
        hideLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');

        const topperDisplay = document.getElementById('topperDisplay');
        topperDisplay.innerHTML = ''; // Clear previous toppers
        topperDisplay.style.display = 'block';

        if (snapshot.exists()) {
            const toppers = snapshot.val();
            const topperArray = [];

            for (const id in toppers) {
                topperArray.push(toppers[id]);
            }

            topperArray.sort((a, b) => a.rank - b.rank);

            // Generate each topper using createElement (class preserved)
            topperArray.forEach(topper => {
                const topperDiv = document.createElement('div');
                topperDiv.className = 'topper-item';

                let rankClass = '';
                if (topper.rank === 1) rankClass = 'gold';
                else if (topper.rank === 2) rankClass = 'silver';
                else if (topper.rank === 3) rankClass = 'bronze';
                else rankClass = 'black';

                const rankDiv = document.createElement('div');
                rankDiv.className = 'topper-rank ' + rankClass;
                rankDiv.textContent = topper.rank;

                const infoDiv = document.createElement('div');
                infoDiv.className = 'topper-info';
                infoDiv.innerHTML = `
                    <div class="topper-name">${topper.name}</div>
                    <div class="topper-marks">Marks: ${topper.marks}/100</div>
                `;

                topperDiv.appendChild(rankDiv);
                topperDiv.appendChild(infoDiv);

                topperDisplay.appendChild(topperDiv);
            });

            // Add Cancel button **after all topper items**
            if (topperArray.length > 0) {
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancelTopperBtn';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.style.marginTop = '10px';
                cancelBtn.className = 'btn btn-secondary';
                topperDisplay.appendChild(cancelBtn);
            }

        } else {
            showMessage('topperDisplay', 'No topper data available.', 'error');
        }
    }).catch((error) => {
        hideLoading('checkTopperBtn', 'checkTopperText', 'checkTopperLoading');
        showMessage('topperDisplay', 'Error fetching topper list. Please try again.', 'error');
        console.error('Error:', error);
    });
});

// Cancel button functionality
document.addEventListener('click', function(event) {
    if (event.target.id === 'cancelTopperBtn') {
        const topperDisplay = document.getElementById('topperDisplay');
        if (topperDisplay) {
            topperDisplay.innerHTML = '';        // Clear topper list + cancel
            topperDisplay.style.display = 'none'; // Hide container
        }
    }
});
// Initialize the app  
checkLoginStatus();

}

// Set the initApp function globally

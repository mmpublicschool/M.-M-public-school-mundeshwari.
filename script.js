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
    display.innerHTM = message;  
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

                function getGrade(marks) {
                    if (marks >= 90) return "A+";
                    if (marks >= 80) return "A";
                    if (marks >= 70) return "B+";
                    if (marks >= 60) return "B";
                    if (marks >= 50) return "C";
                    if (marks >= 40) return "D";
                    return "F";
                }

                const grade = getGrade(result.marks);
                const status = result.marks >= 33 ? 'Pass' : 'Fail';

                // Onscreen result
                const onscreenHTML = `
                    <div style="max-width: 400px; margin: 20px auto; padding: 20px; border: 2px solid #007BFF; border-radius: 10px; background: #f9f9f9; text-align: center; font-family: Arial, sans-serif;">
                        <h2 style="color: #007BFF; margin-bottom: 20px;">Result Details</h2>
                        <p><strong>Name:</strong> ${result.name}</p>
                        <p><strong>Roll No:</strong> ${roll}</p>
                        <p><strong>Marks:</strong> ${result.marks}/100</p>
                        <p><strong>Status:</strong> <span style="color: ${status === 'Pass' ? 'green' : 'red'};">${status}</span></p>
                        <p><strong>Grade:</strong> ${grade}</p>
                        <button id="saveResultBtn" style="margin-top: 15px; padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Save Result</button>
                    </div>
                `;

                document.getElementById('resultDisplay').innerHTML = onscreenHTML;

                // Download result
                document.getElementById('saveResultBtn').addEventListener('click', () => {
                    const downloadHTML = `
                        <html>
                        <head>
                            <title>Result_${roll}</title>
                            <style>
                                @page { size: A4; margin: 40px; }
                                body { font-family: Arial, sans-serif; background: #f4f4f4; }
                                .container {
                                    width: 800px;
                                    margin: 0 auto;
                                    padding: 50px;
                                    background: #fff;
                                    border: 4px solid #007BFF;
                                    border-radius: 15px;
                                    box-shadow: 0 0 10px rgba(0,0,0,0.2);
                                    text-align: center;
                                }
                                h1 {
                                    color: #003366;
                                    font-size: 38px;
                                    margin-bottom: 5px;
                                }
                                h2 {
                                    color: #007BFF;
                                    font-size: 28px;
                                    margin-bottom: 15px;
                                }
                                .divider {
                                    width: 100%;
                                    height: 3px;
                                    background: #007BFF;
                                    margin: 20px 0 30px 0;
                                }
                                p {
                                    font-size: 22px;
                                    margin: 12px 0;
                                }
                                .status-pass { color: green; font-weight: bold; }
                                .status-fail { color: red; font-weight: bold; }
                                .footer-line {
                                    margin-top: 40px;
                                    border-top: 2px solid #007BFF;
                                    padding-top: 10px;
                                    font-size: 18px;
                                    color: #555;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>M.M Public School Mundeshwari</h1>
                                <h2>Result Details</h2>
                                <div class="divider"></div>
                                <p><strong>Name:</strong> ${result.name}</p>
                                <p><strong>Roll No:</strong> ${roll}</p>
                                <p><strong>Marks:</strong> ${result.marks}/100</p>
                                <p><strong>Status:</strong> <span class="${status === 'Pass' ? 'status-pass' : 'status-fail'}">${status}</span></p>
                                <p><strong>Grade:</strong> ${grade}</p>
                                <div class="footer-line">This is an official result from M.M Public School Mundeshwari</div>
                            </div>
                        </body>
                        </html>
                    `;

                    const blob = new Blob([downloadHTML], { type: 'text/html' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Result_${roll}.html`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                });

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

                    // Show Admit Card Box
                    const html = `
                        <div class="admit-container" style="max-width: 500px; margin: 20px auto; padding: 20px; border: 2px solid #007BFF; border-radius: 10px; background: #f9f9f9; text-align: center; font-family: Arial, sans-serif;">
                            <h2 style="color:#007BFF; margin-bottom:20px;">Admit Card</h2>
                            <p><strong>Name:</strong> ${card.name}</p>
                            <p><strong>Roll No:</strong> ${roll}</p>
                            <p><strong>Father's Name:</strong> ${card.fatherName}</p>
                            <p><strong>Mother's Name:</strong> ${card.motherName || '-'}</p>
                            <p><strong>DOB:</strong> ${card.dob}</p>
                            <p><strong>Mobile:</strong> ${card.mobile || '-'}</p>
                            <p><strong>Exam Center:</strong> ${card.examCenter || '-'}</p>
                            <p><strong>Exam Date:</strong> ${card.examDate || '-'}</p>
                            <p><strong>Exam Time:</strong> ${card.examStartTime || '-'} to ${card.examEndTime || '-'}</p>
                            <div style="margin-top:20px; display:flex; justify-content:space-between;">
                                <button id="downloadAdmitBtn" style="padding: 10px 20px; background:#28a745; color:#fff; border:none; border-radius:5px; cursor:pointer;">Download</button>
                                <button id="cancelAdmitBtn" style="padding: 10px 20px; background:#dc3545; color:#fff; border:none; border-radius:5px; cursor:pointer;">Cancel</button>
                            </div>
                        </div>
                    `;

                    document.getElementById('admitDisplay').innerHTML = html;

                    // Cancel button
                    document.getElementById('cancelAdmitBtn').addEventListener('click', () => {
                        document.getElementById('admitDisplay').innerHTML = '';
                    });

                    // Download button
                    document.getElementById('downloadAdmitBtn').addEventListener('click', () => {
                        const downloadHTML = `
                            <html>
                            <head>
                                <title>AdmitCard_${roll}</title>
                                <style>
                                    body { font-family: Arial, sans-serif; background:#f4f4f4; padding:50px 0; }
                                    .container {
                                        width: 800px;
                                        margin: auto;
                                        padding: 50px;
                                        background: #fff;
                                        border: 4px solid #007BFF;
                                        border-radius: 15px;
                                        box-shadow: 0 0 12px rgba(0,0,0,0.2);
                                    }
                                    h1 { color:#003366; font-size:38px; text-align:center; margin-bottom:15px; }
                                    h2 { color:#007BFF; font-size:30px; text-align:center; margin-bottom:30px; }
                                    .divider { height:3px; background:#007BFF; margin:25px 0 35px 0; }
                                    .row { display:flex; justify-content:space-between; margin:18px 0; font-size:22px; }
                                    .note { font-size:15px; margin:8px 0; color:#444; }
                                    .sign-row { display:flex; justify-content:space-between; margin-top:60px; }
                                    .sign-box { width:40%; text-align:center; padding-top:8px; }
                                    .sign-box::after { content:""; display:block; height:45px; border:2px solid #000; margin-top:5px; }
                                    .footer-line { margin-top:45px; border-top:2px solid #007BFF; padding-top:12px; text-align:center; font-size:16px; color:#555; }
                                    @media(max-width:600px){
                                        .container{width:95%; padding:20px;}
                                        .row{flex-direction:column; gap:5px;}
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>M.M Public School Mundeshwari</h1>
                                    <h2>Admit Card</h2>
                                    <div class="divider"></div>
                                    <div class="row"><span><b>Name:</b> ${card.name}</span><span><b>Roll No:</b> ${roll}</span></div>
                                    <div class="row"><span><b>Father's Name:</b> ${card.fatherName}</span><span><b>Mother's Name:</b> ${card.motherName || '-'}</span></div>
                                    <div class="row"><span><b>DOB:</b> ${card.dob}</span><span><b>Mobile:</b> ${card.mobile || '-'}</span></div>
                                    <div class="row"><span><b>Exam Center:</b> ${card.examCenter || '-'}</span><span><b>Exam Date:</b> ${card.examDate || '-'}</span></div>
                                    <div class="row"><span><b>Start Time:</b> ${card.examStartTime || '-'}</span><span><b>End Time:</b> ${card.examEndTime || '-'}</span></div>
                                    <div class="divider"></div>
                                    <div class="note">1. Bring your Admit Card without fail.</div>
                                    <div class="note">2. Reach the exam center at least 30 minutes early</div>
                                    <div class="note">3. Electronic devices are strictly prohibited</div>
                                    <div class="sign-row">
                                        <div class="sign-box">Student Signature</div>
                                        <div class="sign-box">Principal Signature</div>
                                    </div>
                                    <div class="footer-line">This is an official admit card from M.M Public School Mundeshwari</div>
                                </div>
                            </body>
                            </html>
                        `;

                        const blob = new Blob([downloadHTML], { type: 'text/html' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `AdmitCard_${roll}.html`;
                        link.click();
                        URL.revokeObjectURL(link.href);
                    });

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
  
// Remove All Results
removeResultBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove ALL results?")) {
        dbRemove(dbRef(db, 'results')).then(() => {
            alert('All results removed successfully!');
            updateDataStatus();
        }).catch((error) => {
            alert('Error removing all results: ' + error.message);
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
  
// Remove All Admit Cards
removeAdmitBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove ALL admit cards?")) {
        dbRemove(dbRef(db, 'admitCards')).then(() => {
            alert('All admit cards removed successfully!');
            updateDataStatus();
        }).catch((error) => {
            alert('Error removing all admit cards: ' + error.message);
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
  
  // Remove All Toppers
removeTopperBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove ALL toppers?")) {
        dbRemove(dbRef(db, 'toppers')).then(() => {
            alert('All toppers removed successfully!');
            updateDataStatus();
        }).catch((error) => {
            alert('Error removing all toppers: ' + error.message);
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

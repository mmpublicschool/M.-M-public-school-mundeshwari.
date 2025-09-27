// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check Result Functionality
    const checkResultBtn = document.getElementById('checkResultBtn');
    const resultDetails = document.getElementById('resultDetails');
    const downloadResultBtn = document.getElementById('downloadResultBtn');
    const cancelResultBtn = document.getElementById('cancelResultBtn');
    
    checkResultBtn.addEventListener('click', function() {
        const name = document.getElementById('resultName').value.trim();
        const roll = document.getElementById('resultRoll').value.trim();
        
        if (name === '' || roll === '') {
            alert('Please enter both name and roll number');
            return;
        }
        
        // Fetch result from Firebase
        get(child(ref(window.db), `results/${roll}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.name.toLowerCase() === name.toLowerCase()) {
                    document.getElementById('displayName').textContent = data.name;
                    document.getElementById('displayRoll').textContent = roll;
                    document.getElementById('displayMarks').textContent = data.marks;
                    
                    // Calculate grade
                    const marks = parseInt(data.marks);
                    let grade = 'F';
                    if (marks >= 90) grade = 'A+';
                    else if (marks >= 80) grade = 'A';
                    else if (marks >= 70) grade = 'B';
                    else if (marks >= 60) grade = 'C';
                    else if (marks >= 50) grade = 'D';
                    else if (marks >= 40) grade = 'E';
                    
                    document.getElementById('displayGrade').textContent = grade;
                    resultDetails.style.display = 'block';
                } else {
                    alert('Name does not match with roll number');
                }
            } else {
                alert('Result not found for this roll number');
            }
        }).catch((error) => {
            console.error('Error fetching result:', error);
            alert('Error fetching result. Please try again.');
        });
    });
    
    cancelResultBtn.addEventListener('click', function() {
        resultDetails.style.display = 'none';
        document.getElementById('resultName').value = '';
        document.getElementById('resultRoll').value = '';
    });
    
    downloadResultBtn.addEventListener('click', function() {
        downloadResultPDF();
    });
    
    // Check Admit Card Functionality
    const checkAdmitBtn = document.getElementById('checkAdmitBtn');
    const admitDetails = document.getElementById('admitDetails');
    const downloadAdmitBtn = document.getElementById('downloadAdmitBtn');
    const cancelAdmitBtn = document.getElementById('cancelAdmitBtn');
    
    checkAdmitBtn.addEventListener('click', function() {
        const name = document.getElementById('admitName').value.trim();
        const father = document.getElementById('admitFather').value.trim();
        const dob = document.getElementById('admitDob').value;
        
        if (name === '' || father === '' || dob === '') {
            alert('Please enter all details');
            return;
        }
        
        // Fetch admit card from Firebase
        get(child(ref(window.db), `admitCards/${name.replace(/\s+/g, '_')}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.fatherName.toLowerCase() === father.toLowerCase() && data.dob === dob) {
                    document.getElementById('displayAdmitName').textContent = data.name;
                    document.getElementById('displayAdmitFather').textContent = data.fatherName;
                    document.getElementById('displayAdmitMother').textContent = data.motherName;
                    document.getElementById('displayAdmitAadhar').textContent = data.aadhar;
                    document.getElementById('displayAdmitClass').textContent = data.class;
                    document.getElementById('displayAdmitCenter').textContent = data.center;
                    document.getElementById('displayAdmitMonth').textContent = data.examMonth;
                    document.getElementById('displayAdmitTime').textContent = data.examTime;
                    
                    admitDetails.style.display = 'block';
                } else {
                    alert('Details do not match');
                }
            } else {
                alert('Admit card not found');
            }
        }).catch((error) => {
            console.error('Error fetching admit card:', error);
            alert('Error fetching admit card. Please try again.');
        });
    });
    
    cancelAdmitBtn.addEventListener('click', function() {
        admitDetails.style.display = 'none';
        document.getElementById('admitName').value = '';
        document.getElementById('admitFather').value = '';
        document.getElementById('admitDob').value = '';
    });
    
    downloadAdmitBtn.addEventListener('click', function() {
        downloadAdmitCardPDF();
    });
    
    // Check Topper List Functionality
    const checkTopperBtn = document.getElementById('checkTopperBtn');
    const topperDetails = document.getElementById('topperDetails');
    const downloadTopperBtn = document.getElementById('downloadTopperBtn');
    const cancelTopperBtn = document.getElementById('cancelTopperBtn');
    
    checkTopperBtn.addEventListener('click', function() {
        // Fetch topper list from Firebase
        get(child(ref(window.db), 'toppers')).then((snapshot) => {
            const topperList = document.querySelector('.topper-list');
            topperList.innerHTML = '';
            
            if (snapshot.exists()) {
                const toppers = snapshot.val();
                // Convert to array and sort by rank
                const topperArray = Object.values(toppers).sort((a, b) => a.rank - b.rank);
                
                topperArray.forEach(topper => {
                    const topperItem = document.createElement('div');
                    topperItem.className = 'topper-item';
                    
                    const rankSpan = document.createElement('span');
                    rankSpan.className = 'topper-rank';
                    
                    // Add medal emoji based on rank
                    if (topper.rank === 1) rankSpan.innerHTML = '🥇';
                    else if (topper.rank === 2) rankSpan.innerHTML = '🥈';
                    else if (topper.rank === 3) rankSpan.innerHTML = '🥉';
                    else rankSpan.textContent = topper.rank;
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'topper-name';
                    nameSpan.textContent = topper.name;
                    
                    const marksSpan = document.createElement('span');
                    marksSpan.className = 'topper-marks';
                    marksSpan.textContent = `${topper.marks}/100`;
                    
                    topperItem.appendChild(rankSpan);
                    topperItem.appendChild(nameSpan);
                    topperItem.appendChild(marksSpan);
                    
                    topperList.appendChild(topperItem);
                });
                
                topperDetails.style.display = 'block';
            } else {
                topperList.innerHTML = '<p>No topper data available</p>';
                topperDetails.style.display = 'block';
            }
        }).catch((error) => {
            console.error('Error fetching toppers:', error);
            alert('Error fetching topper list. Please try again.');
        });
    });
    
    cancelTopperBtn.addEventListener('click', function() {
        topperDetails.style.display = 'none';
    });
    
    downloadTopperBtn.addEventListener('click', function() {
        downloadTopperListPDF();
    });
    
    // Admin Login Functionality
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Simple admin credentials (in a real app, this should be more secure)
    const adminCredentials = {
        username: 'Admin',
        password: 'admin123'
    };
    
    adminLoginBtn.addEventListener('click', function() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            // Hide main content and show admin panel
            document.querySelector('.main-content').style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            alert('Invalid admin credentials');
        }
    });
    
    logoutBtn.addEventListener('click', function() {
        // Show main content and hide admin panel
        document.querySelector('.main-content').style.display = 'block';
        adminPanel.style.display = 'none';
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    });
    
    // Admin Tab Functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Upload Result Functionality
    const uploadResultBtn = document.getElementById('uploadResultBtn');
    const removeResultBtn = document.getElementById('removeResultBtn');
    const removeAllResultsBtn = document.getElementById('removeAllResultsBtn');
    
    uploadResultBtn.addEventListener('click', function() {
        const name = document.getElementById('resultNameUpload').value.trim();
        const roll = document.getElementById('resultRollUpload').value.trim();
        const marks = document.getElementById('resultMarksUpload').value;
        
        if (name === '' || roll === '' || marks === '') {
            alert('Please fill all fields');
            return;
        }
        
        if (marks < 0 || marks > 100) {
            alert('Marks must be between 0 and 100');
            return;
        }
        
        set(ref(window.db, `results/${roll}`), {
            name: name,
            marks: marks
        }).then(() => {
            alert('Result uploaded successfully');
            document.getElementById('resultNameUpload').value = '';
            document.getElementById('resultRollUpload').value = '';
            document.getElementById('resultMarksUpload').value = '';
        }).catch((error) => {
            console.error('Error uploading result:', error);
            alert('Error uploading result. Please try again.');
        });
    });
    
    removeResultBtn.addEventListener('click', function() {
        const roll = document.getElementById('resultRollUpload').value.trim();
        
        if (roll === '') {
            alert('Please enter roll number to remove');
            return;
        }
        
        remove(ref(window.db, `results/${roll}`)).then(() => {
            alert('Result removed successfully');
            document.getElementById('resultRollUpload').value = '';
        }).catch((error) => {
            console.error('Error removing result:', error);
            alert('Error removing result. Please try again.');
        });
    });
    
    removeAllResultsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to remove all results? This action cannot be undone.')) {
            remove(ref(window.db, 'results')).then(() => {
                alert('All results removed successfully');
            }).catch((error) => {
                console.error('Error removing all results:', error);
                alert('Error removing all results. Please try again.');
            });
        }
    });
    
    // Upload Admit Card Functionality
    const uploadAdmitBtn = document.getElementById('uploadAdmitBtn');
    const removeAdmitBtn = document.getElementById('removeAdmitBtn');
    const removeAllAdmitsBtn = document.getElementById('removeAllAdmitsBtn');
    
    uploadAdmitBtn.addEventListener('click', function() {
        const name = document.getElementById('admitNameUpload').value.trim();
        const fatherName = document.getElementById('admitFatherUpload').value.trim();
        const motherName = document.getElementById('admitMotherUpload').value.trim();
        const aadhar = document.getElementById('admitAadharUpload').value.trim();
        const studentClass = document.getElementById('admitClassUpload').value;
        const center = document.getElementById('admitCenterUpload').value;
        const examMonth = document.getElementById('admitMonthUpload').value.trim();
        const examTime = document.getElementById('admitTimeUpload').value.trim();
        
        if (name === '' || fatherName === '' || motherName === '' || aadhar === '' || 
            studentClass === '' || center === '' || examMonth === '' || examTime === '') {
            alert('Please fill all fields');
            return;
        }
        
        set(ref(window.db, `admitCards/${name.replace(/\s+/g, '_')}`), {
            name: name,
            fatherName: fatherName,
            motherName: motherName,
            aadhar: aadhar,
            class: studentClass,
            center: center,
            examMonth: examMonth,
            examTime: examTime,
            dob: document.getElementById('admitDob').value // Using the same DOB field from check admit
        }).then(() => {
            alert('Admit card uploaded successfully');
            // Clear form
            document.getElementById('admitNameUpload').value = '';
            document.getElementById('admitFatherUpload').value = '';
            document.getElementById('admitMotherUpload').value = '';
            document.getElementById('admitAadharUpload').value = '';
            document.getElementById('admitClassUpload').value = '';
            document.getElementById('admitCenterUpload').value = '';
            document.getElementById('admitMonthUpload').value = '';
            document.getElementById('admitTimeUpload').value = '';
        }).catch((error) => {
            console.error('Error uploading admit card:', error);
            alert('Error uploading admit card. Please try again.');
        });
    });
    
    removeAdmitBtn.addEventListener('click', function() {
        const name = document.getElementById('admitNameUpload').value.trim();
        
        if (name === '') {
            alert('Please enter student name to remove');
            return;
        }
        
        remove(ref(window.db, `admitCards/${name.replace(/\s+/g, '_')}`)).then(() => {
            alert('Admit card removed successfully');
            document.getElementById('admitNameUpload').value = '';
        }).catch((error) => {
            console.error('Error removing admit card:', error);
            alert('Error removing admit card. Please try again.');
        });
    });
    
    removeAllAdmitsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to remove all admit cards? This action cannot be undone.')) {
            remove(ref(window.db, 'admitCards')).then(() => {
                alert('All admit cards removed successfully');
            }).catch((error) => {
                console.error('Error removing all admit cards:', error);
                alert('Error removing all admit cards. Please try again.');
            });
        }
    });
    
    // Upload Topper List Functionality
    const uploadTopperBtn = document.getElementById('uploadTopperBtn');
    const removeTopperBtn = document.getElementById('removeTopperBtn');
    const removeAllToppersBtn = document.getElementById('removeAllToppersBtn');
    
    uploadTopperBtn.addEventListener('click', function() {
        const name = document.getElementById('topperNameUpload').value.trim();
        const marks = document.getElementById('topperMarksUpload').value;
        const rank = document.getElementById('topperRankUpload').value;
        
        if (name === '' || marks === '' || rank === '') {
            alert('Please fill all fields');
            return;
        }
        
        if (marks < 0 || marks > 100) {
            alert('Marks must be between 0 and 100');
            return;
        }
        
        if (rank < 1) {
            alert('Rank must be at least 1');
            return;
        }
        
        set(ref(window.db, `toppers/${rank}`), {
            name: name,
            marks: marks,
            rank: parseInt(rank)
        }).then(() => {
            alert('Topper data uploaded successfully');
            document.getElementById('topperNameUpload').value = '';
            document.getElementById('topperMarksUpload').value = '';
            document.getElementById('topperRankUpload').value = '';
        }).catch((error) => {
            console.error('Error uploading topper data:', error);
            alert('Error uploading topper data. Please try again.');
        });
    });
    
    removeTopperBtn.addEventListener('click', function() {
        const rank = document.getElementById('topperRankUpload').value;
        
        if (rank === '') {
            alert('Please enter rank to remove');
            return;
        }
        
        remove(ref(window.db, `toppers/${rank}`)).then(() => {
            alert('Topper data removed successfully');
            document.getElementById('topperRankUpload').value = '';
        }).catch((error) => {
            console.error('Error removing topper data:', error);
            alert('Error removing topper data. Please try again.');
        });
    });
    
    removeAllToppersBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to remove all topper data? This action cannot be undone.')) {
            remove(ref(window.db, 'toppers')).then(() => {
                alert('All topper data removed successfully');
            }).catch((error) => {
                console.error('Error removing all topper data:', error);
                alert('Error removing all topper data. Please try again.');
            });
        }
    });
});


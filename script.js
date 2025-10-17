// Firebase database reference
let database;

// Wait for Firebase to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is initialized
    const checkFirebase = setInterval(() => {
        if (window.firebaseDatabase) {
            database = window.firebaseDatabase;
            console.log("Firebase connected successfully!");
            clearInterval(checkFirebase);
            
            // Initialize all event listeners after Firebase is ready
            initializeApp();
        }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
        if (!database) {
            console.error("Firebase initialization timeout");
            showToast("Firebase connection failed. Please refresh the page.", true);
            clearInterval(checkFirebase);
        }
    }, 10000);
});

function initializeApp() {
    // DOM Elements
    const checkResultBtn = document.getElementById('checkResultBtn');
    const resultModal = document.getElementById('resultModal');
    const closeModal = document.getElementById('closeModal');
    const cancelResultBtn = document.getElementById('cancelResultBtn');
    const adminLoginLink = document.getElementById('adminLoginLink');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const uploadResultBtn = document.getElementById('uploadResultBtn');
    const removeAllDataBtn = document.getElementById('removeAllDataBtn');
    const resultCard = document.getElementById('resultCard');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const toast = document.getElementById('toast');

    // Show result modal with Firebase data
    checkResultBtn.addEventListener('click', async function() {
        const studentName = document.getElementById('studentName').value.trim();
        const rollNumber = document.getElementById('rollNumber').value.trim();
        
        if (!studentName || !rollNumber) {
            showToast('Please enter both student name and roll number', true);
            return;
        }
        
        // Show modal first
        resultModal.style.display = 'flex';
        resultCard.style.display = 'none';
        loadingIndicator.style.display = 'block';
        
        try {
            // Check if Firebase is initialized
            if (!database) {
                throw new Error("Firebase not initialized");
            }
            
            // Import Firebase functions dynamically
            const { ref, get } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js");
            
            // Fetch result from Firebase
            const resultRef = ref(database, 'results/' + rollNumber);
            const snapshot = await get(resultRef);
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            if (snapshot.exists()) {
                const resultData = snapshot.val();
                
                // Verify student name matches
                if (resultData.studentName.toLowerCase() !== studentName.toLowerCase()) {
                    showToast('Student name does not match with roll number', true);
                    resultModal.style.display = 'none';
                    return;
                }
                
                // Display result
                displayResult(resultData);
                resultCard.style.display = 'block';
            } else {
                showToast('No result found for the provided details', true);
                resultModal.style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching result:", error);
            loadingIndicator.style.display = 'none';
            showToast('Error fetching result. Please try again.', true);
            resultModal.style.display = 'none';
        }
    });

    // Display result with animations
    function displayResult(resultData) {
        const percentage = calculatePercentage(resultData);
        const grade = calculateGrade(percentage);
        const status = calculateStatus(percentage);
        const totalMarks = calculateTotalMarks(resultData);
        const failSubjects = getFailSubjects(resultData);
        
        resultCard.innerHTML = `
            <div class="student-info">
                <div class="student-details">
                    <div class="student-detail-row">
                        <span><strong>Name:</strong></span>
                        <span>${resultData.studentName}</span>
                    </div>
                    <div class="student-detail-row">
                        <span><strong>Year:</strong></span>
                        <span>2025-2026</span>
                    </div>
                    <div class="student-detail-row">
                        <span><strong>Class:</strong></span>
                        <span>${resultData.class}</span>
                    </div>
                    <div class="student-detail-row">
                        <span><strong>Roll No:</strong></span>
                        <span>${resultData.rollNumber}</span>
                    </div>
                </div>
            </div>
            
            ${createSubjectHTML('Hindi', resultData.hindi)}
            ${createSubjectHTML('English', resultData.english)}
            ${createSubjectHTML('Mathematics', resultData.math)}
            ${createSubjectHTML('Science', resultData.science)}
            ${createSubjectHTML('Social Science', resultData.socialScience)}
            ${createSubjectHTML('Sanskrit', resultData.sanskrit)}
            
            <div class="total-marks">
                <span class="subject-name"><i class="fas fa-chart-bar"></i> Total Marks</span>
                <span class="subject-marks">${totalMarks}/600</span>
            </div>
            
            ${failSubjects.length > 0 ? `
                <div class="fail-subjects">
                    <h3><i class="fas fa-exclamation-triangle"></i> Fail Subjects Summary</h3>
                    <ul class="fail-list">
                        ${failSubjects.map(subject => `<li>${subject}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="result-summary">
                <div>
                    <p><strong><i class="fas fa-percentage"></i> Percentage:</strong> <span class="percentage">${percentage}%</span></p>
                    <p><strong><i class="fas fa-star"></i> Grade:</strong> <span class="grade">${grade}</span></p>
                </div>
                <div>
                    <p class="status ${status.class}">${status.text}</p>
                </div>
            </div>
        `;
    }

    // Create HTML for each subject with fail status
    function createSubjectHTML(subjectName, marks) {
        const isFail = parseInt(marks) < 30;
        const iconClass = getSubjectIcon(subjectName);
        
        return `
            <div class="subject-container">
                <div class="subject-row ${isFail ? 'fail' : ''}">
                    <span class="subject-name"><i class="${iconClass}"></i> ${subjectName}</span>
                    <span class="subject-marks">${marks}/100</span>
                </div>
                ${isFail ? `
                    <div class="fail-status">
                        <i class="fas fa-times-circle"></i>
                        FAIL - Needs Improvement
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Get icon for each subject
    function getSubjectIcon(subjectName) {
        const icons = {
            'Hindi': 'fas fa-book',
            'English': 'fas fa-language',
            'Mathematics': 'fas fa-calculator',
            'Science': 'fas fa-flask',
            'Social Science': 'fas fa-globe-asia',
            'Sanskrit': 'fas fa-om'
        };
        return icons[subjectName] || 'fas fa-book';
    }

    // Get fail subjects (marks less than 30)
    function getFailSubjects(resultData) {
        const failSubjects = [];
        const subjects = [
            { name: 'Hindi', marks: resultData.hindi },
            { name: 'English', marks: resultData.english },
            { name: 'Mathematics', marks: resultData.math },
            { name: 'Science', marks: resultData.science },
            { name: 'Social Science', marks: resultData.socialScience },
            { name: 'Sanskrit', marks: resultData.sanskrit }
        ];
        
        subjects.forEach(subject => {
            if (parseInt(subject.marks) < 30) {
                failSubjects.push(`${subject.name} - ${subject.marks}/100`);
            }
        });
        
        return failSubjects;
    }

    // Calculate total marks
    function calculateTotalMarks(resultData) {
        return parseInt(resultData.hindi) + parseInt(resultData.english) + 
               parseInt(resultData.math) + parseInt(resultData.science) + 
               parseInt(resultData.socialScience) + parseInt(resultData.sanskrit);
    }

    // Calculate percentage
    function calculatePercentage(resultData) {
        const total = calculateTotalMarks(resultData);
        return (total / 6).toFixed(2);
    }

    // Calculate grade based on percentage
    function calculateGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    }

    // Calculate status/division
    function calculateStatus(percentage) {
        if (percentage >= 60) return { text: 'FIRST DIVISION', class: 'first' };
        if (percentage >= 45) return { text: 'SECOND DIVISION', class: 'second' };
        if (percentage >= 33) return { text: 'THIRD DIVISION', class: 'third' };
        return { text: 'FAIL', class: 'fail' };
    }

    // Close result modal and clear input fields
    function closeResultModal() {
        resultModal.style.display = 'none';
        document.getElementById('studentName').value = '';
        document.getElementById('rollNumber').value = '';
    }

    closeModal.addEventListener('click', closeResultModal);
    cancelResultBtn.addEventListener('click', closeResultModal);

    // Show admin login modal
    adminLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        adminModal.style.display = 'flex';
    });

    // Close admin login modal and clear input fields
    function closeAdminLoginModal() {
        adminModal.style.display = 'none';
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }

    closeAdminModal.addEventListener('click', closeAdminLoginModal);

    // Admin login
    adminLoginBtn.addEventListener('click', function() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        // Updated username and password as requested
        if (username === 'Pksss' && password === '654321') {
            adminModal.style.display = 'none';
            document.querySelector('.container').style.display = 'none';
            adminPanel.style.display = 'block';
            showToast('Admin login successful');
            
            // Clear login fields
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
        } else {
            showToast('Invalid username or password. Try Pksss/654321', true);
        }
    });

    // Upload result to Firebase
    uploadResultBtn.addEventListener('click', async function() {
        const studentName = document.getElementById('adminStudentName').value.trim();
        const rollNumber = document.getElementById('adminRollNumber').value.trim();
        const studentClass = document.getElementById('adminClass').value;
        const hindi = document.getElementById('hindiMarks').value;
        const english = document.getElementById('englishMarks').value;
        const math = document.getElementById('mathMarks').value;
        const science = document.getElementById('scienceMarks').value;
        const socialScience = document.getElementById('socialMarks').value;
        const sanskrit = document.getElementById('sanskritMarks').value;
        
        // Validate inputs
        if (!studentName || !rollNumber || !studentClass || !hindi || !english || !math || !science || !socialScience || !sanskrit) {
            showToast('Please fill all fields', true);
            return;
        }
        
        try {
            // Check if Firebase is initialized
            if (!database) {
                throw new Error("Firebase not initialized");
            }
            
            // Import Firebase functions dynamically
            const { ref, set } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js");
            
            // Prepare result data
            const resultData = {
                studentName,
                rollNumber,
                class: studentClass,
                hindi,
                english,
                math,
                science,
                socialScience,
                sanskrit,
                timestamp: new Date().toISOString()
            };
            
            // Upload to Firebase
            const resultRef = ref(database, 'results/' + rollNumber);
            await set(resultRef, resultData);
            
            showToast('Result uploaded successfully');
            
            // Clear form
            document.getElementById('adminStudentName').value = '';
            document.getElementById('adminRollNumber').value = '';
            document.getElementById('adminClass').value = '';
            document.getElementById('hindiMarks').value = '';
            document.getElementById('englishMarks').value = '';
            document.getElementById('mathMarks').value = '';
            document.getElementById('scienceMarks').value = '';
            document.getElementById('socialMarks').value = '';
            document.getElementById('sanskritMarks').value = '';
        } catch (error) {
            console.error("Error uploading result:", error);
            showToast('Error uploading result. Please try again.', true);
        }
    });

    // Remove all data from Firebase - UPDATED CONFIRMATION
    removeAllDataBtn.addEventListener('click', async function() {
        // Create custom confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'modal';
        confirmationModal.style.display = 'flex';
        confirmationModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #f44336; margin-bottom: 20px;"></i>
                    <h2 style="color: #f44336; margin-bottom: 15px;">Confirm Delete</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 25px; line-height: 1.5;">
                        Are you sure you want to delete <strong>ALL</strong> student results?<br>
                        This action <strong style="color: #f44336;">cannot be undone</strong>!
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="confirmDelete" class="btn btn-remove" style="flex: 1;">
                            <i class="fas fa-trash-alt"></i> Yes, Delete All
                        </button>
                        <button id="cancelDelete" class="btn" style="flex: 1; background: linear-gradient(135deg, #6c757d, #495057);">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmationModal);
        
        // Handle confirmation
        document.getElementById('confirmDelete').addEventListener('click', async function() {
            confirmationModal.remove();
            
            try {
                // Check if Firebase is initialized
                if (!database) {
                    throw new Error("Firebase not initialized");
                }
                
                // Import Firebase functions dynamically
                const { ref, remove } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js");
                
                // Remove all results
                const resultsRef = ref(database, 'results');
                await remove(resultsRef);
                
                showToast('All student results have been deleted successfully');
            } catch (error) {
                console.error("Error removing data:", error);
                showToast('Error deleting data. Please try again.', true);
            }
        });
        
        // Handle cancellation
        document.getElementById('cancelDelete').addEventListener('click', function() {
            confirmationModal.remove();
            showToast('Deletion cancelled', false);
        });
        
        // Close modal when clicking outside
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                confirmationModal.remove();
                showToast('Deletion cancelled', false);
            }
        });
    });

    // Logout from admin panel
    logoutBtn.addEventListener('click', function() {
        adminPanel.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        showToast('Logged out successfully');
    });

    // Show toast notification
    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.className = isError ? 'toast error' : 'toast';
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === resultModal) {
            closeResultModal();
        }
        if (e.target === adminModal) {
            closeAdminLoginModal();
        }
    });
}
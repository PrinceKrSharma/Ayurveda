// Ayurvedic Healthcare Management System - JavaScript (Fixed Authentication)

// Application State
let currentUser = null;
let currentAssessmentSection = 1;
let totalAssessmentSections = 5;
let assessmentData = {};
let currentPatientData = null;

// Sample user database (Fixed credentials)
const users = [
    {
        id: 1,
        email: "admin@ayurveda.com",
        password: "admin123",
        role: "admin",
        name: "System Administrator",
        mobile: "+91-9876543210"
    },
    {
        id: 2,
        email: "dr.rajesh@hospital.com",
        password: "doctor123",
        role: "doctor",
        name: "Dr. Rajesh Kumar",
        mobile: "+91-9876543211",
        license: "AY12345",
        specialization: "General Ayurveda",
        hospital: "City Ayurvedic Center"
    },
    {
        id: 3,
        email: "priya@email.com",
        password: "patient123",
        role: "patient",
        name: "Mrs. Priya Sharma",
        mobile: "+91-9876543212",
        age: 32,
        dosha: "Vata-Pitta"
    }
];

// Dosha Characteristics Database
const doshaData = {
    Vata: {
        description: "Air and Space elements. Quick thinking, creative, energetic but prone to anxiety and irregularity. Vata types are naturally thin, with dry skin and variable appetite. They are creative and enthusiastic when in balance, but can become anxious and restless when imbalanced.",
        traits: ["Quick thinking", "Creative", "Energetic", "Variable appetite", "Light sleep", "Dry skin"],
        foods_favor: ["Warm foods", "Sweet fruits", "Rice", "Nuts", "Dairy", "Ghee", "Cooked vegetables"],
        foods_avoid: ["Raw foods", "Dry foods", "Caffeine", "Beans", "Cold foods", "Bitter vegetables"],
        lifestyle: "Regular routine, warm environment, gentle exercise, oil massage, adequate sleep",
        weekly_plan: {
            Monday: {
                breakfast: "Warm oatmeal with ghee, dates and almonds",
                lunch: "Rice with moong dal, cooked vegetables and ghee",
                dinner: "Khichdi with vegetables and warm milk",
                snacks: "Dates, nuts and herbal tea"
            },
            Tuesday: {
                breakfast: "Upma with vegetables and coconut",
                lunch: "Chapati with dal, cooked spinach and ghee",
                dinner: "Vegetable soup with bread and butter",
                snacks: "Banana with almonds and warm water"
            },
            Wednesday: {
                breakfast: "Poha with peanuts and ghee",
                lunch: "Rice with rajma and cooked carrots",
                dinner: "Moong dal khichdi with ghee",
                snacks: "Sweet lassi and dates"
            },
            Thursday: {
                breakfast: "Paratha with curd and jaggery",
                lunch: "Rice with sambhar and cooked vegetables",
                dinner: "Vegetable pulav with raita",
                snacks: "Herbal tea with digestive biscuits"
            },
            Friday: {
                breakfast: "Daliya with milk and nuts",
                lunch: "Chapati with chana dal and cooked bottle gourd",
                dinner: "Rice with rasam and steamed vegetables",
                snacks: "Coconut water and cashews"
            },
            Saturday: {
                breakfast: "Idli with sambhar and coconut chutney",
                lunch: "Rice with curd and cooked beetroot",
                dinner: "Vegetable kheer and rotis",
                snacks: "Warm milk with turmeric and honey"
            },
            Sunday: {
                breakfast: "Pancakes with ghee and honey",
                lunch: "Biryani with raita and cooked vegetables",
                dinner: "Light soup with bread and ghee",
                snacks: "Fresh fruit juice and nuts"
            }
        }
    },
    Pitta: {
        description: "Fire and Water elements. Intelligent, focused, strong digestion but prone to anger and heat. Pitta types have medium build, warm skin, and strong appetite. They are natural leaders with sharp intellect, but can become irritable and impatient when imbalanced.",
        traits: ["Intelligent", "Focused", "Strong digestion", "Competitive", "Good leadership", "Warm skin"],
        foods_favor: ["Cool foods", "Sweet fruits", "Leafy greens", "Coconut", "Milk", "Cucumber", "Rice"],
        foods_avoid: ["Spicy foods", "Sour foods", "Alcohol", "Red meat", "Hot foods", "Vinegar"],
        lifestyle: "Moderate exercise, cool environment, avoid overwork, meditation, stress management",
        weekly_plan: {
            Monday: {
                breakfast: "Cool cereal with milk and sweet fruits",
                lunch: "Rice with cooling vegetables and coconut",
                dinner: "Light salad with cooling herbs and buttermilk",
                snacks: "Sweet fruits and coconut water"
            },
            Tuesday: {
                breakfast: "Oats with banana and milk",
                lunch: "Chapati with bottle gourd curry and curd",
                dinner: "Rice with moong dal and steamed broccoli",
                snacks: "Lassi and cucumber slices"
            },
            Wednesday: {
                breakfast: "Poha with coconut and mint",
                lunch: "Rice with ridge gourd curry and buttermilk",
                dinner: "Vegetable salad with yogurt dressing",
                snacks: "Watermelon juice and almonds"
            },
            Thursday: {
                breakfast: "Upma with vegetables and coconut",
                lunch: "Rice with ash gourd curry and curd",
                dinner: "Light khichdi with ghee and coriander",
                snacks: "Coconut water and sweet grapes"
            },
            Friday: {
                breakfast: "Cornflakes with cold milk and banana",
                lunch: "Chapati with cucumber raita and mint chutney",
                dinner: "Rice with cooling dal and steamed cabbage",
                snacks: "Melon juice and pistachios"
            },
            Saturday: {
                breakfast: "Idli with coconut chutney and sambhar",
                lunch: "Rice with snake gourd curry and buttermilk",
                dinner: "Vegetable soup with bread and butter",
                snacks: "Rose milk and dates"
            },
            Sunday: {
                breakfast: "Dosa with coconut chutney and sambhar",
                lunch: "Rice with white pumpkin curry and curd",
                dinner: "Light salad with cooling herbs",
                snacks: "Fresh lime water and cashews"
            }
        }
    },
    Kapha: {
        description: "Earth and Water elements. Calm, stable, strong immunity but prone to weight gain and sluggishness. Kapha types have heavy build, smooth skin, and steady appetite. They are naturally calm and patient, but can become lethargic and possessive when imbalanced.",
        traits: ["Calm", "Stable", "Strong immunity", "Slow metabolism", "Good memory", "Smooth skin"],
        foods_favor: ["Spicy foods", "Light foods", "Ginger", "Honey", "Vegetables", "Herbal teas", "Barley"],
        foods_avoid: ["Heavy foods", "Dairy", "Sweet foods", "Cold foods", "Oily foods", "Nuts"],
        lifestyle: "Regular vigorous exercise, warm dry environment, early rising, active lifestyle",
        weekly_plan: {
            Monday: {
                breakfast: "Herbal tea with light spiced porridge",
                lunch: "Barley with spiced vegetables and ginger",
                dinner: "Light vegetable soup with warming spices",
                snacks: "Spiced tea and light crackers"
            },
            Tuesday: {
                breakfast: "Green tea with steamed vegetables",
                lunch: "Millet with spicy dal and cooked greens",
                dinner: "Clear broth with vegetables and herbs",
                snacks: "Ginger tea and rice cakes"
            },
            Wednesday: {
                breakfast: "Herbal decoction with light breakfast",
                lunch: "Quinoa with spiced cauliflower and radish",
                dinner: "Vegetable clear soup with black pepper",
                snacks: "Warm water with honey and lemon"
            },
            Thursday: {
                breakfast: "Spiced tea with steamed sprouts",
                lunch: "Barley with bitter gourd and turmeric",
                dinner: "Light khichdi with minimal ghee",
                snacks: "Herbal tea and puffed rice"
            },
            Friday: {
                breakfast: "Green tea with vegetable upma",
                lunch: "Millet with spiced okra and ginger",
                dinner: "Clear vegetable broth with herbs",
                snacks: "Warm water with honey and cinnamon"
            },
            Saturday: {
                breakfast: "Herbal tea with light idli and sambhar",
                lunch: "Quinoa with spiced cabbage and turmeric",
                dinner: "Light soup with warming spices",
                snacks: "Ginger tea and roasted chickpeas"
            },
            Sunday: {
                breakfast: "Spiced tea with steamed vegetables",
                lunch: "Barley with spiced eggplant and coriander",
                dinner: "Clear broth with vegetables and black pepper",
                snacks: "Herbal decoction and light snacks"
            }
        }
    }
};

// Sample recipes for each dosha
const recipes = {
    Vata: [
        {
            name: "Khichdi (Vata Balancing)",
            time: "25 min",
            serves: 4,
            difficulty: "Easy",
            ingredients: [
                "1 cup basmati rice",
                "1/2 cup moong dal",
                "1 tsp ghee",
                "1/2 tsp turmeric",
                "Salt to taste",
                "4 cups water"
            ],
            instructions: [
                "Wash rice and dal together thoroughly",
                "Heat ghee in pressure cooker",
                "Add rice, dal, turmeric and salt",
                "Add 4 cups water and mix well",
                "Pressure cook for 3 whistles",
                "Let pressure release naturally",
                "Serve hot with additional ghee"
            ]
        }
    ],
    Pitta: [
        {
            name: "Cooling Cucumber Raita",
            time: "10 min",
            serves: 4,
            difficulty: "Easy",
            ingredients: [
                "2 cucumbers, grated",
                "1 cup fresh yogurt",
                "1 tsp roasted cumin powder",
                "Fresh mint leaves",
                "Salt to taste",
                "1 tsp honey"
            ],
            instructions: [
                "Grate cucumbers and squeeze out excess water",
                "Beat yogurt until smooth",
                "Mix cucumbers with yogurt",
                "Add cumin powder, mint, salt and honey",
                "Chill for 30 minutes before serving",
                "Garnish with fresh mint leaves"
            ]
        }
    ],
    Kapha: [
        {
            name: "Spiced Barley Soup",
            time: "30 min",
            serves: 4,
            difficulty: "Medium",
            ingredients: [
                "1 cup pearl barley",
                "2 tsp ginger-garlic paste",
                "1 tsp turmeric",
                "1 tsp black pepper",
                "Mixed vegetables",
                "4 cups water",
                "Salt to taste"
            ],
            instructions: [
                "Soak barley for 2 hours",
                "Heat oil and add ginger-garlic paste",
                "Add turmeric, pepper and vegetables",
                "Add barley and water",
                "Cook until barley is soft",
                "Season with salt and serve hot"
            ]
        }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ayurvedic Healthcare System initialized');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    showPage('login-page');
    hideHeader();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Assessment form
    const assessmentForm = document.getElementById('patient-assessment-form');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleAssessmentSubmission);
    }
    
    // Checkbox handling for medical conditions
    document.addEventListener('change', function(e) {
        if (e.target.name === 'conditions') {
            handleConditionCheckboxes(e);
        }
    });
}

// Page Management
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
    
    // Show/hide header
    const header = document.getElementById('app-header');
    if (header) {
        header.style.display = pageId === 'login-page' ? 'none' : 'block';
    }
}

function hideHeader() {
    const header = document.getElementById('app-header');
    if (header) {
        header.style.display = 'none';
    }
}

// Authentication Functions
function showAuthForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    if (formType === 'login') {
        loginForm.classList.add('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.remove('active');
        registerForm.classList.add('hidden');
        authTabs[0].classList.add('active');
        authTabs[1].classList.remove('active');
    } else {
        registerForm.classList.add('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.remove('active');
        loginForm.classList.add('hidden');
        authTabs[1].classList.add('active');
        authTabs[0].classList.remove('active');
    }
}

function updateRegistrationFields() {
    const role = document.getElementById('register-role').value;
    const roleFields = document.querySelectorAll('.role-fields');
    
    // Hide all role fields
    roleFields.forEach(field => field.classList.add('hidden'));
    
    // Show relevant fields
    if (role === 'doctor') {
        document.getElementById('doctor-fields').classList.remove('hidden');
    } else if (role === 'patient') {
        document.getElementById('patient-fields').classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const role = document.getElementById('login-role').value;
    
    console.log('Login attempt:', { email, role, passwordLength: password.length });
    
    if (!email || !password || !role) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Find user with exact matching (case-insensitive email, exact role and password)
    const user = users.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
        const passwordMatch = u.password === password;
        const roleMatch = u.role === role;
        
        console.log('Checking user:', u.email, {
            emailMatch,
            passwordMatch,
            roleMatch,
            userRole: u.role,
            inputRole: role
        });
        
        return emailMatch && passwordMatch && roleMatch;
    });
    
    if (user) {
        console.log('Login successful for:', user.name, user.role);
        currentUser = user;
        updateUserInterface();
        showRoleDashboard(user.role);
        showMessage(`Welcome ${user.name}!`, 'success');
    } else {
        console.log('Login failed - no matching user found');
        showMessage('Invalid credentials. Please check your email, password, and role.', 'error');
    }
}

function handleRegistration(e) {
    e.preventDefault();
    
    const role = document.getElementById('register-role').value;
    const name = document.getElementById('register-name').value.trim();
    const mobile = document.getElementById('register-mobile').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    
    if (!role || !name || !mobile || !email || !password) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        email: email,
        password: password,
        role: role,
        name: name,
        mobile: mobile
    };
    
    users.push(newUser);
    console.log('New user registered:', newUser);
    showMessage('Registration successful! Please login with your credentials.', 'success');
    showAuthForm('login');
    
    // Clear form
    document.getElementById('register-form').reset();
    updateRegistrationFields();
}

function updateUserInterface() {
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    if (currentUser && userInfo && userName && userRole) {
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.name;
        userRole.textContent = `(${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)})`;
    }
}

function showRoleDashboard(role) {
    const dashboards = {
        admin: 'admin-dashboard',
        doctor: 'doctor-dashboard',
        patient: 'patient-dashboard'
    };
    
    console.log('Showing dashboard for role:', role);
    if (dashboards[role]) {
        showPage(dashboards[role]);
    } else {
        console.error('Unknown role dashboard:', role);
        showMessage('Dashboard error - unknown role', 'error');
    }
}

function logout() {
    currentUser = null;
    currentPatientData = null;
    assessmentData = {};
    hideHeader();
    
    // Clear login form
    document.getElementById('login-form').reset();
    
    showPage('login-page');
    showMessage('Logged out successfully', 'success');
}

// Assessment Functions
function showPatientAssessment() {
    currentAssessmentSection = 1;
    assessmentData = {};
    showPage('assessment-page');
    showAssessmentSection(1);
    updateAssessmentProgress();
    updateAssessmentNavigation();
}

function showAssessmentSection(sectionNum) {
    // Hide all sections
    const sections = document.querySelectorAll('.assessment-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    // Show target section
    const sectionNames = ['demographics-section', 'vitals-section', 'lifestyle-section', 'ayurvedic-section', 'history-section'];
    const targetSection = document.getElementById(sectionNames[sectionNum - 1]);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
}

function nextSection() {
    if (validateCurrentSection()) {
        collectSectionData();
        
        if (currentAssessmentSection < totalAssessmentSections) {
            currentAssessmentSection++;
            showAssessmentSection(currentAssessmentSection);
            updateAssessmentProgress();
            updateAssessmentNavigation();
        }
    }
}

function previousSection() {
    if (currentAssessmentSection > 1) {
        currentAssessmentSection--;
        showAssessmentSection(currentAssessmentSection);
        updateAssessmentProgress();
        updateAssessmentNavigation();
    }
}

function updateAssessmentProgress() {
    const progressFill = document.getElementById('assessment-progress');
    const progressText = document.getElementById('assessment-progress-text');
    
    if (progressFill && progressText) {
        const percentage = (currentAssessmentSection / totalAssessmentSections) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Step ${currentAssessmentSection} of ${totalAssessmentSections}`;
    }
}

function updateAssessmentNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const completeBtn = document.getElementById('complete-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentAssessmentSection > 1 ? 'block' : 'none';
    }
    
    if (nextBtn && completeBtn) {
        if (currentAssessmentSection === totalAssessmentSections) {
            nextBtn.style.display = 'none';
            completeBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            completeBtn.style.display = 'none';
        }
    }
}

function validateCurrentSection() {
    const sectionNames = ['demographics-section', 'vitals-section', 'lifestyle-section', 'ayurvedic-section', 'history-section'];
    const currentSection = document.getElementById(sectionNames[currentAssessmentSection - 1]);
    
    if (!currentSection) return false;
    
    const requiredFields = currentSection.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            const label = field.previousElementSibling?.textContent || 'required field';
            showMessage(`Please fill in: ${label}`, 'error');
            return false;
        }
    }
    return true;
}

function collectSectionData() {
    const sectionNames = ['demographics-section', 'vitals-section', 'lifestyle-section', 'ayurvedic-section', 'history-section'];
    const currentSection = document.getElementById(sectionNames[currentAssessmentSection - 1]);
    
    if (!currentSection) return;
    
    const inputs = currentSection.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!assessmentData[input.name]) {
                    assessmentData[input.name] = [];
                }
                assessmentData[input.name].push(input.value);
            }
        } else if (input.value) {
            assessmentData[input.name] = input.value;
        }
    });
    
    console.log('Collected data for section', currentAssessmentSection, assessmentData);
}

function handleAssessmentSubmission(e) {
    e.preventDefault();
    console.log('Assessment submission triggered');
    
    if (validateCurrentSection()) {
        collectSectionData();
        
        console.log('Final assessment data:', assessmentData);
        
        // Show loading page
        showPage('loading-page');
        updateLoadingProgress();
        
        // Simulate processing time
        setTimeout(() => {
            processAssessmentResults();
        }, 3000);
    }
}

function updateLoadingProgress() {
    const loadingBar = document.getElementById('loading-bar');
    const loadingMessage = document.getElementById('loading-message');
    const loadingDetails = document.getElementById('loading-details');
    
    let progress = 0;
    const messages = [
        { msg: "Processing Assessment...", detail: "Analyzing patient data using Ayurvedic principles" },
        { msg: "Calculating Dosha Balance...", detail: "Determining constitutional type based on responses" },
        { msg: "Generating Recommendations...", detail: "Creating personalized diet and lifestyle plan" }
    ];
    
    const interval = setInterval(() => {
        progress += 33.33;
        if (loadingBar) loadingBar.style.width = `${Math.min(progress, 100)}%`;
        
        const messageIndex = Math.floor(progress / 33.33) - 1;
        if (messageIndex >= 0 && messageIndex < messages.length) {
            if (loadingMessage) loadingMessage.textContent = messages[messageIndex].msg;
            if (loadingDetails) loadingDetails.textContent = messages[messageIndex].detail;
        }
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 1000);
}

function processAssessmentResults() {
    console.log('Processing assessment results...');
    
    // Perform dosha analysis
    const analysisResults = performDoshaAnalysis(assessmentData);
    
    currentPatientData = {
        ...assessmentData,
        ...analysisResults,
        assessmentDate: new Date().toLocaleDateString()
    };
    
    console.log('Analysis complete:', currentPatientData);
    
    // Show results page
    showResults();
}

function performDoshaAnalysis(data) {
    console.log('Performing dosha analysis on:', data);
    
    let scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    
    // Body frame analysis
    if (data.body_frame === 'Thin/Light') scores.Vata += 3;
    else if (data.body_frame === 'Medium') scores.Pitta += 3;
    else if (data.body_frame === 'Heavy/Large') scores.Kapha += 3;
    
    // Skin type analysis
    if (data.skin_type === 'Dry') scores.Vata += 2;
    else if (data.skin_type === 'Oily') scores.Kapha += 2;
    else scores.Pitta += 1;
    
    // Hair type analysis
    if (data.hair_type === 'Dry/Thin') scores.Vata += 2;
    else if (data.hair_type === 'Oily/Thick') scores.Kapha += 2;
    else scores.Pitta += 1;
    
    // Appetite analysis
    if (data.appetite === 'Variable') scores.Vata += 2;
    else if (data.appetite === 'Strong') scores.Pitta += 2;
    else if (data.appetite === 'Low') scores.Kapha += 2;
    else scores.Pitta += 1;
    
    // Digestion analysis
    if (data.digestion === 'Quick/Variable') scores.Vata += 2;
    else if (data.digestion === 'Strong/Fast') scores.Pitta += 2;
    else if (data.digestion === 'Slow/Steady') scores.Kapha += 2;
    
    // Sleep pattern analysis
    if (data.sleep_pattern === 'Light sleeper') scores.Vata += 2;
    else if (data.sleep_pattern === 'Heavy sleeper') scores.Kapha += 2;
    else scores.Pitta += 1;
    
    // Mental state analysis
    if (data.mental_state === 'Anxious/Restless') scores.Vata += 2;
    else if (data.mental_state === 'Focused/Intense') scores.Pitta += 2;
    else if (data.mental_state === 'Calm/Steady') scores.Kapha += 2;
    
    // Activity level influence
    if (data.activity_level === 'Sedentary') scores.Kapha += 1;
    else if (data.activity_level === 'Very Active') scores.Vata += 1;
    
    // Stress level influence
    if (data.stress_level === 'High' || data.stress_level === 'Severe') scores.Vata += 1;
    
    // Add some base scores to ensure realistic distribution
    scores.Vata += 2;
    scores.Pitta += 2;
    scores.Kapha += 2;
    
    const totalScore = scores.Vata + scores.Pitta + scores.Kapha;
    const percentages = {
        Vata: Math.round((scores.Vata / totalScore) * 100),
        Pitta: Math.round((scores.Pitta / totalScore) * 100),
        Kapha: Math.round((scores.Kapha / totalScore) * 100)
    };
    
    // Ensure percentages add up to 100
    const total = percentages.Vata + percentages.Pitta + percentages.Kapha;
    if (total !== 100) {
        const diff = 100 - total;
        percentages.Vata += diff;
    }
    
    const dominantDosha = Object.keys(percentages).reduce((a, b) => 
        percentages[a] > percentages[b] ? a : b
    );
    
    console.log('Dosha analysis result:', { dominantDosha, percentages, scores });
    
    return {
        dominantDosha,
        percentages,
        confidence: percentages[dominantDosha]
    };
}

function showResults() {
    console.log('Showing results page');
    showPage('results-page');
    populateResults();
}

function populateResults() {
    if (!currentPatientData) {
        console.error('No patient data available for results');
        return;
    }
    
    console.log('Populating results with:', currentPatientData);
    
    // Update patient info
    const patientName = document.getElementById('results-patient-name');
    const resultsDate = document.getElementById('results-date');
    
    if (patientName) patientName.textContent = currentPatientData['patient-name'] || 'Patient';
    if (resultsDate) resultsDate.textContent = `Date: ${currentPatientData.assessmentDate}`;
    
    // Update primary dosha
    const primaryDoshaName = document.getElementById('primary-dosha-name');
    const primaryDoshaConfidence = document.getElementById('primary-dosha-confidence');
    
    if (primaryDoshaName) primaryDoshaName.textContent = currentPatientData.dominantDosha;
    if (primaryDoshaConfidence) primaryDoshaConfidence.textContent = `${currentPatientData.confidence}% Confidence`;
    
    // Update dosha scores
    updateDoshaScores();
    
    // Update dosha description
    updateDoshaDescription();
    
    // Create dosha chart
    createDoshaChart();
}

function updateDoshaScores() {
    const percentages = currentPatientData.percentages;
    
    // Update Vata
    const vataBar = document.getElementById('vata-bar');
    const vataScore = document.getElementById('vata-score');
    if (vataBar) vataBar.style.width = `${percentages.Vata}%`;
    if (vataScore) vataScore.textContent = `${percentages.Vata}%`;
    
    // Update Pitta
    const pittaBar = document.getElementById('pitta-bar');
    const pittaScore = document.getElementById('pitta-score');
    if (pittaBar) pittaBar.style.width = `${percentages.Pitta}%`;
    if (pittaScore) pittaScore.textContent = `${percentages.Pitta}%`;
    
    // Update Kapha
    const kaphaBar = document.getElementById('kapha-bar');
    const kaphaScore = document.getElementById('kapha-score');
    if (kaphaBar) kaphaBar.style.width = `${percentages.Kapha}%`;
    if (kaphaScore) kaphaScore.textContent = `${percentages.Kapha}%`;
}

function updateDoshaDescription() {
    const doshaDescription = document.getElementById('dosha-description');
    const dominantDosha = currentPatientData.dominantDosha;
    
    if (doshaDescription && doshaData[dominantDosha]) {
        const data = doshaData[dominantDosha];
        doshaDescription.innerHTML = `
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Key Traits:</strong> ${data.traits.join(', ')}</p>
            <p><strong>Lifestyle Recommendations:</strong> ${data.lifestyle}</p>
        `;
    }
}

function createDoshaChart() {
    const canvas = document.getElementById('dosha-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const percentages = currentPatientData.percentages;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Vata', 'Pitta', 'Kapha'],
            datasets: [{
                data: [percentages.Vata, percentages.Pitta, percentages.Kapha],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Diet Plan Functions
function generateDietPlan() {
    console.log('Generating diet plan...');
    
    if (!currentPatientData) {
        showMessage('No assessment data available. Please complete assessment first.', 'error');
        return;
    }
    
    showPage('diet-plan-page');
    populateDietPlan();
    showMessage('Diet plan generated successfully!', 'success');
}

function populateDietPlan() {
    if (!currentPatientData) return;
    
    console.log('Populating diet plan with:', currentPatientData);
    
    // Update header information
    const planPatientName = document.getElementById('plan-patient-name');
    const planDosha = document.getElementById('plan-dosha');
    
    if (planPatientName) planPatientName.textContent = currentPatientData['patient-name'] || 'Patient';
    if (planDosha) planDosha.textContent = `Dosha: ${currentPatientData.dominantDosha}`;
    
    // Generate weekly plan
    generateWeeklyPlan();
    
    // Generate nutrition analysis
    generateNutritionAnalysis();
    
    // Generate recipes
    generateRecipes();
}

function generateWeeklyPlan() {
    const weeklyMeals = document.getElementById('weekly-meals');
    if (!weeklyMeals) return;
    
    const dosha = currentPatientData.dominantDosha;
    const weeklyPlan = doshaData[dosha]?.weekly_plan;
    
    if (!weeklyPlan) {
        console.error('No weekly plan found for dosha:', dosha);
        return;
    }
    
    weeklyMeals.innerHTML = '';
    
    Object.entries(weeklyPlan).forEach(([day, meals]) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.innerHTML = `
            <h4>${day}</h4>
            <div class="meal-slot">
                <strong>🌅 Breakfast</strong>
                <p>${meals.breakfast}</p>
                <div class="nutrition-mini">320 kcal | P: 12g | C: 45g | F: 12g</div>
            </div>
            <div class="meal-slot">
                <strong>🌞 Lunch</strong>
                <p>${meals.lunch}</p>
                <div class="nutrition-mini">450 kcal | P: 18g | C: 72g | F: 8g</div>
            </div>
            <div class="meal-slot">
                <strong>🌙 Dinner</strong>
                <p>${meals.dinner}</p>
                <div class="nutrition-mini">380 kcal | P: 15g | C: 65g | F: 6g</div>
            </div>
            <div class="meal-slot">
                <strong>🍎 Snacks</strong>
                <p>${meals.snacks}</p>
                <div class="nutrition-mini">180 kcal | P: 5g | C: 25g | F: 8g</div>
            </div>
        `;
        weeklyMeals.appendChild(dayColumn);
    });
}

function generateNutritionAnalysis() {
    // Calculate nutrition based on gender and activity level
    const gender = currentPatientData.gender?.toLowerCase() || 'male';
    const activityLevel = currentPatientData.activity_level?.toLowerCase().replace(' ', '_') || 'moderate';
    
    let calories, protein, carbs, fat;
    
    // Base nutrition targets
    if (gender === 'female') {
        calories = 1850;
        protein = 140;
        carbs = 250;
        fat = 60;
    } else {
        calories = 2200;
        protein = 165;
        carbs = 300;
        fat = 75;
    }
    
    // Adjust for activity level
    const activityMultipliers = {
        'sedentary': 0.9,
        'light': 1.0,
        'moderate': 1.1,
        'active': 1.2,
        'very_active': 1.3
    };
    
    const multiplier = activityMultipliers[activityLevel] || 1.0;
    calories = Math.round(calories * multiplier);
    protein = Math.round(protein * multiplier);
    carbs = Math.round(carbs * multiplier);
    fat = Math.round(fat * multiplier);
    
    // Update nutrition cards
    const totalCalories = document.getElementById('total-calories');
    const totalProtein = document.getElementById('total-protein');
    const totalCarbs = document.getElementById('total-carbs');
    const totalFat = document.getElementById('total-fat');
    
    if (totalCalories) totalCalories.textContent = calories;
    if (totalProtein) totalProtein.textContent = `${protein}g`;
    if (totalCarbs) totalCarbs.textContent = `${carbs}g`;
    if (totalFat) totalFat.textContent = `${fat}g`;
    
    // Create nutrition chart
    createNutritionChart();
}

function createNutritionChart() {
    const canvas = document.getElementById('nutrition-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Vitamin A', 'Vitamin C', 'Iron', 'Calcium', 'Protein', 'Fiber'],
            datasets: [{
                label: 'Daily Requirement Met (%)',
                data: [85, 92, 78, 88, 95, 82],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function generateRecipes() {
    const recipeContainer = document.getElementById('recipe-container');
    if (!recipeContainer) return;
    
    const dosha = currentPatientData.dominantDosha;
    const doshaRecipes = recipes[dosha] || [];
    
    recipeContainer.innerHTML = '';
    
    doshaRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <h4>${recipe.name}</h4>
            <div class="recipe-meta">
                <span>⏱ ${recipe.time}</span>
                <span>👥 ${recipe.serves} servings</span>
                <span>🔥 ${recipe.difficulty}</span>
            </div>
            <div class="recipe-ingredients">
                <h5>Ingredients:</h5>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            <div class="recipe-instructions">
                <h5>Instructions:</h5>
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            </div>
        `;
        recipeContainer.appendChild(recipeCard);
    });
    
    // Add general recipe information if no specific recipes available
    if (doshaRecipes.length === 0) {
        recipeContainer.innerHTML = `
            <div class="recipe-card">
                <h4>Recipe recommendations for ${dosha} Dosha will be available soon</h4>
                <p>Meanwhile, focus on the foods listed in the weekly meal plan.</p>
            </div>
        `;
    }
}

function showPlanTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.plan-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the correct tab
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });
    
    // Show content
    const contents = document.querySelectorAll('.plan-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    const targetContent = document.getElementById(`${tabName}-plan`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('active');
    }
}

// Report and Export Functions
function generateReport() {
    if (!currentPatientData) {
        showMessage('No assessment data available for report generation', 'error');
        return;
    }
    
    showMessage('Generating comprehensive report...', 'info');
    
    // In a real application, this would generate a PDF report
    setTimeout(() => {
        showMessage('Report generated successfully! Download feature would be available in production.', 'success');
    }, 1500);
}

function downloadDietPlan() {
    if (!currentPatientData) {
        showMessage('No diet plan data available', 'error');
        return;
    }
    
    const content = generateDietPlanText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPatientData['patient-name'] || 'Patient'}_Diet_Plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('Diet plan downloaded successfully!', 'success');
}

function generateDietPlanText() {
    const dosha = currentPatientData?.dominantDosha || 'Unknown';
    const patientName = currentPatientData?.['patient-name'] || 'Patient';
    const doshaInfo = doshaData[dosha];
    
    let content = `PERSONALIZED AYURVEDIC DIET PLAN\n================================\n\n`;
    content += `Patient: ${patientName}\n`;
    content += `Primary Dosha: ${dosha} (${currentPatientData.confidence}% confidence)\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    if (doshaInfo) {
        content += `DOSHA DESCRIPTION:\n${doshaInfo.description}\n\n`;
        content += `RECOMMENDED FOODS:\n${doshaInfo.foods_favor.map(food => `• ${food}`).join('\n')}\n\n`;
        content += `FOODS TO AVOID:\n${doshaInfo.foods_avoid.map(food => `• ${food}`).join('\n')}\n\n`;
        content += `LIFESTYLE RECOMMENDATIONS:\n${doshaInfo.lifestyle}\n\n`;
    }
    
    content += `---\nGenerated by Ayurvedic Healthcare Management System\n`;
    content += `Dr. ${currentUser?.name || 'Doctor'}\n\n`;
    content += `DISCLAIMER: This plan is based on Ayurvedic principles. Please consult with a qualified healthcare practitioner before making significant dietary changes.`;
    
    return content;
}

function printDietPlan() {
    window.print();
}

// Utility Functions
function goToDashboard() {
    if (currentUser) {
        showRoleDashboard(currentUser.role);
    } else {
        showPage('login-page');
    }
}

function handleConditionCheckboxes(e) {
    const checkboxes = document.querySelectorAll('input[name="conditions"]');
    const noneCheckbox = document.querySelector('input[name="conditions"][value="None"]');
    
    if (e.target.value === 'None' && e.target.checked) {
        // If "None" is selected, uncheck all others
        checkboxes.forEach(cb => {
            if (cb.value !== 'None') cb.checked = false;
        });
    } else if (e.target.value !== 'None' && e.target.checked) {
        // If any other option is selected, uncheck "None"
        if (noneCheckbox) noneCheckbox.checked = false;
    }
}

function showMessage(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create message element if it doesn't exist
    let messageEl = document.getElementById('app-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'app-message';
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 350px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(messageEl);
    }
    
    // Set message content and style
    messageEl.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    // Show message
    requestAnimationFrame(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateX(0)';
    });
    
    // Hide message after 4 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
    }, 4000);
}

// Global function assignments for inline onclick handlers
window.showAuthForm = showAuthForm;
window.updateRegistrationFields = updateRegistrationFields;
window.logout = logout;
window.showPatientAssessment = showPatientAssessment;
window.nextSection = nextSection;
window.previousSection = previousSection;
window.showResults = showResults;
window.generateDietPlan = generateDietPlan;
window.showPlanTab = showPlanTab;
window.generateReport = generateReport;
window.downloadDietPlan = downloadDietPlan;
window.printDietPlan = printDietPlan;
window.goToDashboard = goToDashboard;
window.showMessage = showMessage;

console.log('Ayurvedic Healthcare System JavaScript loaded successfully');
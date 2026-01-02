// ========== FIREBASE CONFIGURATION & HELPERS ==========

// Configuration Firebase
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDxC--WywLZ13NZdiouncGLb8SaE-3GggQ",
    authDomain: "site-perso-b7c08.firebaseapp.com",
    projectId: "site-perso-b7c08",
    storageBucket: "site-perso-b7c08.firebasestorage.app",
    messagingSenderId: "1015317206704",
    appId: "1:1015317206704:web:19e1d3762bda8a7cf78d75",
    measurementId: "G-MMLMV2DPNT"
};

// ========== FIREBASE CONFIGURATION ==========

// ID utilisateur
const CURRENT_USER_ID = "touzeauj";

// Vérifier si Firebase est initialisé
function isFirebaseReady() {
    return typeof firebase !== 'undefined' && 
           firebase.apps && 
           firebase.apps.length > 0 &&
           typeof firebase.firestore === 'function';
}

// ========== FONCTIONS DE SAUVEGARDE AVEC FIREBASE ==========

// Sauvegarder une donnée
async function saveData(key, value) {
    console.log(`💾 Tentative de sauvegarde: ${key}`);
    
    try {
        // Formater la valeur
        const formattedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        
        // 1. Sauvegarder dans Firebase si disponible
        if (isFirebaseReady()) {
            try {
                console.log(`🔥 Sauvegarde Firebase pour: ${key}`);
                const userRef = firebase.firestore().collection('users').doc(CURRENT_USER_ID);
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    await userRef.update({
                        [key]: formattedValue,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    await userRef.set({
                        [key]: formattedValue,
                        userId: CURRENT_USER_ID,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`✅ Firebase: ${key} sauvegardé avec succès`);
            } catch (firebaseError) {
                console.warn(`⚠️ Erreur Firebase (${key}):`, firebaseError);
                console.log(`🔄 Fallback vers localStorage pour: ${key}`);
            }
        }
        
        // 2. TOUJOURS sauvegarder dans localStorage (cache local)
        saveData(key, formattedValue);
        console.log(`✅ LocalStorage: ${key} sauvegardé`);
        
        return true;
        
    } catch (error) {
        console.error(`❌ Erreur critique sauvegarde ${key}:`, error);
        return false;
    }
}

// Charger une donnée
async function loadData(key, defaultValue = null) {
    console.log(`📥 Tentative de chargement: ${key}`);
    
    try {
        // 1. D'abord vérifier le localStorage (le plus rapide)
        const cached = loadData(key);
        if (cached !== null) {
            console.log(`✅ ${key} trouvé dans le cache local`);
            try {
                return JSON.parse(cached);
            } catch {
                return cached;
            }
        }
        
        // 2. Si pas dans le cache, essayer Firebase
        if (isFirebaseReady()) {
            try {
                console.log(`🔥 Chargement depuis Firebase: ${key}`);
                const userRef = firebase.firestore().collection('users').doc(CURRENT_USER_ID);
                const userDoc = await userRef.get();
                
                if (userDoc.exists) {
                    const data = userDoc.data();
                    if (data && data[key] !== undefined) {
                        const value = data[key];
                        
                        // Mettre en cache dans localStorage
                        saveData(key, value);
                        console.log(`✅ ${key} chargé depuis Firebase et mis en cache`);
                        
                        try {
                            return JSON.parse(value);
                        } catch {
                            return value;
                        }
                    }
                }
                console.log(`ℹ️ ${key} non trouvé dans Firebase`);
            } catch (firebaseError) {
                console.warn(`⚠️ Erreur Firebase chargement (${key}):`, firebaseError);
            }
        }
        
        // 3. Retourner la valeur par défaut
        console.log(`📝 ${key}: utilisation de la valeur par défaut`);
        return defaultValue;
        
    } catch (error) {
        console.error(`❌ Erreur critique chargement ${key}:`, error);
        return defaultValue;
    }
}

// ========== FONCTIONS SPÉCIFIQUES ==========

// Planning
async function savePlanning(hourIndex, dayIndex, activity) {
    const key = `planning_${hourIndex}_${dayIndex}`;
    return await saveData(key, activity);
}

async function loadPlanning(hourIndex, dayIndex) {
    const key = `planning_${hourIndex}_${dayIndex}`;
    const data = await loadData(key, '');
    console.log(`📅 Planning [${hourIndex},${dayIndex}]: "${data}"`);
    return data;
}

// Objectifs journaliers
async function saveDailyObjectives(date, objectives) {
    const dateKey = `objectifs_${date.replace(/\//g, '_')}`;
    return await saveData(dateKey, objectives);
}

async function loadDailyObjectives(date) {
    const dateKey = `objectifs_${date.replace(/\//g, '_')}`;
    const data = await loadData(dateKey, []);
    
    // S'assurer que c'est un tableau
    if (!Array.isArray(data)) {
        console.warn(`⚠️ Objectifs ${date} n'est pas un tableau:`, data);
        return [];
    }
    
    console.log(`🎯 Objectifs ${date}: ${data.length} objectifs`);
    return data;
}

// Hydratation
async function saveHydration(date, glasses) {
    const key = `water_${date}`;
    return await saveData(key, { glasses, date });
}

async function loadHydration(date) {
    const key = `water_${date}`;
    const data = await loadData(key, { glasses: 0 });
    console.log(`💧 Hydratation ${date}: ${data.glasses || 0} verres`);
    return data.glasses || 0;
}

// ========== FONCTIONS DE DÉBOGAGE ==========

function debugFirebase() {
    console.group("🔍 DEBUG FIREBASE");
    console.log("Firebase disponible:", typeof firebase !== 'undefined');
    console.log("Firebase apps:", firebase?.apps?.length || 0);
    console.log("Firestore disponible:", typeof firebase?.firestore === 'function');
    console.log("Current user ID:", CURRENT_USER_ID);
    console.log("LocalStorage clés:", Object.keys(localStorage).length);
    console.groupEnd();
}

// ========== LE RESTE DE VOTRE SCRIPT.JS RESTE IDENTIQUE ==========
// Gardez TOUTES vos fonctions existantes après ce point
// initializeViePerso, initializePlanning, etc.

// SEULEMENT modifier les appels à localStorage :
// Remplacer loadData() par loadData()
// Remplacer saveData() par saveData()

// ========== CODE EXISTANT (MODIFIÉ POUR UTILISER FIREBASE) ==========

function searchFoodLocal(query) {
    const foodDatabase = [
        { name: "Poulet (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        { name: "Riz blanc (100g cuit)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        { name: "Brocoli (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
        { name: "Oeuf entier", calories: 70, protein: 6, carbs: 0.6, fat: 5 },
        { name: "Pomme", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        { name: "Banane", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        { name: "Saumon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
        { name: "Avoine (100g)", calories: 389, protein: 17, carbs: 66, fat: 7 },
        { name: "Lait entier (100ml)", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
        { name: "Pain complet (tranche)", calories: 82, protein: 4, carbs: 16, fat: 1 }
    ];
    
    const results = foodDatabase.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const resultsDiv = document.getElementById('search-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = results.map(food => `
            <div class="food-result" onclick="selectFood('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat})">
                <strong>${food.name}</strong><br>
                <small>${food.calories} kcal - P:${food.protein}g C:${food.carbs}g L:${food.fat}g</small>
            </div>
        `).join('');
    }
}

// === Authentification ===
// === Authentification ===
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("error");
    
    if (user === "touzeauj" && pass === "Glowup2025!") {
        console.log("✅ Connexion réussie pour:", user);
        
        // Sauvegarder l'état de connexion de MULTIPLE façons
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", user);
        localStorage.setItem("loginTime", new Date().toISOString());
        
        // Rediriger vers le dashboard
        console.log("🔄 Redirection vers dashboard.html");
        window.location.href = "dashboard.html";
    } else {
        error.textContent = "Identifiant ou mot de passe incorrect.";
        error.style.color = "var(--danger)";
        console.error("❌ Échec de connexion pour:", user);
    }
}

function logout() {
    console.log("🚪 Déconnexion de l'utilisateur");
    
    // Nettoyer TOUTES les données de session
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    
    // Rediriger vers la page de connexion
    window.location.href = "index.html";
}

// === Vérification de sécurité RENFORCÉE ===
function checkAuthentication() {
    console.log("🔍 Vérification de l'authentification...");
    
    // Vérifier SI nous sommes sur la page de login
    const isLoginPage = window.location.pathname.includes("index.html") || 
                       window.location.pathname.endsWith("/");
    
    if (isLoginPage) {
        console.log("📄 Page de login détectée - Pas de vérification nécessaire");
        return true; // Laisser passer sur la page de login
    }
    
    // Vérifications MULTIPLES de l'authentification
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const username = localStorage.getItem("username");
    const loginTime = localStorage.getItem("loginTime");
    
    console.log("État de connexion:", {
        loggedIn,
        username,
        loginTime,
        pageActuelle: window.location.pathname
    });
    
    // Si NON connecté, rediriger vers index.html
    if (!loggedIn) {
        console.warn("⚠️ Utilisateur non authentifié, redirection vers index.html");
        window.location.href = "index.html";
        return false;
    }
    
    // Vérifier l'ancienneté de la connexion (optionnel - 24h max)
    if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            console.warn("⚠️ Session expirée (24h), déconnexion");
            logout();
            return false;
        }
    }
    
    console.log("✅ Utilisateur authentifié:", username);
    return true;
}

// === Exécuter la vérification AU DÉMARRAGE ===
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Chargement de la page:", window.location.pathname);
    
    // Vérifier l'authentification immédiatement
    checkAuthentication();
    
    // Pour le dashboard, charger les données
    if (document.querySelector(".dashboard")) {
        console.log("📊 Page Dashboard détectée");
        setTimeout(function() {
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
        }, 500);
    }
    
    // Pour les autres pages, initialiser normalement
    if (typeof initializePage === 'function') {
        setTimeout(initializePage, 300);
    }
});

// === Modifier la sécurité renforcée dans script.js ===
// REMPLACEZ la section existante qui commence par :
// "// Sécurité renforcée"
// AVEC ceci :

// Sécurité renforcée - VERSION CORRIGÉE
(function checkSecurityOnLoad() {
    // Attendre que le DOM soit chargé
    setTimeout(function() {
        // Ne PAS exécuter sur la page d'index/login
        if (window.location.pathname.includes("index.html") || 
            window.location.pathname.endsWith("/")) {
            console.log("🔓 Page de login - sécurité désactivée");
            return;
        }
        
        // Vérifier l'authentification
        const isAuthenticated = localStorage.getItem("loggedIn") === "true";
        const currentPage = window.location.pathname;
        
        console.log("🔐 Vérification de sécurité:", {
            page: currentPage,
            authentifié: isAuthenticated,
            loggedIn: localStorage.getItem("loggedIn")
        });
        
        if (!isAuthenticated) {
            console.warn("🚫 Accès non autorisé, redirection vers index.html");
            window.location.href = "index.html";
        } else {
            console.log("✅ Accès autorisé");
        }
    }, 100);
})();

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

// Sécurité renforcée
if (!window.location.href.includes("index.html")) {
    if (loadData("loggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

// === Initialisation principale ===
async function initializePage() {
    console.log("🚀 Initialisation de la page...");
    
    // Initialiser Firebase
    await initializeFirebase();
    
    // Vérifier la migration
    const hasMigrated = loadData('firebase_migrated');
    if (!hasMigrated && firebaseInitialized) {
        setTimeout(() => {
            const shouldMigrate = confirm('Voulez-vous sauvegarder vos données dans le cloud (Firebase) ?\n\n✅ Vos données seront accessibles depuis tous vos appareils\n✅ Sauvegarde automatique\n✅ Plus sécurisé');
            if (shouldMigrate) {
                migrateToFirebase();
            } else {
                saveData('firebase_migrated', 'skipped');
            }
        }, 2000);
    }
    
    // Page Vie Perso
    if (document.getElementById("current-date")) {
        initializeViePerso();
    }
    
    // Page Finance
    if (document.getElementById("depenses")) {
        initializeFinance();
    }
    
    // Page Nutrition
    if (document.getElementById("age")) {
        initializeNutrition();
    }
    
    // Page Notes
    if (document.getElementById("quick-note")) {
        initializeNotes();
    }
    
    // Autres pages
    if (document.getElementById("long-term-objectives")) initializeObjectives();
    if (document.getElementById("habits-container")) initializeHabits();
    if (document.getElementById("projects-container")) initializeProjects();
    
    // Dashboard
    if (document.querySelector(".dashboard")) {
        loadDashboardData();
    }
}

// === Vie Perso ===
async function initializeViePerso() {
    console.log("📅 Initialisation Vie Perso");
    
    // Date et semaine
    const now = new Date();
    document.getElementById("current-date").textContent = "📅 Date : " + now.toLocaleDateString("fr-FR");
    document.getElementById("week-number").textContent = "🔄 Semaine n°" + getWeekNumber(now);
    
    // Planning
    initializePlanning();
    
    // Objectifs
    initializeDailyObjectives();
    
    // Progressions
    enhanceViePerso();
    updateAllProgress();
    
    console.log("✅ Vie Perso initialisée");
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getWeekDates() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentDate = now.getDate();
    
    const monday = new Date(now);
    monday.setDate(currentDate - currentDay + (currentDay === 0 ? -6 : 1));
    
    const weekDates = [];
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push({
            jour: jours[i],
            date: date.toLocaleDateString('fr-FR'),
            dateObj: date
        });
    }
    
    return weekDates;
}

// === Planning ===
async function initializePlanning() {
    console.log("🔄 Création du planning...");
    const planningBody = document.getElementById("planning-body");
    
    if (!planningBody) {
        console.error("❌ Élément planning-body non trouvé");
        return;
    }
    
    planningBody.innerHTML = '';
    
    // Créneaux de 6h à 23h
    for (let hour = 6; hour <= 23; hour++) {
        const row = document.createElement("tr");
        
        // Cellule heure
        const timeCell = document.createElement("td");
        timeCell.textContent = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
        timeCell.style.fontWeight = '600';
        timeCell.style.background = 'var(--bg-secondary)';
        row.appendChild(timeCell);
        
        // 7 jours de la semaine
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Activité...`;
            
            // Charger donnée sauvegardée avec Firebase
            const savedData = await loadPlanning(hour-6, day);
            if (savedData) {
                input.value = savedData;
            }
            
            // Sauvegarde auto avec Firebase
            input.addEventListener('input', async function() {
                await savePlanning(hour-6, day, this.value);
                showNotification('Planning sauvegardé', 'success');
            });
            
            cell.appendChild(input);
            row.appendChild(cell);
        }
        
        planningBody.appendChild(row);
    }
    
    console.log("✅ Planning créé : 18 créneaux x 7 jours");
}

// === Objectifs Journaliers ===
async function initializeDailyObjectives() {
    console.log("🎯 Création des objectifs journaliers...");
    const container = document.getElementById("objectifs-container");
    
    if (!container) {
        console.error("❌ Élément objectifs-container non trouvé");
        return;
    }
    
    container.innerHTML = '';
    const weekDates = getWeekDates();
    
    for (const dayInfo of weekDates) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "jour-objectifs";
        
        // Titre
        const title = document.createElement("h3");
        title.innerHTML = `${dayInfo.jour} <span class="date">${dayInfo.date}</span>`;
        dayDiv.appendChild(title);
        
        // Progression
        const progressDiv = document.createElement("div");
        progressDiv.className = "daily-progress";
        progressDiv.innerHTML = `
            <div class="progress-info">
                <span class="progress-text">Progression: </span>
                <span class="progress-percent">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        dayDiv.appendChild(progressDiv);
        
        // Liste objectifs
        const objectivesList = document.createElement("div");
        objectivesList.className = "objectifs-list";
        
        // Charger les objectifs avec Firebase
        let objectives = await loadDailyObjectives(dayInfo.date);
        
        if (!objectives || objectives.length === 0) {
            // Objectifs par défaut
            objectives = [
                { text: 'Sport 30min', completed: false },
                { text: 'Lecture 20 pages', completed: false },
                { text: 'Méditation 10min', completed: false }
            ];
            await saveDailyObjectives(dayInfo.date, objectives);
        }
        
        // Créer chaque objectif
        for (let i = 0; i < objectives.length; i++) {
            const objective = objectives[i];
            const objectiveDiv = await createObjectiveElement(objective, i, dayInfo.date, objectives);
            objectivesList.appendChild(objectiveDiv);
        }
        
        dayDiv.appendChild(objectivesList);
        
        // Bouton ajouter
        const addBtn = document.createElement("button");
        addBtn.textContent = "+ Ajouter un objectif";
        addBtn.className = "add-btn";
        addBtn.onclick = async function() {
            objectives.push({ text: 'Nouvel objectif', completed: false });
            await saveDailyObjectives(dayInfo.date, objectives);
            initializeDailyObjectives(); // Recharger
        };
        dayDiv.appendChild(addBtn);
        
        container.appendChild(dayDiv);
    }
    
    console.log("✅ Objectifs créés pour 7 jours");
    updateAllDailyProgress();
}

async function createObjectiveElement(objective, index, date, objectivesArray) {
    const objectiveDiv = document.createElement("div");
    objectiveDiv.className = `objectif-item ${objective.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = objective.completed;
    checkbox.className = "objective-checkbox";
    checkbox.onchange = async function() {
        objective.completed = this.checked;
        objectiveDiv.className = `objectif-item ${this.checked ? 'completed' : ''}`;
        await saveDailyObjectives(date, objectivesArray);
        updateDailyProgressForDate(date);
        updateWeeklyProgress();
    };
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = objective.text;
    input.className = "objective-input";
    input.placeholder = "Nouvel objectif";
    input.addEventListener('input', async function() {
        objective.text = this.value;
        await saveDailyObjectives(date, objectivesArray);
        updateDailyProgressForDate(date);
    });
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = async function() {
        objectivesArray.splice(index, 1);
        await saveDailyObjectives(date, objectivesArray);
        initializeDailyObjectives(); // Recharger
    };
    
    objectiveDiv.appendChild(checkbox);
    objectiveDiv.appendChild(input);
    objectiveDiv.appendChild(removeBtn);
    
    return objectiveDiv;
}

async function updateDailyProgressForDate(date) {
    const objectives = await loadDailyObjectives(date);
    const completed = objectives.filter(obj => obj.completed && obj.text.trim() !== '').length;
    const total = objectives.filter(obj => obj.text.trim() !== '').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const jourElements = document.querySelectorAll('.jour-objectifs');
    jourElements.forEach(jourElement => {
        const titre = jourElement.querySelector('h3 .date');
        if (titre && date.includes(titre.textContent.replace(/\//g, '_'))) {
            const progressPercent = jourElement.querySelector('.progress-percent');
            const progressFill = jourElement.querySelector('.progress-fill');
            if (progressPercent && progressFill) {
                progressPercent.textContent = progress + '%';
                progressFill.style.width = progress + '%';
                
                if (progress === 100) {
                    progressFill.style.background = 'var(--success)';
                } else if (progress >= 50) {
                    progressFill.style.background = 'var(--warning)';
                } else {
                    progressFill.style.background = 'var(--danger)';
                }
            }
        }
    });
}

async function updateAllDailyProgress() {
    const weekDates = getWeekDates();
    for (const dayInfo of weekDates) {
        await updateDailyProgressForDate(dayInfo.date);
    }
}

async function updateWeeklyProgress() {
    const weekDates = getWeekDates();
    let totalCompleted = 0;
    let totalObjectives = 0;
    
    for (const dayInfo of weekDates) {
        const objectives = await loadDailyObjectives(dayInfo.date);
        const completed = objectives.filter(obj => obj.completed && obj.text.trim() !== '').length;
        const total = objectives.filter(obj => obj.text.trim() !== '').length;
        totalCompleted += completed;
        totalObjectives += total;
    }
    
    const weeklyProgress = totalObjectives > 0 ? Math.round((totalCompleted / totalObjectives) * 100) : 0;
    
    const weeklyProgressElement = document.getElementById('weekly-progress');
    const weeklyProgressFill = document.getElementById('weekly-progress-fill');
    
    if (weeklyProgressElement && weeklyProgressFill) {
        weeklyProgressElement.textContent = weeklyProgress + '%';
        weeklyProgressFill.style.width = weeklyProgress + '%';
        
        if (weeklyProgress === 100) {
            weeklyProgressFill.style.background = 'var(--success)';
        } else if (weeklyProgress >= 50) {
            weeklyProgressFill.style.background = 'var(--warning)';
        } else {
            weeklyProgressFill.style.background = 'var(--danger)';
        }
    }
}

function updatePlanningProgress() {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const currentHour = now.getHours();
    
    const planningBody = document.getElementById("planning-body");
    if (!planningBody) return;
    
    const rows = planningBody.querySelectorAll('tr');
    let passedSlots = 0;
    let totalSlots = rows.length * 7;
    
    rows.forEach((row) => {
        const timeText = row.cells[0].textContent;
        const startHour = parseInt(timeText.split(':')[0]);
        
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            if (dayIndex < currentDay) {
                passedSlots++;
            } else if (dayIndex === currentDay && startHour < currentHour) {
                passedSlots++;
            }
        }
    });
    
    const progress = totalSlots > 0 ? Math.round((passedSlots / totalSlots) * 100) : 0;
    
    const planningProgressElement = document.getElementById('planning-progress');
    const planningProgressFill = document.getElementById('planning-progress-fill');
    
    if (planningProgressElement && planningProgressFill) {
        planningProgressElement.textContent = progress + '%';
        planningProgressFill.style.width = progress + '%';
        
        if (progress === 100) {
            planningProgressFill.style.background = 'var(--success)';
        } else if (progress >= 50) {
            planningProgressFill.style.background = 'var(--warning)';
        } else {
            planningProgressFill.style.background = 'var(--accent)';
        }
    }
}

async function updateAllProgress() {
    await updateAllDailyProgress();
    updateWeeklyProgress();
    updatePlanningProgress();
}

// === Améliorations Vie Perso ===
function enhanceViePerso() {
    const infoSection = document.querySelector('.info');
    if (infoSection) {
        const planningProgressHTML = `
            <div class="planning-progress">
                <div class="progress-info">
                    <span class="progress-text">Progression planning: </span>
                    <span class="progress-percent" id="planning-progress">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="planning-progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        const weeklyProgressHTML = `
            <div class="weekly-progress">
                <div class="progress-info">
                    <span class="progress-text">Progression objectifs: </span>
                    <span class="progress-percent" id="weekly-progress">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="weekly-progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        infoSection.innerHTML += planningProgressHTML + weeklyProgressHTML;
    }
}

// === Finance ===
async function initializeFinance() {
    console.log("💰 Initialisation Finance");
    
    // Charger les données avec Firebase
    const depenses = await loadFinance("depenses");
    const investissements = await loadFinance("investissements");
    const patrimoine = await loadFinance("patrimoine");
    const revenus = await loadFinance("revenus");
    
    if (document.getElementById("depenses")) document.getElementById("depenses").value = depenses || "";
    if (document.getElementById("investissements")) document.getElementById("investissements").value = investissements || "";
    if (document.getElementById("patrimoine")) document.getElementById("patrimoine").value = patrimoine || "";
    if (document.getElementById("revenus")) document.getElementById("revenus").value = revenus || "";
    
    enhanceFinance();
    updateFinanceStats();
    
    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            updateFinanceStats();
        });
        setTimeout(() => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }, 100);
    });
    
    console.log("✅ Finance initialisée");
}

function enhanceFinance() {
    const main = document.querySelector('main');
    if (main && document.getElementById('depenses')) {
        const statsSection = document.createElement('section');
        statsSection.innerHTML = `
            <h2>📈 Statistiques Financières</h2>
            <div class="finance-stats">
                <div class="finance-stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <span class="stat-value" id="depenses-count">0</span>
                        <span class="stat-label">Dépenses</span>
                    </div>
                </div>
                <div class="finance-stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <span class="stat-value" id="investissements-count">0</span>
                        <span class="stat-label">Investissements</span>
                    </div>
                </div>
                <div class="finance-stat-card">
                    <div class="stat-icon">💵</div>
                    <div class="stat-content">
                        <span class="stat-value" id="revenus-count">0</span>
                        <span class="stat-label">Revenus</span>
                    </div>
                </div>
                <div class="finance-stat-card">
                    <div class="stat-icon">⚖️</div>
                    <div class="stat-content">
                        <span class="stat-value" id="solde-mensuel">0€</span>
                        <span class="stat-label">Solde Mensuel</span>
                    </div>
                </div>
            </div>
        `;
        
        const patrimoineSection = document.querySelector('section:nth-child(4)');
        patrimoineSection.parentNode.insertBefore(statsSection, patrimoineSection.nextSibling);
        
        // Ajouter la section Patrimoine Total
        addPatrimoineTotalSection();
    }
}

async function updateFinanceStats() {
    const depenses = await loadFinance("depenses") || "";
    const investissements = await loadFinance("investissements") || "";
    const revenus = await loadFinance("revenus") || "";
    const patrimoine = await loadFinance("patrimoine") || "";
    
    // Compter les lignes
    const depensesCount = depenses.split('\n').filter(line => line.trim().length > 0).length;
    const investissementsCount = investissements.split('\n').filter(line => line.trim().length > 0).length;
    const revenusCount = revenus.split('\n').filter(line => line.trim().length > 0).length;
    
    // Calculer le solde
    const solde = calculerSoldeMensuelFromText(revenus, depenses);
    
    if (document.getElementById('depenses-count')) {
        document.getElementById('depenses-count').textContent = depensesCount;
        document.getElementById('investissements-count').textContent = investissementsCount;
        document.getElementById('revenus-count').textContent = revenusCount;
        document.getElementById('solde-mensuel').textContent = formatMoney(solde);
        
        // Colorer le solde
        const soldeElement = document.getElementById('solde-mensuel');
        if (solde >= 0) {
            soldeElement.style.color = 'var(--success)';
        } else {
            soldeElement.style.color = 'var(--danger)';
        }
    }
    
    // Mettre à jour le patrimoine total
    updatePatrimoineTotal(patrimoine);
}

function calculerSoldeMensuelFromText(revenusText, depensesText) {
    let totalRevenus = 0;
    let totalDepenses = 0;
    
    const revenusLines = revenusText.split('\n');
    revenusLines.forEach(line => {
        const montant = extraireMontant(line);
        if (montant > 0) totalRevenus += montant;
    });
    
    const depensesLines = depensesText.split('\n');
    depensesLines.forEach(line => {
        const montant = extraireMontant(line);
        if (montant > 0) totalDepenses += montant;
    });
    
    return totalRevenus - totalDepenses;
}

function extraireMontant(text) {
    const matches = text.match(/(\d+([.,]\d+)?)/g);
    if (matches && matches.length > 0) {
        return parseFloat(matches[0].replace(',', '.'));
    }
    return 0;
}

function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function addPatrimoineTotalSection() {
    const main = document.querySelector('main');
    const patrimoineTotalHTML = `
        <section class="patrimoine-total-section">
            <h2>🏦 Patrimoine Total</h2>
            <div class="patrimoine-total-card">
                <div class="patrimoine-header">
                    <div class="patrimoine-icon">💎</div>
                    <div class="patrimoine-content">
                        <span class="patrimoine-label">Valeur totale de votre patrimoine</span>
                        <span class="patrimoine-value" id="patrimoine-total">0 €</span>
                    </div>
                </div>
                <div class="patrimoine-breakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Épargne & Comptes</span>
                        <span class="breakdown-value" id="epargne-value">0 €</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Investissements</span>
                        <span class="breakdown-value" id="investissements-value">0 €</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Immobilier</span>
                        <span class="breakdown-value" id="immobilier-value">0 €</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Autres actifs</span>
                        <span class="breakdown-value" id="autres-value">0 €</span>
                    </div>
                </div>
                <div class="patrimoine-evolution">
                    <span class="evolution-label">Évolution mensuelle</span>
                    <span class="evolution-value" id="evolution-value">+0%</span>
                </div>
            </div>
        </section>
    `;
    
    const actionsSection = document.querySelector('.actions');
    if (actionsSection) {
        const div = document.createElement('div');
        div.innerHTML = patrimoineTotalHTML.trim();
        main.insertBefore(div.firstChild, actionsSection);
    }
}

function updatePatrimoineTotal(patrimoineText) {
    const {
        total,
        epargne,
        investissements,
        immobilier,
        autres
    } = analyserPatrimoine(patrimoineText);
    
    const patrimoineTotalElement = document.getElementById('patrimoine-total');
    const epargneElement = document.getElementById('epargne-value');
    const investissementsElement = document.getElementById('investissements-value');
    const immobilierElement = document.getElementById('immobilier-value');
    const autresElement = document.getElementById('autres-value');
    const evolutionElement = document.getElementById('evolution-value');
    
    if (patrimoineTotalElement) {
        patrimoineTotalElement.textContent = formatMoney(total);
        if (epargneElement) epargneElement.textContent = formatMoney(epargne);
        if (investissementsElement) investissementsElement.textContent = formatMoney(investissements);
        if (immobilierElement) immobilierElement.textContent = formatMoney(immobilier);
        if (autresElement) autresElement.textContent = formatMoney(autres);
        
        // Calculer l'évolution
        const evolution = calculerEvolutionPatrimoine(total);
        if (evolutionElement) {
            evolutionElement.textContent = evolution >= 0 ? `+${evolution}%` : `${evolution}%`;
            evolutionElement.style.color = evolution >= 0 ? 'var(--success)' : 'var(--danger)';
        }
    }
}

function analyserPatrimoine(patrimoineText) {
    let total = 0;
    let epargne = 0;
    let investissements = 0;
    let immobilier = 0;
    let autres = 0;
    
    const lignes = patrimoineText.split('\n').filter(line => line.trim().length > 0);
    
    lignes.forEach(ligne => {
        const montant = extraireMontant(ligne);
        const ligneLower = ligne.toLowerCase();
        
        if (montant > 0) {
            total += montant;
            
            if (ligneLower.includes('livret') || ligneLower.includes('épargne') || ligneLower.includes('compte') || ligneLower.includes('banque')) {
                epargne += montant;
            } else if (ligneLower.includes('action') || ligneLower.includes('bourse') || ligneLower.includes('crypto') || ligneLower.includes('investissement')) {
                investissements += montant;
            } else if (ligneLower.includes('appartement') || ligneLower.includes('maison') || ligneLower.includes('immobilier') || ligneLower.includes('terrain')) {
                immobilier += montant;
            } else {
                autres += montant;
            }
        }
    });
    
    return { total, epargne, investissements, immobilier, autres };
}

function calculerEvolutionPatrimoine(totalActuel) {
    // Simuler une évolution (en réalité, il faudrait stocker l'historique)
    return 0;
}

async function saveFinance() {
    const depenses = document.getElementById("depenses")?.value || "";
    const investissements = document.getElementById("investissements")?.value || "";
    const patrimoine = document.getElementById("patrimoine")?.value || "";
    const revenus = document.getElementById("revenus")?.value || "";
    
    await saveFinance("depenses", depenses);
    await saveFinance("investissements", investissements);
    await saveFinance("patrimoine", patrimoine);
    await saveFinance("revenus", revenus);
    
    updateFinanceStats();
    showNotification('Données financières sauvegardées !', 'success');
}

// === Fonctions de sauvegarde ===
async function saveWeek() {
    showNotification('Données sauvegardées !', 'success');
}

// === Utilitaires ===
function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'notification';
    if (type === 'danger') notification.classList.add('error');
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function clearWeek() {
    if (confirm('Voulez-vous vraiment effacer toutes les données de cette semaine ?')) {
        // Planning
        const planningInputs = document.querySelectorAll('#planning-body input');
        planningInputs.forEach(input => input.value = '');
        
        // Supprimer toutes les données de planning
        for (let hour = 6; hour <= 23; hour++) {
            for (let day = 0; day < 7; day++) {
                const key = `planning_${hour-6}_${day}`;
                localStorage.removeItem(key);
                // Note: Pour Firebase, il faudrait une fonction de suppression
            }
        }
        
        // Objectifs
        const weekDates = getWeekDates();
        for (const dayInfo of weekDates) {
            const storageKey = `objectifs_${dayInfo.date.replace(/\//g, '_')}`;
            localStorage.removeItem(storageKey);
            // Note: Pour Firebase, il faudrait une fonction de suppression
        }
        
        showNotification('Données de la semaine effacées !', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

async function exportData() {
    const allData = {
        planning: getAllPlanningData(),
        objectives: getAllObjectivesData(),
        finance: await getAllFinanceData(),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    downloadFile(dataStr, `backup_${getFormattedDate()}.json`, 'application/json');
    showNotification('Export complet téléchargé !', 'success');
}

function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString('fr-FR').replace(/\//g, '-');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function getAllPlanningData() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('planning_')) {
            data[key] = loadData(key);
        }
    });
    return data;
}

function getAllObjectivesData() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('objectifs_')) {
            data[key] = loadData(key);
        }
    });
    return data;
}

async function getAllFinanceData() {
    return {
        depenses: await loadFinance("depenses"),
        investissements: await loadFinance("investissements"),
        patrimoine: await loadFinance("patrimoine"),
        revenus: await loadFinance("revenus")
    };
}

// === Fonctions PDF ===
function downloadWeekPDF() {
    showNotification('Fonction PDF en développement', 'success');
}

function downloadFinancePDF() {
    showNotification('Fonction PDF en développement', 'success');
}

// === NUTRITION ===

// Base de données des activités sportives
const sportDatabase = {
    // Cardio - Course
    'course_leger': { name: 'Course à pied léger (8 km/h)', met: 8.0, category: 'cardio' },
    'course_modere': { name: 'Course à pied modéré (10 km/h)', met: 9.8, category: 'cardio' },
    'course_intense': { name: 'Course à pied intense (12 km/h)', met: 11.5, category: 'cardio' },
    'course_5kmh': { name: 'Marche rapide (5 km/h)', met: 4.0, category: 'cardio' },
    'course_8kmh': { name: 'Course légère (8 km/h)', met: 8.0, category: 'cardio' },
    'course_10kmh': { name: 'Course modérée (10 km/h)', met: 9.8, category: 'cardio' },
    'course_12kmh': { name: 'Course intense (12 km/h)', met: 11.5, category: 'cardio' },
    'course_14kmh': { name: 'Course très intense (14 km/h)', met: 13.5, category: 'cardio' },
    
    // Vélo
    'velo_leger': { name: 'Vélo léger (16 km/h)', met: 6.0, category: 'velo' },
    'velo_modere': { name: 'Vélo modéré (20 km/h)', met: 8.0, category: 'velo' },
    'velo_intense': { name: 'Vélo intense (25 km/h)', met: 10.0, category: 'velo' },
    'velo_10kmh': { name: 'Vélo très léger (10 km/h)', met: 4.0, category: 'velo' },
    'velo_16kmh': { name: 'Vélo léger (16 km/h)', met: 6.0, category: 'velo' },
    'velo_20kmh': { name: 'Vélo modéré (20 km/h)', met: 8.0, category: 'velo' },
    'velo_25kmh': { name: 'Vélo intense (25 km/h)', met: 10.0, category: 'velo' },
    'velo_30kmh': { name: 'Vélo très intense (30 km/h)', met: 12.0, category: 'velo' },
    
    // Natation
    'natation_leger': { name: 'Natation légère', met: 6.0, category: 'natation' },
    'natation_modere': { name: 'Natation modérée', met: 8.3, category: 'natation' },
    'natation_intense': { name: 'Natation intense', met: 10.0, category: 'natation' },
    'natation_lente': { name: 'Natation lente', met: 5.0, category: 'natation' },
    'natation_moderee': { name: 'Natation modérée', met: 7.0, category: 'natation' },
    'natation_crawl': { name: 'Crawl rapide', met: 10.0, category: 'natation' },
    'natation_brasse': { name: 'Brasse', met: 6.5, category: 'natation' },
    
    // Musculation
    'musculation': { name: 'Musculation', met: 6.0, category: 'musculation' },
    'musculation_legere': { name: 'Musculation légère', met: 4.0, category: 'musculation' },
    'musculation_moderee': { name: 'Musculation modérée', met: 6.0, category: 'musculation' },
    'musculation_intense': { name: 'Musculation intense', met: 8.0, category: 'musculation' },
    'crossfit': { name: 'CrossFit', met: 9.0, category: 'musculation' },
    
    // Sports collectifs
    'football': { name: 'Football', met: 8.0, category: 'collectif' },
    'basketball': { name: 'Basketball', met: 8.0, category: 'collectif' },
    'tennis': { name: 'Tennis', met: 8.0, category: 'collectif' },
    'volleyball': { name: 'Volleyball', met: 4.0, category: 'collectif' },
    'rugby': { name: 'Rugby', met: 9.0, category: 'collectif' },
    'hockey': { name: 'Hockey', met: 8.0, category: 'collectif' },
    
    // Sports raquette
    'badminton': { name: 'Badminton', met: 5.5, category: 'raquette' },
    'squash': { name: 'Squash', met: 10.0, category: 'raquette' },
    'tennis_table': { name: 'Tennis de table', met: 4.0, category: 'raquette' },
    
    // Danse
    'danse': { name: 'Danse', met: 5.0, category: 'danse' },
    'danse_lente': { name: 'Danse lente', met: 3.0, category: 'danse' },
    'danse_moderee': { name: 'Danse modérée', met: 5.0, category: 'danse' },
    'danse_intense': { name: 'Danse intense', met: 7.0, category: 'danse' },
    'zumba': { name: 'Zumba', met: 7.5, category: 'danse' },
    
    // Arts martiaux
    'boxe': { name: 'Boxe', met: 9.0, category: 'martial' },
    'judo': { name: 'Judo', met: 8.0, category: 'martial' },
    'karate': { name: 'Karate', met: 8.0, category: 'martial' },
    
    // Autres
    'yoga': { name: 'Yoga', met: 3.0, category: 'autre' },
    'pilates': { name: 'Pilates', met: 3.5, category: 'autre' },
    'escalade': { name: 'Escalade', met: 8.0, category: 'autre' },
    'ski_alpin': { name: 'Ski alpin', met: 6.0, category: 'autre' },
    'ski_fond': { name: 'Ski de fond', met: 9.0, category: 'autre' },
    'randonnee': { name: 'Randonnée', met: 6.0, category: 'autre' },
    'aviron': { name: 'Aviron', met: 7.0, category: 'autre' },
    'golf': { name: 'Golf', met: 4.5, category: 'autre' }
};

// Initialiser la nutrition
async function initializeNutrition() {
    console.log("🍽️ Initialisation Nutrition");
    
    // Charger le profil
    loadProfile();
    
    // Charger les aliments du jour
    loadDailyFoods();
    
    // Initialiser les sélecteurs de sports
    if (document.getElementById('sport-category')) {
        console.log("🎯 Initialisation des sélecteurs de sports");
        updateSportActivities();
        
        // Ajouter les écouteurs d'événements
        document.getElementById('sport-category').addEventListener('change', updateSportActivities);
        document.getElementById('sport-type').addEventListener('change', calculateCaloriesBurned);
        document.getElementById('sport-duration').addEventListener('input', calculateCaloriesBurned);
    }
    
    // Charger les activités sportives existantes
    loadSportActivities();
    
    // Mettre à jour les résumés
    updateNutritionSummary();
    
    console.log("✅ Nutrition initialisée");
}

// Calcul des objectifs nutritionnels
async function calculateGoals() {
    const age = parseInt(document.getElementById('age').value) || 25;
    const weight = parseInt(document.getElementById('weight').value) || 70;
    const height = parseInt(document.getElementById('height').value) || 175;
    const goal = document.getElementById('goal').value;
    const activity = parseFloat(document.getElementById('activity').value) || 1.375;
    
    // Calcul du métabolisme de base
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    
    // Calories de maintenance
    let maintenanceCalories = Math.round(bmr * activity);
    
    // Ajustement selon l'objectif
    let targetCalories;
    switch(goal) {
        case 'muscle':
            targetCalories = maintenanceCalories + 300;
            break;
        case 'fatloss':
            targetCalories = maintenanceCalories - 300;
            break;
        default:
            targetCalories = maintenanceCalories;
    }
    
    // Calcul des macros
    const protein = Math.round(weight * 2.2);
    const fat = Math.round((targetCalories * 0.25) / 9);
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    
    // Sauvegarder les objectifs
    const goals = {
        calories: targetCalories,
        protein: protein,
        carbs: carbs,
        fat: fat
    };
    
    await saveData('nutritionGoals', goals);
    await saveData('userProfile', { age, weight, height, goal, activity });
    
    // Afficher les objectifs
    document.getElementById('calorie-goal').textContent = targetCalories;
    document.getElementById('protein-goal').textContent = protein;
    document.getElementById('carbs-goal').textContent = carbs;
    document.getElementById('fat-goal').textContent = fat;
    
    showNotification('Objectifs calculés avec succès !', 'success');
    updateNutritionSummary();
}

async function loadProfile() {
    const savedProfile = await loadData('userProfile');
    const savedGoals = await loadData('nutritionGoals');
    
    if (savedProfile) {
        document.getElementById('age').value = savedProfile.age;
        document.getElementById('weight').value = savedProfile.weight;
        document.getElementById('height').value = savedProfile.height;
        document.getElementById('goal').value = savedProfile.goal;
        document.getElementById('activity').value = savedProfile.activity;
    }
    
    if (savedGoals) {
        document.getElementById('calorie-goal').textContent = savedGoals.calories;
        document.getElementById('protein-goal').textContent = savedGoals.protein;
        document.getElementById('carbs-goal').textContent = savedGoals.carbs;
        document.getElementById('fat-goal').textContent = savedGoals.fat;
    }
}

// Recherche d'aliments
async function searchFood() {
    const query = document.getElementById('food-search').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    resultsDiv.innerHTML = '<div class="loading">🔍 Recherche en cours...</div>';
    
    try {
        // API Open Food Facts
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            resultsDiv.innerHTML = data.products
                .filter(product => product.product_name && product.nutriments)
                .map(product => {
                    const calories = product.nutriments['energy-kcal'] || product.nutriments['energy'] / 4.184 || 0;
                    const protein = product.nutriments.proteins || 0;
                    const carbs = product.nutriments.carbohydrates || 0;
                    const fat = product.nutriments.fat || 0;
                    
                    return `
                        <div class="food-result" onclick="selectFoodFromAPI(
                            '${product.product_name.replace(/'/g, "\\'")}',
                            ${calories},
                            ${protein},
                            ${carbs},
                            ${fat},
                            '${product.image_front_small_url || ''}'
                        )">
                            <div class="food-result-content">
                                ${product.image_front_small_url ? `
                                    <img src="${product.image_front_small_url}" alt="${product.product_name}" class="food-image">
                                ` : ''}
                                <div class="food-info">
                                    <strong>${product.product_name}</strong>
                                    <div class="food-brand">${product.brands || ''}</div>
                                    <div class="food-macros">
                                        ${calories} kcal - P:${protein}g C:${carbs}g L:${fat}g
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                })
                .join('');
        } else {
            resultsDiv.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
            searchFoodLocal(query);
        }
    } catch (error) {
        console.error('Erreur recherche:', error);
        resultsDiv.innerHTML = '<div class="error">Erreur de recherche. Utilisation base locale.</div>';
        searchFoodLocal(query);
    }
}

function selectFoodFromAPI(name, calories, protein, carbs, fat, imageUrl) {
    saveData('selectedFood', JSON.stringify({
        name, calories, protein, carbs, fat, quantity: 100, imageUrl
    }));
    
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('food-search').value = '';
    
    showNotification(`Aliment "${name}" sélectionné. Choisissez un repas.`, 'success');
}

function selectFood(name, calories, protein, carbs, fat) {
    saveData('selectedFood', JSON.stringify({
        name, calories, protein, carbs, fat, quantity: 100
    }));
    
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('food-search').value = '';
    
    showNotification(`Aliment "${name}" sélectionné. Choisissez un repas.`, 'success');
}

async function addFoodToMeal(mealType) {
    const selectedFood = loadData('selectedFood');
    
    if (!selectedFood) {
        showNotification('Veuillez d\'abord rechercher et sélectionner un aliment', 'danger');
        return;
    }
    
    const food = JSON.parse(selectedFood);
    const today = new Date().toDateString();
    
    // Charger les données existantes
    let mealData = await loadNutrition(today);
    if (!mealData[mealType]) {
        mealData[mealType] = [];
    }
    
    mealData[mealType].push(food);
    
    // Sauvegarder avec Firebase
    await saveNutrition(today, mealData);
    
    // Recharger l'affichage
    loadDailyFoods();
    updateNutritionSummary();
    
    showNotification(`${food.name} ajouté au ${getMealName(mealType)}`, 'success');
}

function getMealName(mealType) {
    const meals = {
        'breakfast': 'petit-déjeuner',
        'morning-snack': 'encas du matin',
        'lunch': 'déjeuner',
        'afternoon-snack': 'goûter',
        'dinner': 'dîner'
    };
    return meals[mealType] || mealType;
}

async function loadDailyFoods() {
    const today = new Date().toDateString();
    const mealData = await loadNutrition(today);
    
    const meals = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner'];
    
    meals.forEach(meal => {
        const container = document.getElementById(`${meal}-foods`);
        const foods = mealData[meal] || [];
        
        container.innerHTML = foods.map((food, index) => `
            <div class="food-item">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div class="food-macros">${food.calories} kcal - P:${food.protein}g C:${food.carbs}g L:${food.fat}g</div>
                </div>
                <div class="food-quantity">
                    <span>${food.quantity}g</span>
                    <button class="remove-food" onclick="removeFood('${meal}', ${index})">✕</button>
                </div>
            </div>
        `).join('');
    });
}

async function removeFood(mealType, index) {
    const today = new Date().toDateString();
    let mealData = await loadNutrition(today);
    
    if (mealData[mealType]) {
        mealData[mealType].splice(index, 1);
        await saveNutrition(today, mealData);
        loadDailyFoods();
        updateNutritionSummary();
    }
}

async function addSportActivity() {
    const sportType = document.getElementById('sport-type').value;
    const duration = parseInt(document.getElementById('sport-duration').value);
    const calories = parseInt(document.getElementById('sport-calories').value);
    
    if (!sportType || !duration || !calories) {
        showNotification('Veuillez sélectionner une activité et une durée', 'danger');
        return;
    }
    
    if (!sportDatabase[sportType]) {
        showNotification('Activité non valide', 'danger');
        return;
    }
    
    const today = new Date().toDateString();
    let activities = await loadSport(today);
    
    activities.push({
        type: sportType,
        name: sportDatabase[sportType].name,
        duration,
        calories,
        met: sportDatabase[sportType].met,
        timestamp: new Date().toISOString()
    });
    
    await saveSport(today, activities);
    
    // Réinitialiser les champs
    document.getElementById('sport-type').value = '';
    document.getElementById('sport-duration').value = '';
    document.getElementById('sport-calories').value = '';
    
    loadSportActivities();
    updateNutritionSummary();
    showNotification('Activité sportive ajoutée !', 'success');
}

async function loadSportActivities() {
    const today = new Date().toDateString();
    const activities = await loadSport(today);
    const container = document.getElementById('sport-activities');
    
    container.innerHTML = activities.map(activity => `
        <div class="sport-activity">
            <div>
                <strong>${activity.type}</strong><br>
                <small>${activity.duration} min - ${activity.calories} kcal brûlées</small>
            </div>
            <button class="remove-food" onclick="removeSportActivity('${activity.timestamp}')">✕</button>
        </div>
    `).join('');
}

async function removeSportActivity(timestamp) {
    const today = new Date().toDateString();
    let activities = await loadSport(today);
    
    activities = activities.filter(activity => activity.timestamp !== timestamp);
    await saveSport(today, activities);
    
    loadSportActivities();
    updateNutritionSummary();
}

async function updateNutritionSummary() {
    const today = new Date().toDateString();
    const mealData = await loadNutrition(today);
    const activities = await loadSport(today);
    const goals = await loadData('nutritionGoals', {});
    
    // Calculer les totaux consommés
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    Object.values(mealData).forEach(meal => {
        meal.forEach(food => {
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalCarbs += food.carbs;
            totalFat += food.fat;
        });
    });
    
    // Calculer les calories brûlées
    const caloriesBurned = activities.reduce((sum, activity) => sum + activity.calories, 0);
    
    // Calculer la balance calorique
    const netCalories = totalCalories - caloriesBurned;
    const calorieGoal = goals.calories || 2000;
    const calorieBalance = netCalories - calorieGoal;
    
    // Mettre à jour l'interface
    if (document.getElementById('total-calories-consumed')) {
        document.getElementById('total-calories-consumed').textContent = totalCalories;
        document.getElementById('total-calories-goal').textContent = calorieGoal;
        document.getElementById('protein-consumed').textContent = Math.round(totalProtein);
        document.getElementById('carbs-consumed').textContent = Math.round(totalCarbs);
        document.getElementById('fat-consumed').textContent = Math.round(totalFat);
        
        document.getElementById('protein-target').textContent = goals.protein || 150;
        document.getElementById('carbs-target').textContent = goals.carbs || 250;
        document.getElementById('fat-target').textContent = goals.fat || 70;
        
        document.getElementById('calories-balance').textContent = calorieBalance;
        
        // Mettre à jour les barres de progression
        updateProgressBar('calories-progress', totalCalories, calorieGoal);
        updateProgressBar('protein-progress', totalProtein, goals.protein || 150);
        updateProgressBar('carbs-progress', totalCarbs, goals.carbs || 250);
        updateProgressBar('fat-progress', totalFat, goals.fat || 70);
        
        // Message de balance
        const balanceMessage = document.getElementById('balance-message');
        const balanceDiv = document.querySelector('.calories-balance');
        
        if (calorieBalance > 500) {
            balanceMessage.textContent = '⚠️ Excédent calorique important';
            balanceDiv.className = 'calories-balance negative';
        } else if (calorieBalance > 0) {
            balanceMessage.textContent = '👍 Léger excédent - Bon pour la prise de muscle';
            balanceDiv.className = 'calories-balance positive';
        } else if (calorieBalance > -500) {
            balanceMessage.textContent = '✅ Balance idéale pour la prise de muscle';
            balanceDiv.className = 'calories-balance positive';
        } else {
            balanceMessage.textContent = '💪 Déficit calorique - Pensez à manger plus';
            balanceDiv.className = 'calories-balance negative';
        }
    }
}

function updateProgressBar(elementId, current, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    element.style.width = percentage + '%';
    
    if (percentage >= 100) {
        element.style.background = 'var(--success)';
    } else if (percentage >= 75) {
        element.style.background = 'var(--warning)';
    } else {
        element.style.background = 'var(--accent)';
    }
}

async function saveNutrition() {
    showNotification('Données nutritionnelles sauvegardées !', 'success');
}

async function clearDay() {
    if (confirm('Voulez-vous vraiment effacer toutes les données nutritionnelles de aujourd\'hui ?')) {
        const today = new Date().toDateString();
        localStorage.removeItem(`nutrition_${today}`);
        localStorage.removeItem(`sport_${today}`);
        
        // Note: Pour Firebase, il faudrait supprimer les documents correspondants
        
        loadDailyFoods();
        loadSportActivities();
        updateNutritionSummary();
        showNotification('Journée nutritionnelle effacée !', 'success');
    }
}

function downloadNutritionPDF() {
    showNotification('Fonction PDF nutrition en développement', 'success');
}

// Mettre à jour les activités selon la catégorie
function updateSportActivities() {
    const category = document.getElementById('sport-category').value;
    const sportTypeSelect = document.getElementById('sport-type');
    
    sportTypeSelect.innerHTML = '<option value="">Choisir une activité</option>';
    
    const addedActivities = new Set();
    
    Object.entries(sportDatabase).forEach(([key, sport]) => {
        if (category === 'all' || sport.category === category) {
            const activityKey = sport.name + sport.met;
            if (!addedActivities.has(activityKey)) {
                addedActivities.add(activityKey);
                
                const option = document.createElement('option');
                option.value = key;
                option.textContent = sport.name;
                sportTypeSelect.appendChild(option);
            }
        }
    });
    
    document.getElementById('sport-calories').value = '';
}

function calculateCaloriesBurned() {
    const sportType = document.getElementById('sport-type').value;
    const duration = parseInt(document.getElementById('sport-duration').value);
    const caloriesInput = document.getElementById('sport-calories');
    
    if (!sportType || !duration) {
        caloriesInput.value = '';
        return;
    }
    
    const profile = JSON.parse(loadData('userProfile') || '{}');
    const weight = profile.weight || 70;
    
    if (!sportDatabase[sportType]) {
        caloriesInput.value = '';
        showNotification('Activité non trouvée', 'danger');
        return;
    }
    
    const met = sportDatabase[sportType].met;
    const durationInHours = duration / 60;
    let caloriesBurned = Math.round(met * weight * durationInHours);
    
    const age = profile.age || 25;
    if (age > 40) {
        caloriesBurned = Math.round(caloriesBurned * 0.95);
    } else if (age > 50) {
        caloriesBurned = Math.round(caloriesBurned * 0.90);
    }
    
    caloriesInput.value = caloriesBurned;
    showSportInfo(sportType, duration, caloriesBurned);
}

function showSportInfo(sportType, duration, calories) {
    console.log(`${sportDatabase[sportType].name}: ${duration}min = ${calories} kcal brûlées`);
}

// === OBJECTIFS LONG TERME ===
async function initializeObjectives() {
    console.log("🎯 Initialisation Objectifs Long Terme");
    loadLongTermObjectives();
}

async function loadLongTermObjectives() {
    const container = document.getElementById('long-term-objectives');
    if (!container) return;
    
    const objectives = await loadLongTermObjectives();
    
    container.innerHTML = objectives.map((objective, index) => `
        <div class="objective-item">
            <input type="checkbox" ${objective.completed ? 'checked' : ''} 
                   onchange="toggleObjective(${index})">
            <input type="text" value="${objective.text}" 
                   onchange="updateObjectiveText(${index}, this.value)"
                   class="objective-input">
            <button onclick="removeObjective(${index})" class="remove-btn">✕</button>
        </div>
    `).join('');
    
    updateObjectivesStats();
}

async function addLongTermObjective() {
    const objectives = await loadLongTermObjectives();
    objectives.push({
        text: 'Nouvel objectif',
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    await saveLongTermObjectives(objectives);
    loadLongTermObjectives();
    showNotification('Objectif ajouté !', 'success');
}

async function toggleObjective(index) {
    const objectives = await loadLongTermObjectives();
    objectives[index].completed = !objectives[index].completed;
    await saveLongTermObjectives(objectives);
    updateObjectivesStats();
}

async function updateObjectiveText(index, text) {
    const objectives = await loadLongTermObjectives();
    objectives[index].text = text;
    await saveLongTermObjectives(objectives);
}

async function removeObjective(index) {
    const objectives = await loadLongTermObjectives();
    objectives.splice(index, 1);
    await saveLongTermObjectives(objectives);
    loadLongTermObjectives();
    showNotification('Objectif supprimé', 'success');
}

async function updateObjectivesStats() {
    const objectives = await loadLongTermObjectives();
    const total = objectives.length;
    const completed = objectives.filter(obj => obj.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (document.getElementById('objectifs-total')) {
        document.getElementById('objectifs-total').textContent = total;
        document.getElementById('objectifs-completed').textContent = completed;
        document.getElementById('completion-rate').textContent = rate + '%';
    }
}

async function saveObjectives() {
    showNotification('Objectifs sauvegardés !', 'success');
}

// === HABITUDES ===
async function initializeHabits() {
    console.log("📊 Initialisation Habitudes");
    loadHabits();
}

async function loadHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    const habits = await loadHabits();
    
    container.innerHTML = habits.map((habit, index) => `
        <div class="habit-item">
            <input type="checkbox" ${habit.completed ? 'checked' : ''} 
                   onchange="toggleHabit(${index})">
            <span class="habit-name">${habit.name}</span>
            <div class="habit-streak">🔥 ${habit.streak || 0} jours</div>
            <button onclick="removeHabit(${index})" class="remove-btn">✕</button>
        </div>
    `).join('');
}

async function addHabit() {
    const habitName = prompt('Nom de la nouvelle habitude:');
    if (!habitName) return;
    
    const habits = await loadHabits();
    habits.push({
        name: habitName,
        completed: false,
        streak: 0,
        createdAt: new Date().toISOString()
    });
    
    await saveHabits(habits);
    loadHabits();
    showNotification('Habitude ajoutée !', 'success');
}

async function toggleHabit(index) {
    const habits = await loadHabits();
    habits[index].completed = !habits[index].completed;
    
    if (habits[index].completed) {
        habits[index].streak = (habits[index].streak || 0) + 1;
    }
    
    await saveHabits(habits);
    loadHabits();
    updateHabitsStats();
}

async function removeHabit(index) {
    const habits = await loadHabits();
    habits.splice(index, 1);
    await saveHabits(habits);
    loadHabits();
    showNotification('Habitude supprimée', 'success');
}

function updateHabitsStats() {
    const habits = JSON.parse(loadData('habits') || '[]');
    const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
    
    if (document.getElementById('current-streak')) {
        document.getElementById('current-streak').textContent = maxStreak;
    }
}

async function resetHabits() {
    if (confirm('Réinitialiser toutes les habitudes ?')) {
        const habits = await loadHabits();
        habits.forEach(habit => {
            habit.completed = false;
        });
        await saveHabits(habits);
        loadHabits();
        showNotification('Habitudes réinitialisées', 'success');
    }
}

async function saveHabits() {
    showNotification('Habitudes sauvegardées !', 'success');
}

// === PROJETS ===
async function initializeProjects() {
    console.log("🚀 Initialisation Projets");
    loadProjects();
    loadDeadlines();
}

async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const projects = await loadProjects();
    
    container.innerHTML = projects.map((project, index) => `
        <div class="project-item ${project.completed ? 'completed' : ''}">
            <input type="checkbox" ${project.completed ? 'checked' : ''} 
                   onchange="toggleProject(${index})">
            <div class="project-info">
                <h4>${project.name}</h4>
                <p>${project.description || 'Pas de description'}</p>
                <div class="project-meta">
                    <span class="project-deadline">📅 ${project.deadline || 'Pas de date'}</span>
                    <span class="project-priority ${project.priority}">${getPriorityLabel(project.priority)}</span>
                </div>
            </div>
            <button onclick="removeProject(${index})" class="remove-btn">✕</button>
        </div>
    `).join('');
    
    updateProjectsStats();
}

async function addProject() {
    const name = prompt('Nom du projet:');
    if (!name) return;
    
    const description = prompt('Description:');
    const deadline = prompt('Date limite (JJ/MM/AAAA):');
    const priority = prompt('Priorité (low/medium/high):', 'medium');
    
    const projects = await loadProjects();
    projects.push({
        name,
        description,
        deadline,
        priority: priority || 'medium',
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    await saveProjects(projects);
    loadProjects();
    loadDeadlines();
    showNotification('Projet ajouté !', 'success');
}

function getPriorityLabel(priority) {
    const labels = {
        low: '🟢 Faible',
        medium: '🟡 Moyenne',
        high: '🔴 Élevée'
    };
    return labels[priority] || 'Moyenne';
}

async function toggleProject(index) {
    const projects = await loadProjects();
    projects[index].completed = !projects[index].completed;
    await saveProjects(projects);
    loadProjects();
    loadDeadlines();
}

async function removeProject(index) {
    const projects = await loadProjects();
    projects.splice(index, 1);
    await saveProjects(projects);
    loadProjects();
    loadDeadlines();
    showNotification('Projet supprimé', 'success');
}

async function loadDeadlines() {
    const container = document.getElementById('deadlines-container');
    if (!container) return;
    
    const projects = await loadProjects();
    const upcoming = projects
        .filter(p => !p.completed && p.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
    
    container.innerHTML = upcoming.map(project => `
        <div class="deadline-item">
            <strong>${project.name}</strong>
            <span class="deadline-date">📅 ${project.deadline}</span>
        </div>
    `).join('');
}

function updateProjectsStats() {
    const projects = JSON.parse(loadData('projects') || '[]');
    const total = projects.length;
    const active = projects.filter(p => !p.completed).length;
    const completed = projects.filter(p => p.completed).length;
    
    if (document.getElementById('projects-total')) {
        document.getElementById('projects-total').textContent = total;
        document.getElementById('projects-active').textContent = active;
        document.getElementById('projects-completed').textContent = completed;
    }
}

async function saveProjects() {
    showNotification('Projets sauvegardés !', 'success');
}

// === SUIVI HYDRATATION ===
async function initializeHydration() {
    console.log("💧 Initialisation suivi hydratation");
    updateHydrationDisplay();
}

async function addWaterGlass() {
    const today = new Date().toDateString();
    const currentGlasses = await loadHydration(today);
    const newGlasses = Math.min(8, currentGlasses + 1);
    
    await saveHydration(today, newGlasses);
    updateHydrationDisplay();
    updateAllDailyProgress();
    showNotification('💧 Verre d\'eau ajouté !', 'success');
}

async function removeWaterGlass() {
    const today = new Date().toDateString();
    const currentGlasses = await loadHydration(today);
    const newGlasses = Math.max(0, currentGlasses - 1);
    
    await saveHydration(today, newGlasses);
    updateHydrationDisplay();
    updateAllDailyProgress();
    showNotification('💧 Verre d\'eau retiré', 'success');
}

async function updateHydrationDisplay() {
    const today = new Date().toDateString();
    const glasses = await loadHydration(today);
    
    const progressPercent = (glasses / 8) * 100;
    const progressText = `${glasses}/8 verres`;
    
    if (document.getElementById('hydration-progress')) {
        document.getElementById('hydration-progress').textContent = progressText;
        document.getElementById('hydration-fill').style.width = progressPercent + '%';
        
        const fillElement = document.getElementById('hydration-fill');
        if (progressPercent >= 100) {
            fillElement.style.background = 'var(--success)';
        } else if (progressPercent >= 50) {
            fillElement.style.background = 'var(--warning)';
        } else {
            fillElement.style.background = 'var(--accent)';
        }
    }
    
    updateWaterGlassesVisual(glasses);
}

function updateWaterGlassesVisual(glasses) {
    const container = document.getElementById('water-glasses');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const glassContainer = document.createElement('div');
        glassContainer.className = 'water-glass-container';
        
        const glass = document.createElement('div');
        glass.className = `water-glass-large ${i < glasses ? 'full' : 'empty'}`;
        
        glass.innerHTML = `
            <div class="glass-top"></div>
            <div class="glass-body">
                <div class="water-level ${i < glasses ? 'filled' : ''}"></div>
            </div>
            <div class="glass-bottom"></div>
            <div class="glass-number">${i + 1}</div>
        `;
        
        glass.addEventListener('click', async function() {
            const today = new Date().toDateString();
            const currentGlasses = await loadHydration(today);
            
            if (i < currentGlasses) {
                await removeWaterGlass();
            } else if (i === currentGlasses) {
                await addWaterGlass();
            }
        });
        
        glassContainer.appendChild(glass);
        container.appendChild(glassContainer);
    }
}

// === DASHBOARD FUNCTIONS ===

// DASHBOARD - Données en temps réel
async function loadDashboardData() {
    console.log("🔄 Chargement des données réelles...");
    loadTodayPlanning();
    await loadTodayObjectives();
    await loadDashboardHydration();
    await loadFinanceSummary();
    await loadNutritionSummary();
    await loadLongTermSummary();
    await loadProjectsSummary();
    await loadPatrimoineSummary();
    await loadNotesSummary();
}

// === PLANNING ===
async function loadTodayPlanning() {
    const container = document.getElementById('today-planning');
    if (!container) return;
    
    const now = new Date();
    const currentDay = now.getDay();
    const planningDay = currentDay === 0 ? 6 : currentDay - 1;
    const currentHour = now.getHours();
    
    let hasActivities = false;
    let planningHTML = '<div class="planning-items">';
    
    for (let hour = 6; hour <= 23; hour++) {
        const activity = await loadPlanning(hour-6, planningDay);
        
        if (activity && activity.trim() !== '') {
            hasActivities = true;
            const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
            const isCurrent = hour === currentHour;
            
            planningHTML += `
                <div class="planning-item ${isCurrent ? 'current' : ''}">
                    <span class="planning-time">${timeSlot}</span>
                    <span class="planning-activity">${activity}</span>
                    ${isCurrent ? '<span class="current-badge">🔴 Maintenant</span>' : ''}
                </div>
            `;
        }
    }
    
    planningHTML += '</div>';
    
    if (!hasActivities) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">📅</div>
                <p>Aucun planning pour aujourd'hui</p>
                <small>Planifiez votre journée dans "Vie Perso"</small>
            </div>
        `;
    } else {
        container.innerHTML = planningHTML;
    }
}

// === OBJECTIFS JOURNALIERS ===
async function loadTodayObjectives() {
    const container = document.getElementById('today-objectives');
    if (!container) return;
    
    const today = new Date();
    const todayDate = today.toLocaleDateString('fr-FR');
    const objectives = await loadDailyObjectives(todayDate);
    
    const completed = objectives.filter(obj => obj.completed).length;
    const total = objectives.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (total === 0) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">🎯</div>
                <p>Aucun objectif aujourd'hui</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="objectives-progress">
            <div class="progress-circle" style="background: conic-gradient(var(--accent) ${progress}%, rgba(255,255,255,0.1) 0%)">
                <span class="progress-value">${progress}%</span>
            </div>
            <div class="objectives-stats">
                <span class="stat">${completed}/${total} complétés</span>
            </div>
        </div>
        <div class="objectives-list">
            ${objectives.slice(0, 3).map(obj => `
                <div class="objective-item ${obj.completed ? 'completed' : ''}">
                    <span class="objective-checkbox">${obj.completed ? '✅' : '⭕'}</span>
                    <span class="objective-text">${obj.text}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// === HYDRATATION ===
async function loadDashboardHydration() {
    const container = document.getElementById('dashboard-hydration');
    if (!container) return;
    
    const today = new Date().toDateString();
    const glasses = await loadHydration(today);
    const progress = (glasses / 8) * 100;
    
    container.innerHTML = `
        <div class="hydration-display">
            <div class="hydration-main">
                <div class="hydration-circle">
                    <span class="hydration-value">${glasses * 250}ml</span>
                    <span class="hydration-label">/2000ml</span>
                </div>
                <div class="hydration-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="hydration-percent">${Math.round(progress)}%</span>
                </div>
            </div>
            <div class="hydration-bars">
                ${Array.from({length: 8}, (_, i) => `
                    <div class="hydration-bar ${i < glasses ? 'full' : 'empty'}"></div>
                `).join('')}
            </div>
        </div>
    `;
}

// === FINANCE ===
async function loadFinanceSummary() {
    const container = document.getElementById('finance-summary');
    if (!container) return;
    
    const depenses = await loadFinance("depenses") || "";
    const revenus = await loadFinance("revenus") || "";
    
    const solde = calculerSoldeMensuelFromText(revenus, depenses);
    const totalRevenus = calculerTotalFromText(revenus);
    const totalDepenses = calculerTotalFromText(depenses);
    
    container.innerHTML = `
        <div class="finance-display">
            <div class="finance-balance ${solde >= 0 ? 'positive' : 'negative'}">
                <span class="balance-label">Solde mensuel</span>
                <span class="balance-value">${solde}€</span>
            </div>
            <div class="finance-details">
                <div class="finance-item">
                    <span class="finance-icon">📥</span>
                    <span class="finance-amount positive">${totalRevenus}€</span>
                    <span class="finance-label">Revenus</span>
                </div>
                <div class="finance-item">
                    <span class="finance-icon">📤</span>
                    <span class="finance-amount negative">${totalDepenses}€</span>
                    <span class="finance-label">Dépenses</span>
                </div>
            </div>
        </div>
    `;
}

function calculerTotalFromText(text) {
    let total = 0;
    const lines = text.split('\n');
    lines.forEach(line => {
        const montant = extraireMontant(line);
        if (montant > 0) total += montant;
    });
    return total;
}

// === NUTRITION ===
async function loadNutritionSummary() {
    const container = document.getElementById('nutrition-summary');
    if (!container) return;
    
    const today = new Date().toDateString();
    const mealData = await loadNutrition(today);
    
    let totalCalories = 0;
    Object.values(mealData).forEach(meal => {
        meal.forEach(food => {
            totalCalories += food.calories || 0;
        });
    });
    
    const goals = await loadData('nutritionGoals', {});
    const calorieGoal = goals.calories || 2000;
    const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
    
    container.innerHTML = `
        <div class="nutrition-display">
            <div class="calories-main">
                <div class="calories-circle">
                    <span class="calories-value">${Math.round(totalCalories)}</span>
                    <span class="calories-label">/${calorieGoal} kcal</span>
                </div>
                <div class="calories-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="calories-percent">${Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    `;
}

// === OBJECTIFS LONG TERME ===
async function loadLongTermSummary() {
    const container = document.getElementById('longterm-summary');
    if (!container) return;
    
    const objectives = await loadLongTermObjectives();
    const completed = objectives.filter(obj => obj.completed).length;
    const total = objectives.length;
    
    if (total === 0) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">🎯</div>
                <p>Aucun objectif long terme</p>
                <small>Ajoutez des objectifs dans "Objectifs"</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="longterm-display">
            <div class="longterm-stats">
                <span class="stat-value">${completed}/${total}</span>
                <span class="stat-label">Objectifs atteints</span>
            </div>
            <div class="longterm-list">
                ${objectives.slice(0, 2).map(obj => `
                    <div class="longterm-item ${obj.completed ? 'completed' : ''}">
                        ${obj.completed ? '✅' : '⭕'} ${obj.text}
                    </div>
                `).join('')}
                ${objectives.length > 2 ? `<div class="more-items">+ ${objectives.length - 2} autres</div>` : ''}
            </div>
        </div>
    `;
}

// === PROJETS ===
async function loadProjectsSummary() {
    const container = document.getElementById('projects-summary');
    if (!container) return;
    
    const projects = await loadProjects();
    const activeProjects = projects.filter(p => !p.completed);
    
    if (activeProjects.length === 0) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">🚀</div>
                <p>Aucun projet en cours</p>
                <small>Créez des projets dans "Projets"</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="projects-display">
            <div class="projects-count">
                <span class="count-value">${activeProjects.length}</span>
                <span class="count-label">Projets actifs</span>
            </div>
            <div class="projects-list">
                ${activeProjects.slice(0, 2).map(project => `
                    <div class="project-item">
                        <strong>${project.name}</strong>
                        ${project.deadline ? `<br><small>📅 ${project.deadline}</small>` : ''}
                    </div>
                `).join('')}
                ${activeProjects.length > 2 ? `<div class="more-items">+ ${activeProjects.length - 2} autres</div>` : ''}
            </div>
        </div>
    `;
}

// === PATRIMOINE ===
async function loadPatrimoineSummary() {
    const container = document.getElementById('patrimoine-summary');
    if (!container) return;
    
    const patrimoineText = await loadFinance("patrimoine") || "";
    const { total, epargne, investissements, immobilier, autres } = analyserPatrimoine(patrimoineText);
    
    if (total === 0) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">🏦</div>
                <p>Aucun patrimoine renseigné</p>
                <small>Ajoutez votre patrimoine dans "Finance"</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="patrimoine-display">
            <div class="patrimoine-total">
                <span class="patrimoine-value">${formatMoney(total)}</span>
                <span class="patrimoine-label">Valeur totale</span>
            </div>
            <div class="patrimoine-breakdown">
                ${epargne > 0 ? `
                    <div class="patrimoine-item">
                        <span class="patrimoine-category">Épargne</span>
                        <span class="patrimoine-amount">${formatMoney(epargne)}</span>
                    </div>
                ` : ''}
                ${investissements > 0 ? `
                    <div class="patrimoine-item">
                        <span class="patrimoine-category">Investissements</span>
                        <span class="patrimoine-amount">${formatMoney(investissements)}</span>
                    </div>
                ` : ''}
                ${immobilier > 0 ? `
                    <div class="patrimoine-item">
                        <span class="patrimoine-category">Immobilier</span>
                        <span class="patrimoine-amount">${formatMoney(immobilier)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// === NOTES ===
async function loadNotesSummary() {
    const container = document.getElementById('notes-summary');
    if (!container) {
        console.error("❌ Container notes-summary non trouvé");
        return;
    }

    const quickNotes = await loadQuickNotes();
    const events = await loadAgendaEvents();
    const today = new Date().toISOString().split('T')[0];
    
    const todayEvents = events.filter(event => event.date === today);
    
    if (quickNotes.length === 0 && todayEvents.length === 0) {
        container.innerHTML = `
            <div class="no-data-card">
                <div class="no-data-icon">📝</div>
                <p>Aucune note récente</p>
                <small>Ajoutez des notes dans "Notes"</small>
            </div>
        `;
        return;
    }

    let content = '';
    
    if (todayEvents.length > 0) {
        content += `
            <div class="today-events">
                <h4>📅 Aujourd'hui</h4>
                ${todayEvents.slice(0, 2).map(event => `
                    <div class="event-mini">
                        <strong>${event.title}</strong>
                        ${event.time ? `<small>${event.time}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (quickNotes.length > 0) {
        content += `
            <div class="recent-notes">
                <h4>📌 Notes récentes</h4>
                ${quickNotes.slice(0, 2).map(note => `
                    <div class="note-mini">${note.text}</div>
                `).join('')}
            </div>
        `;
    }

    container.innerHTML = content;
}

// === NOTES & AGENDA ===
async function initializeNotes() {
    console.log("📝 Initialisation Notes & Agenda");
    await loadQuickNotes();
    await loadEvents();
    showCategory('travail');
}

// Notes Rapides
async function addQuickNote() {
    const noteText = document.getElementById('quick-note').value.trim();
    if (!noteText) {
        showNotification('Veuillez écrire une note', 'danger');
        return;
    }

    const notes = await loadQuickNotes();
    const newNote = {
        id: Date.now(),
        text: noteText,
        createdAt: new Date().toISOString(),
        category: 'quick'
    };

    notes.unshift(newNote);
    await saveQuickNotes(notes);

    document.getElementById('quick-note').value = '';
    await loadQuickNotes();
    showNotification('Note ajoutée !', 'success');
}

async function loadQuickNotes() {
    const container = document.getElementById('quick-notes-list');
    if (!container) return;

    const notes = await loadQuickNotes();
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune note rapide</p>';
        return;
    }

    container.innerHTML = notes.slice(0, 10).map(note => `
        <div class="note-item">
            <div class="note-content">${note.text}</div>
            <div class="note-meta">
                <span class="note-date">${new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
                <button onclick="deleteQuickNote(${note.id})" class="delete-btn">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function deleteQuickNote(noteId) {
    const notes = await loadQuickNotes();
    const filteredNotes = notes.filter(note => note.id !== noteId);
    await saveQuickNotes(filteredNotes);
    await loadQuickNotes();
    showNotification('Note supprimée', 'success');
}

// Agenda
async function addEvent() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value.trim();

    if (!title || !date) {
        showNotification('Titre et date requis', 'danger');
        return;
    }

    const events = await loadAgendaEvents();
    const newEvent = {
        id: Date.now(),
        title,
        date,
        time,
        description,
        createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    await saveAgendaEvents(events);

    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-time').value = '';
    document.getElementById('event-description').value = '';

    await loadEvents();
    showNotification('Événement ajouté !', 'success');
}

async function loadEvents() {
    const container = document.getElementById('events-list');
    if (!container) return;

    const events = await loadAgendaEvents();
    const today = new Date().toISOString().split('T')[0];
    
    const upcomingEvents = events.filter(event => event.date >= today).slice(0, 10);

    if (upcomingEvents.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun événement à venir</p>';
        return;
    }

    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-item ${event.date === today ? 'today' : ''}">
            <div class="event-date">
                <strong>${new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                ${event.time ? `<br><small>${event.time}</small>` : ''}
            </div>
            <div class="event-content">
                <h4>${event.title}</h4>
                ${event.description ? `<p>${event.description}</p>` : ''}
            </div>
            <button onclick="deleteEvent(${event.id})" class="delete-btn">🗑️</button>
        </div>
    `).join('');
}

async function deleteEvent(eventId) {
    const events = await loadAgendaEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    await saveAgendaEvents(filteredEvents);
    await loadEvents();
    showNotification('Événement supprimé', 'success');
}

// Notes Catégorisées
let currentCategory = 'travail';

function showCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const btn = document.querySelector(`.category-btn[onclick="showCategory('${category}')"]`);
    if (btn) btn.classList.add('active');
    
    loadCategoryNotes();
}

async function addCategoryNote() {
    const noteText = document.getElementById('category-note').value.trim();
    if (!noteText) {
        showNotification('Veuillez écrire une note', 'danger');
        return;
    }

    const notes = await loadCategoryNotes();
    if (!notes[currentCategory]) {
        notes[currentCategory] = [];
    }

    const newNote = {
        id: Date.now(),
        text: noteText,
        createdAt: new Date().toISOString()
    };

    notes[currentCategory].unshift(newNote);
    await saveCategoryNotes(notes);

    document.getElementById('category-note').value = '';
    await loadCategoryNotes();
    showNotification('Note ajoutée !', 'success');
}

async function loadCategoryNotes() {
    const container = document.getElementById('category-notes-list');
    if (!container) return;

    const notes = await loadCategoryNotes();
    const categoryNotes = notes[currentCategory] || [];

    if (categoryNotes.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune note dans cette catégorie</p>';
        return;
    }

    container.innerHTML = categoryNotes.map(note => `
        <div class="note-item">
            <div class="note-content">${note.text}</div>
            <div class="note-meta">
                <span class="note-date">${new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
                <button onclick="deleteCategoryNote(${note.id})" class="delete-btn">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function deleteCategoryNote(noteId) {
    const notes = await loadCategoryNotes();
    if (notes[currentCategory]) {
        notes[currentCategory] = notes[currentCategory].filter(note => note.id !== noteId);
        await saveCategoryNotes(notes);
        await loadCategoryNotes();
        showNotification('Note supprimée', 'success');
    }
}

// Utilitaires Notes
async function exportNotes() {
    const quickNotes = await loadQuickNotes();
    const events = await loadAgendaEvents();
    const categoryNotes = await loadCategoryNotes();
    
    const allData = {
        quickNotes,
        events,
        categoryNotes,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_backup_${new Date().toLocaleDateString('fr-FR')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Notes exportées !', 'success');
}

async function clearAllNotes() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les notes ?')) {
        await saveQuickNotes([]);
        await saveAgendaEvents([]);
        await saveCategoryNotes({});
        await loadQuickNotes();
        await loadEvents();
        await loadCategoryNotes();
        showNotification('Toutes les notes effacées', 'success');
    }
}

// ========== INITIALISATION ==========

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', async function() {
    console.log("🚀 Page chargée - Initialisation...");
    await initializePage();
    
    // Recharger le dashboard toutes les 30 secondes
    if (document.querySelector(".dashboard")) {
        setInterval(loadDashboardData, 30000);
    }
    
    // Raccourci clavier pour les notes rapides
    const quickNoteInput = document.getElementById('quick-note');
    if (quickNoteInput) {
        quickNoteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                addQuickNote();
            }
        });
    }
});



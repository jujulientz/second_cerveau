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
  resultsDiv.innerHTML = results.map(food => `
    <div class="food-result" onclick="selectFood('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat})">
      <strong>${food.name}</strong><br>
      <small>${food.calories} kcal - P:${food.protein}g C:${food.carbs}g L:${food.fat}g</small>
    </div>
  `).join('');
}

// === Authentification ===
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("error");
  
    if (user === "touzeauj" && pass === "Glowup2025!") {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "dashboard.html";
    } else {
      error.textContent = "Identifiant ou mot de passe incorrect.";
    }
  }
  
  function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  }
  
// Sécurité renforcée
if (!window.location.href.includes("index.html")) {
    if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "index.html";
    }
  }
  
  // Initialisation spécifique aux pages
  document.addEventListener('DOMContentLoaded', function() {
    initializePage();
  });

 // === Initialisation principale ===
function initializePage() {
  console.log("🚀 Initialisation de la page...");

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
}
  // === Vie Perso ===
  function initializeViePerso() {
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
  function initializePlanning() {
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
        
        // Charger donnée sauvegardée
        const savedData = localStorage.getItem(`planning_${hour-6}_${day}`);
        if (savedData) {
          input.value = savedData;
        }
        
        // Sauvegarde auto
        input.addEventListener('input', function() {
          localStorage.setItem(`planning_${hour-6}_${day}`, this.value);
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
  function initializeDailyObjectives() {
    console.log("🎯 Création des objectifs journaliers...");
    const container = document.getElementById("objectifs-container");
    
    if (!container) {
      console.error("❌ Élément objectifs-container non trouvé");
      return;
    }
    
    container.innerHTML = '';
    const weekDates = getWeekDates();
    
    weekDates.forEach((dayInfo, dayIndex) => {
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
      
      const storageKey = `objectifs_${dayInfo.date.replace(/\//g, '_')}`;
      const savedObjectives = localStorage.getItem(storageKey);
      let objectives = [];
      
      if (savedObjectives) {
        objectives = JSON.parse(savedObjectives);
      } else {
        // Objectifs par défaut
        objectives = [
          { text: 'Sport 30min', completed: false },
          { text: 'Lecture 20 pages', completed: false },
          { text: 'Méditation 10min', completed: false }
        ];
        localStorage.setItem(storageKey, JSON.stringify(objectives));
      }
      
      // Créer chaque objectif
      objectives.forEach((objective, objIndex) => {
        const objectiveDiv = createObjectiveElement(objective, objIndex, storageKey, objectives);
        objectivesList.appendChild(objectiveDiv);
      });
      
      dayDiv.appendChild(objectivesList);
      
      // Bouton ajouter
      const addBtn = document.createElement("button");
      addBtn.textContent = "+ Ajouter un objectif";
      addBtn.className = "add-btn";
      addBtn.onclick = function() {
        addNewObjective(storageKey, objectives);
      };
      dayDiv.appendChild(addBtn);
      
      container.appendChild(dayDiv);
    });
    
    console.log("✅ Objectifs créés pour 7 jours");
    updateAllDailyProgress();
  }
  
  function createObjectiveElement(objective, index, storageKey, objectivesArray) {
    const objectiveDiv = document.createElement("div");
    objectiveDiv.className = `objectif-item ${objective.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = objective.completed;
    checkbox.className = "objective-checkbox";
    checkbox.onchange = function() {
      objective.completed = this.checked;
      objectiveDiv.className = `objectif-item ${this.checked ? 'completed' : ''}`;
      localStorage.setItem(storageKey, JSON.stringify(objectivesArray));
      updateDailyProgress(storageKey);
      updateWeeklyProgress();
    };
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = objective.text;
    input.className = "objective-input";
    input.placeholder = "Nouvel objectif";
    input.addEventListener('input', function() {
      objective.text = this.value;
      localStorage.setItem(storageKey, JSON.stringify(objectivesArray));
      updateDailyProgress(storageKey);
    });
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = function() {
      objectivesArray.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(objectivesArray));
      initializeDailyObjectives(); // Recharger
    };
    
    objectiveDiv.appendChild(checkbox);
    objectiveDiv.appendChild(input);
    objectiveDiv.appendChild(removeBtn);
    
    return objectiveDiv;
  }
  
  function addNewObjective(storageKey, objectivesArray) {
    objectivesArray.push({ text: 'Nouvel objectif', completed: false });
    localStorage.setItem(storageKey, JSON.stringify(objectivesArray));
    initializeDailyObjectives(); // Recharger
  }
  
  // === Progressions ===
  function updateDailyProgress(storageKey) {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    
    const objectives = JSON.parse(saved);
    const completed = objectives.filter(obj => obj.completed && obj.text.trim() !== '').length;
    const total = objectives.filter(obj => obj.text.trim() !== '').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const jourElements = document.querySelectorAll('.jour-objectifs');
    jourElements.forEach(jourElement => {
      const titre = jourElement.querySelector('h3 .date');
      if (titre && storageKey.includes(titre.textContent.replace(/\//g, '_'))) {
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
  
  function updateAllDailyProgress() {
    const weekDates = getWeekDates();
    weekDates.forEach(dayInfo => {
      const storageKey = `objectifs_${dayInfo.date.replace(/\//g, '_')}`;
      updateDailyProgress(storageKey);
    });
  }
  
  function updateWeeklyProgress() {
    const weekDates = getWeekDates();
    let totalCompleted = 0;
    let totalObjectives = 0;
    
    weekDates.forEach(dayInfo => {
      const storageKey = `objectifs_${dayInfo.date.replace(/\//g, '_')}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const objectives = JSON.parse(saved);
        const completed = objectives.filter(obj => obj.completed && obj.text.trim() !== '').length;
        const total = objectives.filter(obj => obj.text.trim() !== '').length;
        totalCompleted += completed;
        totalObjectives += total;
      }
    });
    
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
  
  function updateAllProgress() {
    updateAllDailyProgress();
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
  function initializeFinance() {
    console.log("💰 Initialisation Finance");
    
    document.getElementById("depenses").value = localStorage.getItem("depenses") || "";
    document.getElementById("investissements").value = localStorage.getItem("investissements") || "";
    document.getElementById("patrimoine").value = localStorage.getItem("patrimoine") || "";
    
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
        </div>
      `;
      
      const patrimoineSection = document.querySelector('section:nth-child(3)');
      patrimoineSection.parentNode.insertBefore(statsSection, patrimoineSection.nextSibling);
    }
  }
  
  function updateFinanceStats() {
    const depenses = localStorage.getItem("depenses") || "";
    const investissements = localStorage.getItem("investissements") || "";
    
    const depensesCount = depenses.split('\n').filter(line => line.trim().length > 0).length;
    const investissementsCount = investissements.split('\n').filter(line => line.trim().length > 0).length;
    
    if (document.getElementById('depenses-count')) {
      document.getElementById('depenses-count').textContent = depensesCount;
      document.getElementById('investissements-count').textContent = investissementsCount;
    }
  }
  
  // === Fonctions de sauvegarde ===
  function saveWeek() {
    showNotification('Données sauvegardées !', 'success');
  }
  
  function saveFinance() {
    const depenses = document.getElementById("depenses")?.value || "";
    const investissements = document.getElementById("investissements")?.value || "";
    const patrimoine = document.getElementById("patrimoine")?.value || "";
    
    localStorage.setItem("depenses", depenses);
    localStorage.setItem("investissements", investissements);
    localStorage.setItem("patrimoine", patrimoine);
    
    updateFinanceStats();
    showNotification('Données financières sauvegardées !', 'success');
  }
  
  // === Utilitaires ===
  function showNotification(message, type) {
    // Supprimer les notifications existantes
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
  
  function clearWeek() {
    if (confirm('Voulez-vous vraiment effacer toutes les données de cette semaine ?')) {
      // Planning
      const planningInputs = document.querySelectorAll('#planning-body input');
      planningInputs.forEach(input => input.value = '');
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('planning_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Objectifs
      const weekDates = getWeekDates();
      weekDates.forEach(dayInfo => {
        const storageKey = `objectifs_${dayInfo.date.replace(/\//g, '_')}`;
        localStorage.removeItem(storageKey);
      });
      
      showNotification('Données de la semaine effacées !', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  }
  
  function exportData() {
    const allData = {
      planning: getAllPlanningData(),
      objectives: getAllObjectivesData(),
      finance: getAllFinanceData(),
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
        data[key] = localStorage.getItem(key);
      }
    });
    return data;
  }
  
  function getAllObjectivesData() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('objectifs_')) {
        data[key] = localStorage.getItem(key);
      }
    });
    return data;
  }
  
  function getAllFinanceData() {
    return {
      depenses: localStorage.getItem("depenses"),
      investissements: localStorage.getItem("investissements"),
      patrimoine: localStorage.getItem("patrimoine")
    };
  }
  
  // === Fonctions PDF (simplifiées) ===
  function downloadWeekPDF() {
    showNotification('Fonction PDF en développement', 'success');
  }
  
  function downloadFinancePDF() {
    showNotification('Fonction PDF en développement', 'success');
  }
  
  // === Fonctions pour autres pages (simplifiées) ===
  function initializeObjectives() {
    console.log("🎯 Initialisation Objectifs Long Terme");
    // Implémentation simplifiée
  }
  
  function initializeHabits() {
    console.log("📊 Initialisation Habitudes");
    // Implémentation simplifiée
  }
  
  function initializeProjects() {
    console.log("🚀 Initialisation Projets");
    // Implémentation simplifiée
  }
  
  function showStats() {
    showNotification('Statistiques en développement', 'success');
  }

  // === Finance - Avec Revenu Mensuel ===
function initializeFinance() {
    console.log("💰 Initialisation Finance");
    
    document.getElementById("depenses").value = localStorage.getItem("depenses") || "";
    document.getElementById("investissements").value = localStorage.getItem("investissements") || "";
    document.getElementById("patrimoine").value = localStorage.getItem("patrimoine") || "";
    document.getElementById("revenus").value = localStorage.getItem("revenus") || "";
    
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
    }
  }
  
  function updateFinanceStats() {
    const depenses = localStorage.getItem("depenses") || "";
    const investissements = localStorage.getItem("investissements") || "";
    const revenus = localStorage.getItem("revenus") || "";
    
    // Compter les lignes
    const depensesCount = depenses.split('\n').filter(line => line.trim().length > 0).length;
    const investissementsCount = investissements.split('\n').filter(line => line.trim().length > 0).length;
    const revenusCount = revenus.split('\n').filter(line => line.trim().length > 0).length;
    
    // Calculer le solde (simplifié)
    const solde = calculerSoldeMensuel();
    
    if (document.getElementById('depenses-count')) {
      document.getElementById('depenses-count').textContent = depensesCount;
      document.getElementById('investissements-count').textContent = investissementsCount;
      document.getElementById('revenus-count').textContent = revenusCount;
      document.getElementById('solde-mensuel').textContent = solde + '€';
      
      // Colorer le solde
      const soldeElement = document.getElementById('solde-mensuel');
      if (solde >= 0) {
        soldeElement.style.color = 'var(--success)';
      } else {
        soldeElement.style.color = 'var(--danger)';
      }
    }
  }
  
  function calculerSoldeMensuel() {
    const revenusText = localStorage.getItem("revenus") || "";
    const depensesText = localStorage.getItem("depenses") || "";
    
    // Extraction des montants (simplifié)
    let totalRevenus = 0;
    let totalDepenses = 0;
    
    // Extraire les nombres des revenus
    const revenusLines = revenusText.split('\n');
    revenusLines.forEach(line => {
      const montant = extraireMontant(line);
      if (montant > 0) totalRevenus += montant;
    });
    
    // Extraire les nombres des dépenses
    const depensesLines = depensesText.split('\n');
    depensesLines.forEach(line => {
      const montant = extraireMontant(line);
      if (montant > 0) totalDepenses += montant;
    });
    
    return totalRevenus - totalDepenses;
  }
  
  function extraireMontant(text) {
    // Extraire les nombres du texte (format simple)
    const matches = text.match(/(\d+([.,]\d+)?)/g);
    if (matches && matches.length > 0) {
      return parseFloat(matches[0].replace(',', '.'));
    }
    return 0;
  }
  
  function saveFinance() {
    const depenses = document.getElementById("depenses")?.value || "";
    const investissements = document.getElementById("investissements")?.value || "";
    const patrimoine = document.getElementById("patrimoine")?.value || "";
    const revenus = document.getElementById("revenus")?.value || "";
    
    localStorage.setItem("depenses", depenses);
    localStorage.setItem("investissements", investissements);
    localStorage.setItem("patrimoine", patrimoine);
    localStorage.setItem("revenus", revenus);
    
    updateFinanceStats();
    showNotification('Données financières sauvegardées !', 'success');
  }
  
  // === PDF Finance avec Revenus ===
  function downloadFinancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const mois = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
    // En-tête
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT FINANCIER', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`${mois} - Généré le ${now.toLocaleDateString('fr-FR')}`, pageWidth / 2, 22, { align: 'center' });
  
    let yPosition = 40;
  
    // Section Revenus
    doc.setFillColor(34, 197, 94);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUS MENSUELS', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const revenus = localStorage.getItem("revenus") || "Aucun revenu saisi";
    const revenusLines = doc.splitTextToSize(revenus, pageWidth - 30);
    doc.text(revenusLines, 15, yPosition);
    yPosition += revenusLines.length * 5 + 15;
  
    // Section Dépenses
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
  
    doc.setFillColor(239, 68, 68);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉPENSES', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const depenses = localStorage.getItem("depenses") || "Aucune dépense saisie";
    const depensesLines = doc.splitTextToSize(depenses, pageWidth - 30);
    doc.text(depensesLines, 15, yPosition);
    yPosition += depensesLines.length * 5 + 15;
  
    // Section Investissements
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
  
    doc.setFillColor(59, 130, 246);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVESTISSEMENTS', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const investissements = localStorage.getItem("investissements") || "Aucun investissement saisi";
    const investissementsLines = doc.splitTextToSize(investissements, pageWidth - 30);
    doc.text(investissementsLines, 15, yPosition);
    yPosition += investissementsLines.length * 5 + 15;
  
    // Section Patrimoine
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
  
    doc.setFillColor(245, 158, 11);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATRIMOINE NET', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const patrimoine = localStorage.getItem("patrimoine") || "Aucune donnée saisie";
    const patrimoineLines = doc.splitTextToSize(patrimoine, pageWidth - 30);
    doc.text(patrimoineLines, 15, yPosition);
  
    // Section Résumé Financier (Nouvelle page)
    doc.addPage();
    yPosition = 20;
  
    doc.setFillColor(99, 102, 241);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ FINANCIER', 15, yPosition + 2);
  
    yPosition += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    // Calculs du résumé
    const solde = calculerSoldeMensuel();
    const totalRevenus = calculerTotalRevenus();
    const totalDepenses = calculerTotalDepenses();
  
    doc.setFont('helvetica', 'bold');
    doc.text('Bilan Mensuel:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    
    yPosition += 8;
    doc.text(`Total Revenus: ${totalRevenus}€`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Dépenses: ${totalDepenses}€`, 20, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'bold');
    if (solde >= 0) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(`Solde Mensuel: ${solde}€`, 20, yPosition);
    
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Recommandation
    if (solde > 0) {
      doc.text('✅ Excellent ! Votre budget est excédentaire.', 15, yPosition);
      yPosition += 6;
      doc.text(`Vous pouvez investir ${solde}€ ce mois-ci.`, 15, yPosition);
    } else if (solde < 0) {
      doc.text('⚠️ Attention ! Votre budget est déficitaire.', 15, yPosition);
      yPosition += 6;
      doc.text(`Réduisez vos dépenses de ${Math.abs(solde)}€.`, 15, yPosition);
    } else {
      doc.text('⚖️ Budget équilibré.', 15, yPosition);
      yPosition += 6;
      doc.text('Vos revenus couvrent exactement vos dépenses.', 15, yPosition);
    }
  
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
    }
  
    const fileName = `finance_${getFormattedDate()}.pdf`;
    doc.save(fileName);
    showNotification('Rapport financier PDF généré avec succès !', 'success');
  }
  
  function calculerTotalRevenus() {
    const revenusText = localStorage.getItem("revenus") || "";
    let total = 0;
    
    const revenusLines = revenusText.split('\n');
    revenusLines.forEach(line => {
      const montant = extraireMontant(line);
      if (montant > 0) total += montant;
    });
    
    return total;
  }
  
  function calculerTotalDepenses() {
    const depensesText = localStorage.getItem("depenses") || "";
    let total = 0;
    
    const depensesLines = depensesText.split('\n');
    depensesLines.forEach(line => {
      const montant = extraireMontant(line);
      if (montant > 0) total += montant;
    });
    
    return total;
  }
  
  function getAllFinanceData() {
    return {
      depenses: localStorage.getItem("depenses"),
      investissements: localStorage.getItem("investissements"),
      patrimoine: localStorage.getItem("patrimoine"),
      revenus: localStorage.getItem("revenus")
    };
  }

  // === Finance - Patrimoine Total ===
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
      
      // Ajouter la section Patrimoine Total à la fin
      addPatrimoineTotalSection();
    }
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
    main.insertBefore(createElementFromHTML(patrimoineTotalHTML), actionsSection);
  }
  
  function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }
  
  function updateFinanceStats() {
    const depenses = localStorage.getItem("depenses") || "";
    const investissements = localStorage.getItem("investissements") || "";
    const revenus = localStorage.getItem("revenus") || "";
    const patrimoine = localStorage.getItem("patrimoine") || "";
    
    // Compter les lignes
    const depensesCount = depenses.split('\n').filter(line => line.trim().length > 0).length;
    const investissementsCount = investissements.split('\n').filter(line => line.trim().length > 0).length;
    const revenusCount = revenus.split('\n').filter(line => line.trim().length > 0).length;
    
    // Calculer le solde
    const solde = calculerSoldeMensuel();
    
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
      epargneElement.textContent = formatMoney(epargne);
      investissementsElement.textContent = formatMoney(investissements);
      immobilierElement.textContent = formatMoney(immobilier);
      autresElement.textContent = formatMoney(autres);
      
      // Calculer l'évolution (simulée pour l'exemple)
      const evolution = calculerEvolutionPatrimoine(total);
      evolutionElement.textContent = evolution >= 0 ? `+${evolution}%` : `${evolution}%`;
      evolutionElement.style.color = evolution >= 0 ? 'var(--success)' : 'var(--danger)';
      
      // Animation pour les grands nombres
      if (total > 0) {
        patrimoineTotalElement.classList.add('pulse-animation');
        setTimeout(() => {
          patrimoineTotalElement.classList.remove('pulse-animation');
        }, 1000);
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
        
        // Catégoriser automatiquement selon les mots-clés
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
    // Pour l'exemple, on simule une évolution
    // En réalité, il faudrait stocker l'historique
    const historique = JSON.parse(localStorage.getItem('patrimoine_historique') || '[]');
    
    if (historique.length === 0) {
      // Premier enregistrement
      historique.push({
        date: new Date().toISOString(),
        total: totalActuel
      });
      localStorage.setItem('patrimoine_historique', JSON.stringify(historique));
      return 0;
    }
    
    const dernierTotal = historique[historique.length - 1].total;
    
    if (dernierTotal === 0) return 0;
    
    const evolution = ((totalActuel - dernierTotal) / dernierTotal) * 100;
    
    // Mettre à jour l'historique (garder les 12 derniers mois)
    historique.push({
      date: new Date().toISOString(),
      total: totalActuel
    });
    
    if (historique.length > 12) {
      historique.shift();
    }
    
    localStorage.setItem('patrimoine_historique', JSON.stringify(historique));
    
    return Math.round(evolution * 100) / 100; // Arrondir à 2 décimales
  }
  
  function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // === PDF enrichi avec Patrimoine Total ===
  function downloadFinancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const mois = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
    // En-tête
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT FINANCIER COMPLET', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`${mois} - Généré le ${now.toLocaleDateString('fr-FR')}`, pageWidth / 2, 22, { align: 'center' });
  
    let yPosition = 40;
  
    // Section Revenus
    doc.setFillColor(34, 197, 94);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REVENUS MENSUELS', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const revenus = localStorage.getItem("revenus") || "Aucun revenu saisi";
    const revenusLines = doc.splitTextToSize(revenus, pageWidth - 30);
    doc.text(revenusLines, 15, yPosition);
    yPosition += revenusLines.length * 5 + 15;
  
    // Section Dépenses
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
  
    doc.setFillColor(239, 68, 68);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉPENSES', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const depenses = localStorage.getItem("depenses") || "Aucune dépense saisie";
    const depensesLines = doc.splitTextToSize(depenses, pageWidth - 30);
    doc.text(depensesLines, 15, yPosition);
    yPosition += depensesLines.length * 5 + 15;
  
    // Section Investissements
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
  
    doc.setFillColor(59, 130, 246);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVESTISSEMENTS', 15, yPosition + 2);
  
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    const investissements = localStorage.getItem("investissements") || "Aucun investissement saisi";
    const investissementsLines = doc.splitTextToSize(investissements, pageWidth - 30);
    doc.text(investissementsLines, 15, yPosition);
    yPosition += investissementsLines.length * 5 + 15;
  
    // NOUVELLE SECTION : PATRIMOINE TOTAL
    doc.addPage();
    yPosition = 20;
  
    doc.setFillColor(168, 85, 247);
    doc.rect(0, yPosition - 5, pageWidth, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PATRIMOINE TOTAL', pageWidth / 2, yPosition + 2, { align: 'center' });
  
    yPosition += 25;
    doc.setTextColor(0, 0, 0);
    
    // Affichage du patrimoine total en gros
    const patrimoineText = localStorage.getItem("patrimoine") || "";
    const { total, epargne, investissements: inv, immobilier, autres } = analyserPatrimoine(patrimoineText);
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('VOTRE PATRIMOINE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(32);
    doc.text(formatMoney(total), pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 25;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Répartition de votre patrimoine', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Détail du patrimoine
    const details = [
      { label: 'Épargne & Comptes', valeur: epargne, color: [59, 130, 246] },
      { label: 'Investissements', valeur: inv, color: [139, 92, 246] },
      { label: 'Immobilier', valeur: immobilier, color: [245, 158, 11] },
      { label: 'Autres actifs', valeur: autres, color: [156, 163, 175] }
    ];
    
    details.forEach((detail, index) => {
      if (detail.valeur > 0) {
        const pourcentage = total > 0 ? Math.round((detail.valeur / total) * 100) : 0;
        
        doc.setFillColor(...detail.color);
        doc.rect(20, yPosition - 3, 8, 8, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.text(`${detail.label}:`, 35, yPosition + 2);
        
        doc.setFont('helvetica', 'bold');
        doc.text(formatMoney(detail.valeur), pageWidth - 50, yPosition + 2);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`(${pourcentage}%)`, pageWidth - 20, yPosition + 2, { align: 'right' });
        
        yPosition += 10;
      }
    });
  
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
    }
  
    const fileName = `finance_${getFormattedDate()}.pdf`;
    doc.save(fileName);
    showNotification('Rapport financier complet généré !', 'success');
  }

  // === NUTRITION ===

    // Base de données des activités sportives avec MET (Metabolic Equivalent of Task)
// Base de données sportive complète (fusionnée)
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

// Initialiser les sports au chargement de la page nutrition
function initializeNutrition() {
    console.log("🍽️ Initialisation Nutrition");
    
    // Charger le profil
    loadProfile();
    
    // Charger les aliments du jour
    loadDailyFoods();
    
    // Initialiser les sélecteurs de sports IMMÉDIATEMENT
    if (document.getElementById('sport-category')) {
      console.log("🎯 Initialisation des sélecteurs de sports");
      updateSportActivities(); // Appel immédiat
      
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
  function calculateGoals() {
    const age = parseInt(document.getElementById('age').value) || 25;
    const weight = parseInt(document.getElementById('weight').value) || 70;
    const height = parseInt(document.getElementById('height').value) || 175;
    const goal = document.getElementById('goal').value;
    const activity = parseFloat(document.getElementById('activity').value) || 1.375;
    
    // Calcul du métabolisme de base (Mifflin-St Jeor)
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
    
    // Calcul des macros (ratio pour prise de muscle)
    const protein = Math.round(weight * 2.2); // 2.2g/kg de poids de corps
    const fat = Math.round((targetCalories * 0.25) / 9); // 25% des calories
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    
    // Sauvegarder les objectifs
    const goals = {
      calories: targetCalories,
      protein: protein,
      carbs: carbs,
      fat: fat
    };
    
    localStorage.setItem('nutritionGoals', JSON.stringify(goals));
    localStorage.setItem('userProfile', JSON.stringify({ age, weight, height, goal, activity }));
    
    // Afficher les objectifs
    document.getElementById('calorie-goal').textContent = targetCalories;
    document.getElementById('protein-goal').textContent = protein;
    document.getElementById('carbs-goal').textContent = carbs;
    document.getElementById('fat-goal').textContent = fat;
    
    showNotification('Objectifs calculés avec succès !', 'success');
    updateNutritionSummary();
  }
  
  function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    const savedGoals = localStorage.getItem('nutritionGoals');
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      document.getElementById('age').value = profile.age;
      document.getElementById('weight').value = profile.weight;
      document.getElementById('height').value = profile.height;
      document.getElementById('goal').value = profile.goal;
      document.getElementById('activity').value = profile.activity;
    }
    
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      document.getElementById('calorie-goal').textContent = goals.calories;
      document.getElementById('protein-goal').textContent = goals.protein;
      document.getElementById('carbs-goal').textContent = goals.carbs;
      document.getElementById('fat-goal').textContent = goals.fat;
    }
  }
  
  // Recherche d'aliments (simulation avec base locale)
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
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      resultsDiv.innerHTML = '<div class="error">Erreur de recherche. Utilisation base locale.</div>';
      // Fallback vers base locale
      searchFoodLocal(query);
    }
  }
  
  // Fonction fallback locale

  
  function selectFoodFromAPI(name, calories, protein, carbs, fat, imageUrl) {
    localStorage.setItem('selectedFood', JSON.stringify({
      name, calories, protein, carbs, fat, quantity: 100, imageUrl
    }));
    
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('food-search').value = '';
    
    showNotification(`Aliment "${name}" sélectionné. Choisissez un repas.`, 'success');
  }
    
    const results = foodDatabase.filter(food => 
      food.name.toLowerCase().includes(query)
    );
    
  function selectFood(name, calories, protein, carbs, fat) {
    // Stocker l'aliment sélectionné temporairement
    localStorage.setItem('selectedFood', JSON.stringify({
      name, calories, protein, carbs, fat, quantity: 100
    }));
    
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('food-search').value = '';
    
    showNotification(`Aliment "${name}" sélectionné. Choisissez un repas.`, 'success');
  }
  
  function addFoodToMeal(mealType) {
    const selectedFood = localStorage.getItem('selectedFood');
    
    if (!selectedFood) {
      showNotification('Veuillez d\'abord rechercher et sélectionner un aliment', 'danger');
      return;
    }
    
    const food = JSON.parse(selectedFood);
    
    // Ajouter à la base de données du repas
    const today = new Date().toDateString();
    const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
    
    if (!mealData[mealType]) {
      mealData[mealType] = [];
    }
    
    mealData[mealType].push(food);
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(mealData));
    
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
  
  function loadDailyFoods() {
    const today = new Date().toDateString();
    const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
    
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
  
  function removeFood(mealType, index) {
    const today = new Date().toDateString();
    const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
    
    if (mealData[mealType]) {
      mealData[mealType].splice(index, 1);
      localStorage.setItem(`nutrition_${today}`, JSON.stringify(mealData));
      loadDailyFoods();
      updateNutritionSummary();
    }
  }
  
  function addSportActivity() {
    const sportType = document.getElementById('sport-type').value;
    const duration = parseInt(document.getElementById('sport-duration').value);
    const calories = parseInt(document.getElementById('sport-calories').value);
    
    if (!sportType || !duration || !calories) {
      showNotification('Veuillez sélectionner une activité et une durée', 'danger');
      return;
    }
    
    // Vérifier que l'activité existe
    if (!sportDatabase[sportType]) {
      showNotification('Activité non valide', 'danger');
      return;
    }
    
    const today = new Date().toDateString();
    const activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    
    activities.push({
      type: sportType,
      name: sportDatabase[sportType].name,
      duration,
      calories,
      met: sportDatabase[sportType].met,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(`sport_${today}`, JSON.stringify(activities));
    
    // Réinitialiser les champs
    document.getElementById('sport-type').value = '';
    document.getElementById('sport-duration').value = '';
    document.getElementById('sport-calories').value = '';
    
    loadSportActivities();
    updateNutritionSummary();
    showNotification('Activité sportive ajoutée !', 'success');
  }
  
  function loadSportActivities() {
    const today = new Date().toDateString();
    const activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
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
  
  function removeSportActivity(timestamp) {
    const today = new Date().toDateString();
    let activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    
    activities = activities.filter(activity => activity.timestamp !== timestamp);
    localStorage.setItem(`sport_${today}`, JSON.stringify(activities));
    
    loadSportActivities();
    updateNutritionSummary();
  }
  
  function updateNutritionSummary() {
    const today = new Date().toDateString();
    const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
    const activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    const goals = JSON.parse(localStorage.getItem('nutritionGoals') || '{}');
    
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
    
    // Calculer la balance calorique (avec ajustement sport)
    const netCalories = totalCalories - caloriesBurned;
    const calorieGoal = goals.calories || 2000;
    const calorieBalance = netCalories - calorieGoal;
    
    // Mettre à jour l'interface
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
  
  function updateProgressBar(elementId, current, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    element.style.width = percentage + '%';
    
    // Changer la couleur selon le pourcentage
    if (percentage >= 100) {
      element.style.background = 'var(--success)';
    } else if (percentage >= 75) {
      element.style.background = 'var(--warning)';
    } else {
      element.style.background = 'var(--accent)';
    }
  }
  
  function saveNutrition() {
    showNotification('Données nutritionnelles sauvegardées !', 'success');
  }
  
  function clearDay() {
    if (confirm('Voulez-vous vraiment effacer toutes les données nutritionnelles de aujourd\'hui ?')) {
      const today = new Date().toDateString();
      localStorage.removeItem(`nutrition_${today}`);
      localStorage.removeItem(`sport_${today}`);
      loadDailyFoods();
      loadSportActivities();
      updateNutritionSummary();
      showNotification('Journée nutritionnelle effacée !', 'success');
    }
  }
  
  function downloadNutritionPDF() {
    showNotification('Fonction PDF nutrition en développement', 'success');
  }
  
  // N'oubliez pas d'ajouter l'initialisation dans initializePage()
  function initializePage() {
    console.log("🚀 Initialisation de la page...");
  
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
    
    // Autres pages
    if (document.getElementById("long-term-objectives")) initializeObjectives();
    if (document.getElementById("habits-container")) initializeHabits();
    if (document.getElementById("projects-container")) initializeProjects();
  }


  // Mettre à jour les activités selon la catégorie (version corrigée)
function updateSportActivities() {
    const category = document.getElementById('sport-category').value;
    const sportTypeSelect = document.getElementById('sport-type');
    
    sportTypeSelect.innerHTML = '<option value="">Choisir une activité</option>';
    
    // Utiliser un Set pour éviter les doublons
    const addedActivities = new Set();
    
    Object.entries(sportDatabase).forEach(([key, sport]) => {
      if (category === 'all' || sport.category === category) {
        // Vérifier si cette activité n'a pas déjà été ajoutée
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
    
    // Réinitialiser le calcul
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
    
    // Récupérer le profil utilisateur
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const weight = profile.weight || 70; // Poids par défaut 70kg
    
    // Vérifier que l'activité existe dans la base
    if (!sportDatabase[sportType]) {
      caloriesInput.value = '';
      showNotification('Activité non trouvée', 'danger');
      return;
    }
    
    const met = sportDatabase[sportType].met;
    const durationInHours = duration / 60;
    
    // Calcul des calories brûlées : MET * poids (kg) * durée (heures)
    let caloriesBurned = Math.round(met * weight * durationInHours);
    
    // Ajustement léger selon l'âge (métabolisme diminue avec l'âge)
    const age = profile.age || 25;
    if (age > 40) {
      caloriesBurned = Math.round(caloriesBurned * 0.95);
    } else if (age > 50) {
      caloriesBurned = Math.round(caloriesBurned * 0.90);
    }
    
    caloriesInput.value = caloriesBurned;
  
    // Afficher des informations supplémentaires
    showSportInfo(sportType, duration, caloriesBurned);
  }
  
  function showSportInfo(sportType, duration, calories) {
    // Vous pouvez ajouter ici un élément pour afficher des informations
    // comme l'équivalence en nourriture, etc.
    console.log(`${sportDatabase[sportType].name}: ${duration}min = ${calories} kcal brûlées`);
  }
  
  // Fonction pour obtenir l'intensité d'une activité
  function getSportIntensity(met) {
    if (met >= 8) return 'high';
    if (met >= 5) return 'medium';
    return 'low';
  }
  
  // Mettre à jour le calcul quand l'activité change
  document.addEventListener('DOMContentLoaded', function() {
    const sportTypeSelect = document.getElementById('sport-type');
    const durationInput = document.getElementById('sport-duration');
    
    if (sportTypeSelect) {
      sportTypeSelect.addEventListener('change', calculateCaloriesBurned);
    }
    if (durationInput) {
      durationInput.addEventListener('input', calculateCaloriesBurned);
    }
  });
  
  function addSportActivity() {
    const sportType = document.getElementById('sport-type').value;
    const duration = parseInt(document.getElementById('sport-duration').value);
    const calories = parseInt(document.getElementById('sport-calories').value);
    
    if (!sportType || !duration || !calories) {
      showNotification('Veuillez sélectionner une activité et une durée', 'danger');
      return;
    }
    
    const today = new Date().toDateString();
    const activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    
    activities.push({
      type: sportType,
      name: sportDatabase[sportType].name,
      duration,
      calories,
      met: sportDatabase[sportType].met,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(`sport_${today}`, JSON.stringify(activities));
    
    // Réinitialiser les champs
    document.getElementById('sport-type').value = '';
    document.getElementById('sport-duration').value = '';
    document.getElementById('sport-calories').value = '';
    
    loadSportActivities();
    updateNutritionSummary();
    showNotification('Activité sportive ajoutée !', 'success');
  }
  
  function loadSportActivities() {
    const today = new Date().toDateString();
    const activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    const container = document.getElementById('sport-activities');
    
    // Calculer le total des calories brûlées
    const totalCalories = activities.reduce((sum, activity) => sum + activity.calories, 0);
    
    container.innerHTML = `
      <div class="sport-header">
        <h4>Activités du jour</h4>
        <span class="total-calories">Total brûlé: ${totalCalories} kcal</span>
      </div>
      ${activities.map((activity, index) => `
        <div class="sport-activity">
          <div class="sport-info">
            <strong>${activity.name}</strong>
            <div class="sport-details">
              <span>${activity.duration} min</span>
              <span class="calories-burned">${activity.calories} kcal</span>
              <span class="met-value">MET: ${activity.met}</span>
            </div>
          </div>
          <button class="remove-food" onclick="removeSportActivity('${activity.timestamp}')">✕</button>
        </div>
      `).join('')}
      
      ${activities.length === 0 ? `
        <div class="no-activities">
          <p>Aucune activité enregistrée aujourd'hui</p>
        </div>
      ` : ''}
    `;
  }
  
  function removeSportActivity(timestamp) {
    const today = new Date().toDateString();
    let activities = JSON.parse(localStorage.getItem(`sport_${today}`) || '[]');
    
    activities = activities.filter(activity => activity.timestamp !== timestamp);
    localStorage.setItem(`sport_${today}`, JSON.stringify(activities));
    
    loadSportActivities();
    updateNutritionSummary();
    showNotification('Activité supprimée', 'success');
  }

  // Configuration Nutritionix (inscrivez-vous sur https://developer.nutritionix.com/)
const NUTRITIONIX_CONFIG = {
    appId: 'votre_app_id', // À obtenir sur nutritionix.com
    appKey: 'votre_app_key', // À obtenir sur nutritionix.com
    baseURL: 'https://trackapi.nutritionix.com/v2/'
  };
  
  // Fonction de recherche améliorée avec Nutritionix
  async function searchFoodAdvanced() {
    const query = document.getElementById('food-search').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) {
      resultsDiv.innerHTML = '';
      return;
    }
    
    resultsDiv.innerHTML = '<div class="loading">🔍 Recherche en cours...</div>';
    
    try {
      // Essayer d'abord Nutritionix (plus précis)
      if (NUTRITIONIX_CONFIG.appId && NUTRITIONIX_CONFIG.appKey) {
        const response = await fetch(`${NUTRITIONIX_CONFIG.baseURL}natural/nutrients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': NUTRITIONIX_CONFIG.appId,
            'x-app-key': NUTRITIONIX_CONFIG.appKey
          },
          body: JSON.stringify({
            query: query,
            timezone: 'Europe/Paris'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.foods && data.foods.length > 0) {
            displayNutritionixResults(data.foods);
            return;
          }
        }
      }
      
      // Fallback vers Open Food Facts
      await searchFoodOpenFoodFacts(query);
      
    } catch (error) {
      console.error('Erreur recherche avancée:', error);
      // Fallback vers base locale
      searchFoodLocal(query);
    }
  }
  
  function displayNutritionixResults(foods) {
    const resultsDiv = document.getElementById('search-results');
    
    resultsDiv.innerHTML = foods.map(food => `
      <div class="food-result" onclick="selectFoodFromNutritionix(
        '${food.food_name.replace(/'/g, "\\'")}',
        ${food.nf_calories},
        ${food.nf_protein},
        ${food.nf_total_carbohydrate},
        ${food.nf_total_fat},
        ${food.serving_weight_grams},
        '${food.photo?.thumb || ''}'
      )">
        <div class="food-result-content">
          ${food.photo?.thumb ? `
            <img src="${food.photo.thumb}" alt="${food.food_name}" class="food-image">
          ` : ''}
          <div class="food-info">
            <strong>${food.food_name}</strong>
            <div class="food-brand">${food.brand_name || ''} - ${food.serving_qty} ${food.serving_unit} (${food.serving_weight_grams}g)</div>
            <div class="food-macros">
              ${Math.round(food.nf_calories)} kcal - P:${Math.round(food.nf_protein)}g C:${Math.round(food.nf_total_carbohydrate)}g L:${Math.round(food.nf_total_fat)}g
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  async function searchFoodOpenFoodFacts(query) {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`);
    const data = await response.json();
    
    const resultsDiv = document.getElementById('search-results');
    
    if (data.products && data.products.length > 0) {
      resultsDiv.innerHTML = data.products
        .filter(product => product.product_name && product.nutriments)
        .slice(0, 10)
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
                    ${Math.round(calories)} kcal - P:${Math.round(protein)}g C:${Math.round(carbs)}g L:${Math.round(fat)}g
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    } else {
      resultsDiv.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
    }
  }

  // Base de données sportive étendue
const extendedSportDatabase = {
    // Cardio
    'course_5kmh': { name: 'Marche rapide (5 km/h)', met: 4.0, category: 'cardio' },
    'course_8kmh': { name: 'Course légère (8 km/h)', met: 8.0, category: 'cardio' },
    'course_10kmh': { name: 'Course modérée (10 km/h)', met: 9.8, category: 'cardio' },
    'course_12kmh': { name: 'Course intense (12 km/h)', met: 11.5, category: 'cardio' },
    'course_14kmh': { name: 'Course très intense (14 km/h)', met: 13.5, category: 'cardio' },
    
    // Vélo
    'velo_10kmh': { name: 'Vélo très léger (10 km/h)', met: 4.0, category: 'velo' },
    'velo_16kmh': { name: 'Vélo léger (16 km/h)', met: 6.0, category: 'velo' },
    'velo_20kmh': { name: 'Vélo modéré (20 km/h)', met: 8.0, category: 'velo' },
    'velo_25kmh': { name: 'Vélo intense (25 km/h)', met: 10.0, category: 'velo' },
    'velo_30kmh': { name: 'Vélo très intense (30 km/h)', met: 12.0, category: 'velo' },
    
    // Natation
    'natation_lente': { name: 'Natation lente', met: 5.0, category: 'natation' },
    'natation_moderee': { name: 'Natation modérée', met: 7.0, category: 'natation' },
    'natation_intense': { name: 'Natation intense', met: 9.0, category: 'natation' },
    'natation_crawl': { name: 'Crawl rapide', met: 10.0, category: 'natation' },
    'natation_brasse': { name: 'Brasse', met: 6.5, category: 'natation' },
    
    // Musculation
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
  
  // Regrouper par catégorie pour le sélecteur
  const sportCategories = {
    cardio: '🏃‍♂️ Cardio',
    velo: '🚴‍♂️ Vélo',
    natation: '🏊‍♂️ Natation',
    musculation: '💪 Musculation',
    collectif: '⚽ Sports collectifs',
    raquette: '🎾 Sports de raquette',
    danse: '💃 Danse',
    martial: '🥋 Arts martiaux',
    autre: '🎯 Autres sports'
  };

  // === OBJECTIFS LONG TERME ===
function initializeObjectives() {
    console.log("🎯 Initialisation Objectifs Long Terme");
    loadLongTermObjectives();
  }
  
  function loadLongTermObjectives() {
    const container = document.getElementById('long-term-objectives');
    if (!container) return;
    
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    
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
  
  function addLongTermObjective() {
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    objectives.push({
      text: 'Nouvel objectif',
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('longTermObjectives', JSON.stringify(objectives));
    loadLongTermObjectives();
    showNotification('Objectif ajouté !', 'success');
  }
  
  function toggleObjective(index) {
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    objectives[index].completed = !objectives[index].completed;
    localStorage.setItem('longTermObjectives', JSON.stringify(objectives));
    updateObjectivesStats();
  }
  
  function updateObjectiveText(index, text) {
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    objectives[index].text = text;
    localStorage.setItem('longTermObjectives', JSON.stringify(objectives));
  }
  
  function removeObjective(index) {
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    objectives.splice(index, 1);
    localStorage.setItem('longTermObjectives', JSON.stringify(objectives));
    loadLongTermObjectives();
    showNotification('Objectif supprimé', 'success');
  }
  
  function updateObjectivesStats() {
    const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
    const total = objectives.length;
    const completed = objectives.filter(obj => obj.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (document.getElementById('objectifs-total')) {
      document.getElementById('objectifs-total').textContent = total;
      document.getElementById('objectifs-completed').textContent = completed;
      document.getElementById('completion-rate').textContent = rate + '%';
    }
  }
  
  function saveObjectives() {
    showNotification('Objectifs sauvegardés !', 'success');
  }

  // === HABITUDES ===
function initializeHabits() {
    console.log("📊 Initialisation Habitudes");
    loadHabits();
  }
  
  function loadHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    
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
  
  function addHabit() {
    const habitName = prompt('Nom de la nouvelle habitude:');
    if (!habitName) return;
    
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    habits.push({
      name: habitName,
      completed: false,
      streak: 0,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('habits', JSON.stringify(habits));
    loadHabits();
    showNotification('Habitude ajoutée !', 'success');
  }
  
  function toggleHabit(index) {
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    habits[index].completed = !habits[index].completed;
    
    // Mettre à jour la série
    if (habits[index].completed) {
      habits[index].streak = (habits[index].streak || 0) + 1;
    }
    
    localStorage.setItem('habits', JSON.stringify(habits));
    loadHabits();
    updateHabitsStats();
  }
  
  function removeHabit(index) {
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    habits.splice(index, 1);
    localStorage.setItem('habits', JSON.stringify(habits));
    loadHabits();
    showNotification('Habitude supprimée', 'success');
  }
  
  function updateHabitsStats() {
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    const completed = habits.filter(h => h.completed).length;
    const total = habits.length;
    
    if (document.getElementById('current-streak')) {
      const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
      document.getElementById('current-streak').textContent = maxStreak;
    }
  }
  
  function resetHabits() {
    if (confirm('Réinitialiser toutes les habitudes ?')) {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]');
      habits.forEach(habit => {
        habit.completed = false;
      });
      localStorage.setItem('habits', JSON.stringify(habits));
      loadHabits();
      showNotification('Habitudes réinitialisées', 'success');
    }
  }
  
  function saveHabits() {
    showNotification('Habitudes sauvegardées !', 'success');
  }

  // === PROJETS ===
function initializeProjects() {
    console.log("🚀 Initialisation Projets");
    loadProjects();
    loadDeadlines();
  }
  
  function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
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
  
  function addProject() {
    const name = prompt('Nom du projet:');
    if (!name) return;
    
    const description = prompt('Description:');
    const deadline = prompt('Date limite (JJ/MM/AAAA):');
    const priority = prompt('Priorité (low/medium/high):', 'medium');
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects.push({
      name,
      description,
      deadline,
      priority: priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('projects', JSON.stringify(projects));
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
  
  function toggleProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects[index].completed = !projects[index].completed;
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    loadDeadlines();
  }
  
  function removeProject(index) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects.splice(index, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    loadDeadlines();
    showNotification('Projet supprimé', 'success');
  }
  
  function loadDeadlines() {
    const container = document.getElementById('deadlines-container');
    if (!container) return;
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
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
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const total = projects.length;
    const active = projects.filter(p => !p.completed).length;
    const completed = projects.filter(p => p.completed).length;
    
    if (document.getElementById('projects-total')) {
      document.getElementById('projects-total').textContent = total;
      document.getElementById('projects-active').textContent = active;
      document.getElementById('projects-completed').textContent = completed;
    }
  }
  
  function saveProjects() {
    showNotification('Projets sauvegardés !', 'success');
  }

  // === SUIVI HYDRATATION ===
// === SUIVI HYDRATATION AMÉLIORÉ ===
function initializeHydration() {
  console.log("💧 Initialisation suivi hydratation");
  updateHydrationDisplay();
}

function addWaterGlass() {
  const today = new Date().toDateString();
  const waterData = JSON.parse(localStorage.getItem(`water_${today}`) || '{"glasses": 0}');
  
  waterData.glasses = Math.min(8, (waterData.glasses || 0) + 1);
  localStorage.setItem(`water_${today}`, JSON.stringify(waterData));
  
  updateHydrationDisplay();
  updateAllDailyProgress();
  showNotification('💧 Verre d\'eau ajouté !', 'success');
}

function removeWaterGlass() {
  const today = new Date().toDateString();
  const waterData = JSON.parse(localStorage.getItem(`water_${today}`) || '{"glasses": 0}');
  
  waterData.glasses = Math.max(0, (waterData.glasses || 0) - 1);
  localStorage.setItem(`water_${today}`, JSON.stringify(waterData));
  
  updateHydrationDisplay();
  updateAllDailyProgress();
  showNotification('💧 Verre d\'eau retiré', 'success');
}

function updateHydrationDisplay() {
  const today = new Date().toDateString();
  const waterData = JSON.parse(localStorage.getItem(`water_${today}`) || '{"glasses": 0}');
  const glasses = waterData.glasses || 0;
  
  // Mettre à jour la progression
  const progressPercent = (glasses / 8) * 100;
  const progressText = `${glasses}/8 verres`;
  
  if (document.getElementById('hydration-progress')) {
      document.getElementById('hydration-progress').textContent = progressText;
      document.getElementById('hydration-fill').style.width = progressPercent + '%';
      
      // Changer la couleur selon la progression
      const fillElement = document.getElementById('hydration-fill');
      if (progressPercent >= 100) {
          fillElement.style.background = 'var(--success)';
      } else if (progressPercent >= 50) {
          fillElement.style.background = 'var(--warning)';
      } else {
          fillElement.style.background = 'var(--accent)';
      }
  }
  
  // Mettre à jour l'affichage des verres avec design amélioré
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
      
      // Verre avec design réaliste
      glass.innerHTML = `
          <div class="glass-top"></div>
          <div class="glass-body">
              <div class="water-level ${i < glasses ? 'filled' : ''}"></div>
          </div>
          <div class="glass-bottom"></div>
          <div class="glass-number">${i + 1}</div>
      `;
      
      // Ajouter un événement de clic sur le verre
      glass.addEventListener('click', function() {
          if (i < glasses) {
              // Si le verre est plein, le vider
              removeWaterGlass();
          } else if (i === glasses) {
              // Si c'est le prochain verre vide, le remplir
              addWaterGlass();
          }
      });
      
      glassContainer.appendChild(glass);
      container.appendChild(glassContainer);
  }
}

// Modifier updateAllDailyProgress pour inclure l'hydratation
function updateAllDailyProgress() {
  updateAllDailyProgressOriginal(); // L'ancienne fonction
  updateHydrationDisplay();
}

// Renommer l'ancienne fonction
const updateAllDailyProgressOriginal = updateAllDailyProgress;

// === TABLEAU DE BORD ===
function initializeDashboard() {
  console.log("📊 FORÇAGE Initialisation Dashboard");
  
  // Forcer l'affichage même si les données sont vides
  setTimeout(() => {
    loadTodayPlanning();
    loadTodayObjectives();
    loadDashboardHydration();
    loadFinanceSummary();
    loadNutritionSummary();
    loadLongTermSummary();
    loadProjectsSummary();
    loadPatrimoineSummary();
  }, 100);
}

function loadTodayPlanning() {
  const container = document.getElementById('today-planning');
  if (!container) {
    console.error("❌ Container today-planning non trouvé");
    return;
  }
  
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const currentHour = now.getHours();
  
  console.log("📅 Recherche planning pour le jour", currentDay, "(0=Lundi, 6=Dimanche)");
  
  let hasActivities = false;
  let planningHTML = '<div class="planning-items">';
  
  // Vérifier toutes les heures de 6h à 23h
  for (let hour = 6; hour <= 23; hour++) {
    const storageKey = `planning_${hour-6}_${currentDay}`;
    const activity = localStorage.getItem(storageKey);
    
    if (activity && activity.trim() !== '') {
      hasActivities = true;
      const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      const isCurrent = hour === currentHour;
      
      console.log(`✅ Activité trouvée: ${timeSlot} - ${activity}`);
      
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
    console.log("📝 Aucune activité planifiée aujourd'hui");
  } else {
    container.innerHTML = planningHTML;
    console.log("✅ Planning chargé avec succès");
  }
}

function loadTodayPlanning() {
  const container = document.getElementById('today-planning');
  if (!container) return;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi, etc.
  // Convertir en index planning (Lundi=0, Dimanche=6)
  const planningDay = currentDay === 0 ? 6 : currentDay - 1;
  const currentHour = now.getHours();
  
  console.log("📅 Jour actuel:", currentDay, "-> Index planning:", planningDay);
  
  let hasActivities = false;
  let planningHTML = '<div class="planning-items">';
  
  // Parcourir toutes les heures de la journée (6h-23h)
  for (let hour = 6; hour <= 23; hour++) {
    const storageKey = `planning_${hour-6}_${planningDay}`;
    const activity = localStorage.getItem(storageKey);
    
    if (activity && activity.trim() !== '') {
      hasActivities = true;
      const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
      const isCurrent = hour === currentHour;
      const isPast = hour < currentHour;
      
      planningHTML += `
        <div class="planning-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}">
          <span class="planning-time">${timeSlot}</span>
          <span class="planning-activity">${activity}</span>
          ${isCurrent ? '<span class="current-badge">🔴 Maintenant</span>' : ''}
          ${isPast ? '<span class="status-badge past">✅ Passé</span>' : ''}
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

function loadTodayObjectives() {
  const container = document.getElementById('today-objectives');
  if (!container) return;
  
  const today = new Date();
  const todayDate = today.toLocaleDateString('fr-FR');
  const storageKey = `objectifs_${todayDate.replace(/\//g, '_')}`;
  const saved = localStorage.getItem(storageKey);
  
  // Si pas d'objectifs sauvegardés, utiliser les défauts
  const objectives = saved ? JSON.parse(saved) : [
    { text: 'Sport 30min', completed: false },
    { text: 'Lecture 20 pages', completed: false },
    { text: 'Méditation 10min', completed: false }
  ];
  
  const completed = objectives.filter(obj => obj.completed && obj.text.trim() !== '').length;
  const total = objectives.filter(obj => obj.text.trim() !== '').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
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

function loadDashboardHydration() {
  const container = document.getElementById('dashboard-hydration');
  if (!container) return;
  
  const today = new Date().toDateString();
  const waterData = JSON.parse(localStorage.getItem(`water_${today}`) || '{"glasses": 0}');
  const glasses = waterData.glasses || 0;
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

function loadFinanceSummary() {
  const container = document.getElementById('finance-summary');
  if (!container) return;
  
  // Utiliser les fonctions existantes de finance
  const solde = calculerSoldeMensuel ? calculerSoldeMensuel() : 0;
  const totalRevenus = calculerTotalRevenus ? calculerTotalRevenus() : 0;
  const totalDepenses = calculerTotalDepenses ? calculerTotalDepenses() : 0;
  
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

function loadNutritionSummary() {
  const container = document.getElementById('nutrition-summary');
  if (!container) return;
  
  const today = new Date().toDateString();
  const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
  
  let totalCalories = 0;
  Object.values(mealData).forEach(meal => {
    meal.forEach(food => {
      totalCalories += food.calories || 0;
    });
  });
  
  const goals = JSON.parse(localStorage.getItem('nutritionGoals') || '{}');
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
function loadPatrimoineSummary() {
  const container = document.getElementById('patrimoine-summary');
  if (!container) return;
  
  // Récupérer les données réelles du localStorage
  const patrimoineText = localStorage.getItem("patrimoine") || "";
  
  // Analyser le patrimoine
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
        ${autres > 0 ? `
          <div class="patrimoine-item">
            <span class="patrimoine-category">Autres</span>
            <span class="patrimoine-amount">${formatMoney(autres)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Fonctions utilitaires pour le patrimoine
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
// Fonctions utilitaires pour le patrimoine (si elles n'existent pas)
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

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function extraireMontant(text) {
  const matches = text.match(/(\d+([.,]\d+)?)/g);
  if (matches && matches.length > 0) {
    return parseFloat(matches[0].replace(',', '.'));
  }
  return 0;
}

function loadNutritionSummary() {
  const container = document.getElementById('nutrition-summary');
  if (!container) return;
  
  const today = new Date().toDateString();
  const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
  
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
  
  const goals = JSON.parse(localStorage.getItem('nutritionGoals') || '{}');
  const calorieGoal = goals.calories || 2000;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
  
  const hasData = totalCalories > 0;
  
  if (!hasData) {
    container.innerHTML = `
      <div class="no-data-card">
        <div class="no-data-icon">🍽️</div>
        <p>Aucun repas aujourd'hui</p>
        <small>Ajoutez vos repas dans Nutrition</small>
      </div>
    `;
    return;
  }
  
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
      <div class="macros-preview">
        <div class="macro-item">
          <span class="macro-dot protein"></span>
          <span>P: ${Math.round(totalProtein)}g</span>
        </div>
        <div class="macro-item">
          <span class="macro-dot carbs"></span>
          <span>C: ${Math.round(totalCarbs)}g</span>
        </div>
        <div class="macro-item">
          <span class="macro-dot fat"></span>
          <span>L: ${Math.round(totalFat)}g</span>
        </div>
      </div>
    </div>
  `;
}

function loadDashboardHydration() {
  const container = document.getElementById('dashboard-hydration');
  if (!container) return;
  
  const today = new Date().toDateString();
  const waterData = JSON.parse(localStorage.getItem(`water_${today}`) || '{"glasses": 0}');
  const glasses = waterData.glasses || 0;
  const progress = (glasses / 8) * 100;
  
  container.innerHTML = `
    <div class="hydration-display">
      <div class="hydration-circle">
        <span class="hydration-value">${glasses * 250}ml</span>
        <span class="hydration-label">/${2000}ml</span>
      </div>
      <div class="hydration-bars">
        ${Array.from({length: 8}, (_, i) => `
          <div class="hydration-bar ${i < glasses ? 'full' : 'empty'}"></div>
        `).join('')}
      </div>
    </div>
  `;
}

function loadFinanceSummary() {
  const container = document.getElementById('finance-summary');
  if (!container) return;
  
  const solde = calculerSoldeMensuel();
  const totalRevenus = calculerTotalRevenus();
  const totalDepenses = calculerTotalDepenses();
  
  container.innerHTML = `
    <div class="finance-display">
      <div class="finance-balance ${solde >= 0 ? 'positive' : 'negative'}">
        <span class="balance-label">Solde du mois</span>
        <span class="balance-value">${solde}€</span>
      </div>
      <div class="finance-details">
        <div class="finance-item">
          <span>Revenus:</span>
          <span class="positive">${totalRevenus}€</span>
        </div>
        <div class="finance-item">
          <span>Dépenses:</span>
          <span class="negative">${totalDepenses}€</span>
        </div>
      </div>
    </div>
  `;
}

function loadNutritionSummary() {
  const container = document.getElementById('nutrition-summary');
  if (!container) return;
  
  const today = new Date().toDateString();
  const mealData = JSON.parse(localStorage.getItem(`nutrition_${today}`) || '{}');
  
  let totalCalories = 0;
  Object.values(mealData).forEach(meal => {
    meal.forEach(food => {
      totalCalories += food.calories;
    });
  });
  
  const goals = JSON.parse(localStorage.getItem('nutritionGoals') || '{}');
  const calorieGoal = goals.calories || 2000;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
  
  container.innerHTML = `
    <div class="nutrition-display">
      <div class="calories-circle">
        <span class="calories-value">${Math.round(totalCalories)}</span>
        <span class="calories-label">/${calorieGoal} kcal</span>
      </div>
      <div class="calories-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    </div>
  `;
}

function loadLongTermSummary() {
  const container = document.getElementById('longterm-summary');
  if (!container) return;
  
  // Récupérer les vrais objectifs
  const objectives = JSON.parse(localStorage.getItem('longTermObjectives') || '[]');
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

function loadProjectsSummary() {
  const container = document.getElementById('projects-summary');
  if (!container) return;
  
  // Récupérer les vrais projets
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
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

// === NOTES & AGENDA ===
function initializeNotes() {
  console.log("📝 Initialisation Notes & Agenda");
  loadQuickNotes();
  loadEvents();
  showCategory('travail'); // Catégorie par défaut
}

// Notes Rapides
function addQuickNote() {
  const noteText = document.getElementById('quick-note').value.trim();
  if (!noteText) {
    showNotification('Veuillez écrire une note', 'danger');
    return;
  }

  const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
  const newNote = {
    id: Date.now(),
    text: noteText,
    createdAt: new Date().toISOString(),
    category: 'quick'
  };

  notes.unshift(newNote); // Ajouter au début
  localStorage.setItem('quickNotes', JSON.stringify(notes));

  document.getElementById('quick-note').value = '';
  loadQuickNotes();
  showNotification('Note ajoutée !', 'success');
}

function loadQuickNotes() {
  const container = document.getElementById('quick-notes-list');
  if (!container) return;

  const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
  
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

function deleteQuickNote(noteId) {
  const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
  const filteredNotes = notes.filter(note => note.id !== noteId);
  localStorage.setItem('quickNotes', JSON.stringify(filteredNotes));
  loadQuickNotes();
  showNotification('Note supprimée', 'success');
}

// Agenda
function addEvent() {
  const title = document.getElementById('event-title').value.trim();
  const date = document.getElementById('event-date').value;
  const time = document.getElementById('event-time').value;
  const description = document.getElementById('event-description').value.trim();

  if (!title || !date) {
    showNotification('Titre et date requis', 'danger');
    return;
  }

  const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
  const newEvent = {
    id: Date.now(),
    title,
    date,
    time,
    description,
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  // Trier par date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem('agendaEvents', JSON.stringify(events));

  // Réinitialiser le formulaire
  document.getElementById('event-title').value = '';
  document.getElementById('event-date').value = '';
  document.getElementById('event-time').value = '';
  document.getElementById('event-description').value = '';

  loadEvents();
  showNotification('Événement ajouté !', 'success');
}

function loadEvents() {
  const container = document.getElementById('events-list');
  if (!container) return;

  const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
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

function deleteEvent(eventId) {
  const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
  const filteredEvents = events.filter(event => event.id !== eventId);
  localStorage.setItem('agendaEvents', JSON.stringify(filteredEvents));
  loadEvents();
  showNotification('Événement supprimé', 'success');
}

// Notes Catégorisées
let currentCategory = 'travail';

function showCategory(category) {
  currentCategory = category;
  
  // Mettre à jour les boutons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.category-btn[onclick="showCategory('${category}')"]`).classList.add('active');
  
  loadCategoryNotes();
}

function addCategoryNote() {
  const noteText = document.getElementById('category-note').value.trim();
  if (!noteText) {
    showNotification('Veuillez écrire une note', 'danger');
    return;
  }

  const notes = JSON.parse(localStorage.getItem('categoryNotes') || '{}');
  if (!notes[currentCategory]) {
    notes[currentCategory] = [];
  }

  const newNote = {
    id: Date.now(),
    text: noteText,
    createdAt: new Date().toISOString()
  };

  notes[currentCategory].unshift(newNote);
  localStorage.setItem('categoryNotes', JSON.stringify(notes));

  document.getElementById('category-note').value = '';
  loadCategoryNotes();
  showNotification('Note ajoutée !', 'success');
}

function loadCategoryNotes() {
  const container = document.getElementById('category-notes-list');
  if (!container) return;

  const notes = JSON.parse(localStorage.getItem('categoryNotes') || '{}');
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

function deleteCategoryNote(noteId) {
  const notes = JSON.parse(localStorage.getItem('categoryNotes') || '{}');
  if (notes[currentCategory]) {
    notes[currentCategory] = notes[currentCategory].filter(note => note.id !== noteId);
    localStorage.setItem('categoryNotes', JSON.stringify(notes));
    loadCategoryNotes();
    showNotification('Note supprimée', 'success');
  }
}

// Dashboard - Widget Notes
function loadNotesSummary() {
  const container = document.getElementById('notes-summary');
  if (!container) {
      console.error("❌ Container notes-summary non trouvé");
      return;
  }

  const quickNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
  const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
  const today = new Date().toISOString().split('T')[0];
  
  const todayEvents = events.filter(event => event.date === today);
  
  console.log("📊 Dashboard - Notes rapides:", quickNotes.length);
  console.log("📊 Dashboard - Événements aujourd'hui:", todayEvents.length);

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
                      ${event.time ? `<br><small>⏰ ${event.time}</small>` : ''}
                  </div>
              `).join('')}
          </div>
      `;
  }

  if (quickNotes.length > 0) {
      content += `
          <div class="recent-notes">
              <h4>📌 Notes récentes</h4>
              ${quickNotes.slice(0, 3).map(note => `
                  <div class="note-mini" title="${note.text}">${note.text.length > 50 ? note.text.substring(0, 50) + '...' : note.text}</div>
              `).join('')}
          </div>
      `;
  }

  container.innerHTML = content;
}

// Utilitaires
function exportNotes() {
  const quickNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
  const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
  const categoryNotes = JSON.parse(localStorage.getItem('categoryNotes') || '{}');
  
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

function clearAllNotes() {
  if (confirm('Êtes-vous sûr de vouloir effacer toutes les notes ?')) {
    localStorage.removeItem('quickNotes');
    localStorage.removeItem('agendaEvents');
    localStorage.removeItem('categoryNotes');
    loadQuickNotes();
    loadEvents();
    loadCategoryNotes();
    showNotification('Toutes les notes effacées', 'success');
  }
}

// Raccourci clavier pour les notes rapides
document.addEventListener('DOMContentLoaded', function() {
  const quickNoteInput = document.getElementById('quick-note');
  if (quickNoteInput) {
    quickNoteInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        addQuickNote();
      }
    });
  }
});
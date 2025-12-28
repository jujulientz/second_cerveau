// ========== FIREBASE HELPER FUNCTIONS ==========

// Utilisateur actuel (à remplacer par l'authentification Firebase plus tard)
const CURRENT_USER_ID = "touzeauj";

// ========== FONCTIONS GÉNÉRIQUES ==========

// Sauvegarder une donnée
async function saveToFirebase(key, data) {
    try {
        const userRef = doc(db, "users", CURRENT_USER_ID);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            // Mettre à jour l'utilisateur existant
            await updateDoc(userRef, {
                [key]: data,
                lastUpdated: new Date().toISOString()
            });
        } else {
            // Créer un nouvel utilisateur
            await setDoc(userRef, {
                [key]: data,
                userId: CURRENT_USER_ID,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        console.log(`✅ Donnée sauvegardée dans Firebase: ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur sauvegarde Firebase (${key}):`, error);
        return false;
    }
}

// Charger une donnée
async function loadFromFirebase(key) {
    try {
        const userRef = doc(db, "users", CURRENT_USER_ID);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data()[key];
            console.log(`✅ Donnée chargée de Firebase: ${key}`);
            return data;
        } else {
            console.log(`ℹ️ Aucune donnée trouvée pour: ${key}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Erreur chargement Firebase (${key}):`, error);
        return null;
    }
}

// Sauvegarder avec une sous-collection (pour données multiples)
async function saveToSubcollection(collectionName, documentId, data) {
    try {
        const docRef = doc(db, "users", CURRENT_USER_ID, collectionName, documentId);
        await setDoc(docRef, {
            ...data,
            userId: CURRENT_USER_ID,
            updatedAt: new Date().toISOString()
        });
        console.log(`✅ Sauvegardé dans sous-collection: ${collectionName}/${documentId}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur sous-collection (${collectionName}):`, error);
        return false;
    }
}

// Charger depuis une sous-collection
async function loadFromSubcollection(collectionName, documentId) {
    try {
        const docRef = doc(db, "users", CURRENT_USER_ID, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error(`❌ Erreur chargement sous-collection (${collectionName}):`, error);
        return null;
    }
}

// Charger tous les documents d'une sous-collection
async function loadAllFromSubcollection(collectionName) {
    try {
        const q = query(collection(db, "users", CURRENT_USER_ID, collectionName));
        const querySnapshot = await getDocs(q);
        const results = [];
        
        querySnapshot.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Chargé ${results.length} documents de: ${collectionName}`);
        return results;
    } catch (error) {
        console.error(`❌ Erreur chargement tous documents (${collectionName}):`, error);
        return [];
    }
}

// Supprimer un document
async function deleteFromSubcollection(collectionName, documentId) {
    try {
        const docRef = doc(db, "users", CURRENT_USER_ID, collectionName, documentId);
        await deleteDoc(docRef);
        console.log(`✅ Supprimé: ${collectionName}/${documentId}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur suppression (${collectionName}):`, error);
        return false;
    }
}

// ========== FONCTIONS SPÉCIFIQUES POUR L'APPLICATION ==========

// Sauvegarder le planning
async function savePlanning(hourIndex, dayIndex, activity) {
    const key = `planning_${hourIndex}_${dayIndex}`;
    const data = {
        hourIndex,
        dayIndex,
        activity,
        timestamp: new Date().toISOString()
    };
    
    await saveToSubcollection("planning", key, data);
    return true;
}

// Charger le planning
async function loadPlanning(hourIndex, dayIndex) {
    const key = `planning_${hourIndex}_${dayIndex}`;
    const data = await loadFromSubcollection("planning", key);
    return data ? data.activity : null;
}

// Charger tout le planning pour un jour
async function loadPlanningForDay(dayIndex) {
    try {
        const planningCollection = collection(db, "users", CURRENT_USER_ID, "planning");
        const q = query(planningCollection, where("dayIndex", "==", dayIndex));
        const querySnapshot = await getDocs(q);
        
        const planning = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            planning[data.hourIndex] = data.activity;
        });
        
        return planning;
    } catch (error) {
        console.error("❌ Erreur chargement planning du jour:", error);
        return {};
    }
}

// Sauvegarder les objectifs journaliers
async function saveDailyObjectives(date, objectives) {
    const dateKey = date.replace(/\//g, '_');
    const data = {
        date: date,
        objectives: objectives,
        updatedAt: new Date().toISOString()
    };
    
    await saveToSubcollection("dailyObjectives", dateKey, data);
    return true;
}

// Charger les objectifs journaliers
async function loadDailyObjectives(date) {
    const dateKey = date.replace(/\//g, '_');
    const data = await loadFromSubcollection("dailyObjectives", dateKey);
    return data ? data.objectives : [];
}

// Sauvegarder l'hydratation
async function saveHydration(date, glasses) {
    const data = {
        date: date,
        glasses: glasses,
        updatedAt: new Date().toISOString()
    };
    
    await saveToSubcollection("hydration", date, data);
    return true;
}

// Charger l'hydratation
async function loadHydration(date) {
    const data = await loadFromSubcollection("hydration", date);
    return data ? data.glasses : 0;
}

// Sauvegarder les données financières
async function saveFinanceData(type, content) {
    const data = {
        content: content,
        updatedAt: new Date().toISOString()
    };
    
    await saveToSubcollection("finance", type, data);
    return true;
}

// Charger les données financières
async function loadFinanceData(type) {
    const data = await loadFromSubcollection("finance", type);
    return data ? data.content : "";
}

// Sauvegarder les données nutritionnelles
async function saveNutritionData(date, mealType, foods) {
    const key = `${date}_${mealType}`;
    const data = {
        date: date,
        mealType: mealType,
        foods: foods,
        updatedAt: new Date().toISOString()
    };
    
    await saveToSubcollection("nutrition", key, data);
    return true;
}

// Charger les données nutritionnelles pour une journée
async function loadNutritionData(date) {
    try {
        const nutritionCollection = collection(db, "users", CURRENT_USER_ID, "nutrition");
        const q = query(nutritionCollection, where("date", "==", date));
        const querySnapshot = await getDocs(q);
        
        const meals = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!meals[data.mealType]) {
                meals[data.mealType] = [];
            }
            meals[data.mealType] = data.foods;
        });
        
        return meals;
    } catch (error) {
        console.error("❌ Erreur chargement données nutritionnelles:", error);
        return {};
    }
}

// ========== FONCTIONS DE MIGRATION (optionnel) ==========

// Migrer les données du localStorage vers Firebase
async function migrateLocalStorageToFirebase() {
    console.log("🔄 Migration des données du localStorage vers Firebase...");
    
    // Migration du planning
    for (let i = 0; i < 18; i++) { // 18 créneaux horaires
        for (let j = 0; j < 7; j++) { // 7 jours
            const key = `planning_${i}_${j}`;
            const activity = localStorage.getItem(key);
            if (activity) {
                await savePlanning(i, j, activity);
            }
        }
    }
    
    // Migration des objectifs
    const objectivesKeys = Object.keys(localStorage).filter(key => key.startsWith('objectifs_'));
    for (const key of objectivesKeys) {
        const date = key.replace('objectifs_', '').replace(/_/g, '/');
        const objectives = JSON.parse(localStorage.getItem(key));
        await saveDailyObjectives(date, objectives);
    }
    
    // Migration finance
    const financeKeys = ['depenses', 'investissements', 'patrimoine', 'revenus'];
    for (const key of financeKeys) {
        const content = localStorage.getItem(key);
        if (content) {
            await saveFinanceData(key, content);
        }
    }
    
    // Migration nutrition
    const nutritionKeys = Object.keys(localStorage).filter(key => key.startsWith('nutrition_'));
    for (const key of nutritionKeys) {
        const date = key.replace('nutrition_', '');
        const meals = JSON.parse(localStorage.getItem(key));
        for (const mealType in meals) {
            await saveNutritionData(date, mealType, meals[mealType]);
        }
    }
    
    // Migration hydratation
    const waterKeys = Object.keys(localStorage).filter(key => key.startsWith('water_'));
    for (const key of waterKeys) {
        const date = key.replace('water_', '');
        const waterData = JSON.parse(localStorage.getItem(key));
        await saveHydration(date, waterData.glasses || 0);
    }
    
    console.log("✅ Migration terminée !");
    showNotification('Données migrées vers Firebase avec succès !', 'success');
}

// ========== EXPORT DES FONCTIONS ==========
window.firebaseHelpers = {
    saveToFirebase,
    loadFromFirebase,
    saveToSubcollection,
    loadFromSubcollection,
    loadAllFromSubcollection,
    deleteFromSubcollection,
    
    // Spécifiques
    savePlanning,
    loadPlanning,
    loadPlanningForDay,
    saveDailyObjectives,
    loadDailyObjectives,
    saveHydration,
    loadHydration,
    saveFinanceData,
    loadFinanceData,
    saveNutritionData,
    loadNutritionData,
    
    // Migration
    migrateLocalStorageToFirebase
};

// Importer les fonctions nécessaires depuis le SDK Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, update, remove } from "firebase/database";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxC--WywLZ13NZdiouncGLb8SaE-3GggQ",
  authDomain: "site-perso-b7c08.firebaseapp.com",
  databaseURL: "https://site-perso-b7c08-default-rtdb.firebaseio.com",
  projectId: "site-perso-b7c08",
  storageBucket: "site-perso-b7c08.firebasestorage.app",
  messagingSenderId: "1015317206704",
  appId: "1:1015317206704:web:19e1d3762bda8a7cf78d75",
  measurementId: "G-MMLMV2DPNT"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === Sauvegarde et récupération des données ===
function saveDataToFirebase(path, data) {
  const dbRef = ref(db, path);
  set(dbRef, data)
    .then(() => {
      console.log("Données sauvegardées avec succès dans Firebase !");
    })
    .catch((error) => {
      console.error("Erreur lors de la sauvegarde des données :", error);
    });
}

function getDataFromFirebase(path, callback) {
  const dbRef = ref(db);
  get(child(dbRef, path))
    .then((snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        console.log("Aucune donnée disponible à cet emplacement.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}

// Exemple : Sauvegarder les objectifs journaliers
function saveDailyObjectives(storageKey, objectivesArray) {
  saveDataToFirebase(`objectives/${storageKey}`, objectivesArray);
}

// Exemple : Récupérer les objectifs journaliers
function loadDailyObjectives(storageKey, callback) {
  getDataFromFirebase(`objectives/${storageKey}`, (data) => {
    callback(data || []);
  });
}

// Exemple : Sauvegarder les données financières
function saveFinanceData() {
  const depenses = document.getElementById("depenses")?.value || "";
  const investissements = document.getElementById("investissements")?.value || "";
  const patrimoine = document.getElementById("patrimoine")?.value || "";
  const revenus = document.getElementById("revenus")?.value || "";

  const financeData = {
    depenses,
    investissements,
    patrimoine,
    revenus
  };

  saveDataToFirebase("finance", financeData);
}

// Exemple : Charger les données financières
function loadFinanceData() {
  getDataFromFirebase("finance", (data) => {
    if (data) {
      document.getElementById("depenses").value = data.depenses || "";
      document.getElementById("investissements").value = data.investissements || "";
      document.getElementById("patrimoine").value = data.patrimoine || "";
      document.getElementById("revenus").value = data.revenus || "";
    }
  });
}

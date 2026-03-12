import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { useConcursoStore, User, Concurso } from '../store';

let isSyncingFromFirebase = false;
let unsubscribeFromFirestore: (() => void) | null = null;

const extractUserPreferences = (concursos: Concurso[]) => {
  return concursos
    // Adicione a checagem 'c && c.id' no filtro
    .filter(c => c && c.id && (c.interest_status !== 'none' || c.is_favorite || c.is_enrolled || c.notes || c.exam_location))
    .map(c => ({
      id: c.id,
      interest_status: c.interest_status,
      is_favorite: c.is_favorite || false,
      is_enrolled: c.is_enrolled || false,
      exam_location: c.exam_location || '',
      notes: c.notes || ''
    }));
};

const mergePreferences = (localConcursos: Concurso[], remotePreferences: any[]) => {
  if (!remotePreferences || !Array.isArray(remotePreferences)) return localConcursos;
  
  const remoteMap = new Map(remotePreferences.map(c => [c.id, c]));
  
  const merged = localConcursos.map(localC => {
    const remoteC = remoteMap.get(localC.id);
    if (remoteC) {
      remoteMap.delete(localC.id);
      return {
        ...localC,
        interest_status: remoteC.interest_status || localC.interest_status,
        is_favorite: remoteC.is_favorite ?? localC.is_favorite,
        is_enrolled: remoteC.is_enrolled ?? localC.is_enrolled,
        exam_location: remoteC.exam_location || localC.exam_location,
        notes: remoteC.notes || localC.notes,
      };
    }
    return localC;
  });

  const stubs = Array.from(remoteMap.values()).map(pref => ({
    id: pref.id,
    source: 'N/A',
    institution: 'Carregando...',
    location: 'N/A',
    board: 'N/A',
    vacancies: 'N/A',
    salary: 'N/A',
    registration_end: 'N/A',
    exemption_period: 'N/A',
    exam_date: 'N/A',
    link: '',
    interest_status: pref.interest_status || 'none',
    is_favorite: pref.is_favorite || false,
    is_enrolled: pref.is_enrolled || false,
    exam_location: pref.exam_location || '',
    notes: pref.notes || ''
  } as Concurso));

  return [...merged, ...stubs];
};

export const fetchGlobalConcursos = async () => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase não está configurado. Verifique as variáveis de ambiente.");
  }
  const store = useConcursoStore.getState();
  try {
    store.setSyncStatus('syncing');
    const concursosRef = collection(db, 'concursos_abertos');
    const snapshot = await getDocs(concursosRef);
    
    if (snapshot.empty) {
      console.log("No global concursos found in Firebase.");
      store.setSyncStatus('synced');
      return true; 
    }

    const globalConcursos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        source: data.source || data.Fonte || 'N/A',
        institution: data.institution || data.Orgao || 'N/A',
        location: data.location || data.UF || 'N/A',
        board: data.board || data.Banca || 'A Definir',
        vacancies: data.vacancies || data.Vagas || 'N/A',
        salary: data.salary || data.Salario || 'N/A',
        registration_end: data.registration_end || data.Fim_Inscricoes || 'N/A',
        exemption_period: data.exemption_period || data.Periodo_Isencao || 'N/A',
        exam_date: data.exam_date || data.Data_Prova || 'A Definir',
        link: data.link || data.Link || '',
        positions: data.positions || data.Cargos || 'N/A',
        subjects: data.subjects || data.Disciplinas || 'N/A',
        esfera: data.esfera || data.Esfera || 'N/A',
        modalidade: data.modalidade || data.Modalidade || 'N/A',
        status: data.status || data.Status || 'N/A',
        etapas: data.etapas || data.Etapas || 'N/A',
        duplicadas: data.duplicadas || data.Duplicadas || 'N/A',
      } as Concurso;
    });

    const globalIds = new Set(globalConcursos.map(c => c.id));
    const currentConcursos = store.concursos;
    const localOnly = currentConcursos.filter(c => !globalIds.has(c.id));

    const mergedGlobal = globalConcursos.map(globalC => {
      const localC = currentConcursos.find(c => c.id === globalC.id);
      if (localC) {
        return {
          ...globalC,
          interest_status: localC.interest_status || 'none',
          is_favorite: localC.is_favorite || false,
          is_enrolled: localC.is_enrolled || false,
          exam_location: localC.exam_location || '',
          notes: localC.notes || ''
        };
      }
      return {
        ...globalC,
        interest_status: 'none' as const,
        is_favorite: false,
        is_enrolled: false,
      };
    });

    // CORREÇÃO: Bloqueia a gravação no Firebase antes de atualizar o estado local
    isSyncingFromFirebase = true;
    
    // Atualiza apenas a visualização (Store)
    store.setConcursos([...localOnly, ...mergedGlobal]);
    
    // Libera a gravação logo após o estado atualizar (Zustand é síncrono)
    isSyncingFromFirebase = false;
    store.setSyncStatus('synced');

    return true;
  } catch (error: any) {
    console.error("Error fetching global concursos from Firebase:", error);
    store.setSyncStatus('error');
    throw new Error(`Erro ao sincronizar com Firebase: ${error.message}`);
  }
};

export const initFirebaseSync = () => {
  if (!isFirebaseConfigured) return;

  fetchGlobalConcursos().catch(console.error);

  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useConcursoStore.getState();
    
    if (unsubscribeFromFirestore) {
      unsubscribeFromFirestore();
      unsubscribeFromFirestore = null;
    }

    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      store.setUser(user);

      const userDocRef = doc(db, 'usuarios', user.uid);
      
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        store.setSyncStatus('syncing');
        const data = docSnap.data();
        isSyncingFromFirebase = true;
        if (data.scoringRules) store.setScoringRules(data.scoringRules);
        if (data.userProfileScoring) store.updateUserProfileScoring(data.userProfileScoring);
        if (data.concursos) store.setConcursos(mergePreferences(store.concursos, data.concursos));
        isSyncingFromFirebase = false;
        store.setSyncStatus('synced');
      } else {
        store.setSyncStatus('syncing');
        await setDoc(userDocRef, {
          scoringRules: store.scoringRules,
          userProfileScoring: store.userProfileScoring,
          concursos: extractUserPreferences(store.concursos),
          lastUpdated: new Date().toISOString(),
        });
        store.setSyncStatus('synced');
      }

      unsubscribeFromFirestore = onSnapshot(userDocRef, (snapshot) => {
        if (isSyncingFromFirebase) return;
        const data = snapshot.data();
        if (data) {
          store.setSyncStatus('syncing');
          isSyncingFromFirebase = true;
          if (data.scoringRules) store.setScoringRules(data.scoringRules);
          if (data.userProfileScoring) store.updateUserProfileScoring(data.userProfileScoring);
          if (data.concursos) store.setConcursos(mergePreferences(store.concursos, data.concursos));
          isSyncingFromFirebase = false;
          store.setSyncStatus('synced');
        }
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        store.setSyncStatus('error');
      });
    } else {
      store.setUser(null);
    }
  });

  const initialState = useConcursoStore.getState();
  let lastConcursos = initialState.concursos;
  let lastProfile = initialState.userProfileScoring;
  let lastRules = initialState.scoringRules;

  useConcursoStore.subscribe((state) => {
    if (isSyncingFromFirebase || !state.user) {
      return;
    }

    const concursosChanged = state.concursos !== lastConcursos;

    if (!concursosChanged) {
      return;
    }

    // Update trackers
    lastConcursos = state.concursos;

    state.setSyncStatus('syncing');
    const userDocRef = doc(db, 'usuarios', state.user.uid);
    
    const updateData: any = {
      lastUpdated: new Date().toISOString(),
      concursos: extractUserPreferences(state.concursos)
    };

    setDoc(userDocRef, updateData, { merge: true })
      .then(() => useConcursoStore.getState().setSyncStatus('synced'))
      .catch((err) => {
        console.error("Sync error:", err);
        useConcursoStore.getState().setSyncStatus('error');
      });
  });
};

export const saveUserSettings = async () => {
  const state = useConcursoStore.getState();
  if (!state.user) return false;

  state.setSyncStatus('syncing');
  const userDocRef = doc(db, 'usuarios', state.user.uid);
  try {
    await setDoc(userDocRef, {
      scoringRules: state.scoringRules,
      userProfileScoring: state.userProfileScoring,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    state.setSyncStatus('synced');
    return true;
  } catch (err) {
    console.error("Sync error:", err);
    state.setSyncStatus('error');
    throw err;
  }
};

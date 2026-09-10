/**
 * Módulo de Almacenamiento Local (LocalStorage)
 * Administra la persistencia de palabras, rachas, competidores, preferencias de tiempo e historial.
 */

const STORAGE_KEYS = {
  WORDS_GUESSED: 'ahorcado_palabras_descubiertas',
  MAX_STREAK: 'ahorcado_racha_maxima',
  CURRENT_STREAK: 'ahorcado_racha_actual',
  PLAYER_NAME: 'ahorcado_nombre_competidor',
  TIMER_PREFERENCE: 'ahorcado_tiempo_preferido',
  MATCH_HISTORY: 'ahorcado_historial_partidas'
};

// Nombre del competidor
export const getPlayerName = () => {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
};

export const setPlayerName = (name) => {
  const cleanName = name.trim();
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, cleanName);
  return cleanName;
};

// Preferencias de Temporizador del Competidor
export const getPreferredTimer = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.TIMER_PREFERENCE);
  try {
    return raw ? JSON.parse(raw) : { minutes: 2, seconds: 0 };
  } catch (e) {
    return { minutes: 2, seconds: 0 };
  }
};

export const setPreferredTimer = (minutes = 2, seconds = 0) => {
  const mins = Math.max(0, parseInt(minutes, 10) || 0);
  const secs = Math.max(0, Math.min(59, parseInt(seconds, 10) || 0));
  const pref = { minutes: mins, seconds: secs };
  localStorage.setItem(STORAGE_KEYS.TIMER_PREFERENCE, JSON.stringify(pref));
  return pref;
};

// Palabras y rachas
export const getWordsGuessed = () => {
  const val = localStorage.getItem(STORAGE_KEYS.WORDS_GUESSED);
  return val ? parseInt(val, 10) : 0;
};

export const getCurrentStreak = () => {
  const val = localStorage.getItem(STORAGE_KEYS.CURRENT_STREAK);
  return val ? parseInt(val, 10) : 0;
};

export const getMaxStreak = () => {
  const val = localStorage.getItem(STORAGE_KEYS.MAX_STREAK);
  return val ? parseInt(val, 10) : 0;
};

// Historial de Cuadros de Avance
export const getMatchHistory = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addMatchRecord = (isWin, attemptsLeft, wordLength) => {
  const history = getMatchHistory();
  const newRecord = {
    isWin,
    attemptsLeft,
    wordLength,
    timestamp: Date.now()
  };
  const updatedHistory = [newRecord, ...history].slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updatedHistory));
  return updatedHistory;
};

export const recordWin = (attemptsLeft = 6, wordLength = 5) => {
  const total = getWordsGuessed() + 1;
  const currentStreak = getCurrentStreak() + 1;
  const maxStreak = Math.max(getMaxStreak(), currentStreak);

  localStorage.setItem(STORAGE_KEYS.WORDS_GUESSED, total.toString());
  localStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, currentStreak.toString());
  localStorage.setItem(STORAGE_KEYS.MAX_STREAK, maxStreak.toString());

  const history = addMatchRecord(true, attemptsLeft, wordLength);

  return { total, currentStreak, maxStreak, history };
};

export const recordLoss = (attemptsLeft = 0, wordLength = 5) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, '0');
  const history = addMatchRecord(false, attemptsLeft, wordLength);
  return { currentStreak: 0, maxStreak: getMaxStreak(), history };
};

// Reinicio total del juego
export const resetEntireGame = () => {
  localStorage.removeItem(STORAGE_KEYS.WORDS_GUESSED);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_STREAK);
  localStorage.removeItem(STORAGE_KEYS.MAX_STREAK);
  localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
  localStorage.removeItem(STORAGE_KEYS.TIMER_PREFERENCE);
  localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
};

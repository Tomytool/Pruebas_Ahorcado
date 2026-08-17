/**
 * Módulo de Almacenamiento Local (LocalStorage)
 * Gestiona la persistencia de las palabras descubiertas por el usuario.
 */

const STORAGE_KEY_WORDS_GUESSED = 'ahorcado_palabras_descubiertas';

/**
 * Obtiene la cantidad total de palabras descubiertas acumuladas.
 * @returns {number}
 */
export const getWordsGuessed = () => {
  const count = localStorage.getItem(STORAGE_KEY_WORDS_GUESSED);
  return count ? parseInt(count, 10) : 0;
};

/**
 * Incrementa el contador de palabras descubiertas en 1 y devuelve el nuevo valor.
 * @returns {number}
 */
export const incrementWordsGuessed = () => {
  const currentCount = getWordsGuessed();
  const newCount = currentCount + 1;
  localStorage.setItem(STORAGE_KEY_WORDS_GUESSED, newCount.toString());
  return newCount;
};

/**
 * Reinicia el contador de palabras descubiertas a 0.
 * @returns {number}
 */
export const resetWordsGuessed = () => {
  localStorage.setItem(STORAGE_KEY_WORDS_GUESSED, '0');
  return 0;
};

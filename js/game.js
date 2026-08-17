/**
 * Módulo de Lógica de Juego del Ahorcado
 * Maneja el estado, selección de palabras, verificación de letras e intentos.
 */

export const MAX_ATTEMPTS = 6;

export const CATEGORIES = {
  tecnologia: [
    'JAVASCRIPT', 'DESARROLLADOR', 'PROGRAMACION', 'COMPUTADORA',
    'ALGORITMO', 'INTELIGENCIA', 'INTERNET', 'VARIABLES', 'FUNCIONES',
    'BASE DE DATOS', 'SERVIDOR', 'FRONTEND', 'BACKEND', 'NAVEGADOR'
  ],
  paises: [
    'COLOMBIA', 'ARGENTINA', 'ESPAÑA', 'MEXICO', 'PERU', 'CHILE',
    'FRANCIA', 'ALEMANIA', 'JAPON', 'CANADA', 'BRASIL', 'ITALIA'
  ],
  animales: [
    'LEOPARDO', 'ELEFANTE', 'DELFIN', 'JIRAFA', 'CANGURO', 'PINGÜINO',
    'TIBURON', 'AGUILA', 'CAMALEON', 'HIPOPOTAMO', 'COCODRILO'
  ],
  general: [
    'AVENTURA', 'DESAFIO', 'HORIZONTE', 'UNIVERSO', 'CREATIVIDAD',
    'INSPIRACION', 'NATURALEZA', 'IMAGINACION', 'CONOCIMIENTO', 'ESTRATEGIA'
  ]
};

/**
 * Elimina acentos/diacríticos de una cadena de texto para facilitar la comparación de letras.
 * @param {string} str 
 * @returns {string}
 */
export const normalizeText = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

export class HangmanGame {
  constructor() {
    this.secretWord = '';
    this.normalizedSecretWord = '';
    this.guessedLetters = new Set();
    this.wrongLetters = new Set();
    this.attemptsLeft = MAX_ATTEMPTS;
    this.status = 'IDLE'; // 'IDLE' | 'PLAYING' | 'WON' | 'LOST'
    this.categoryName = '';
  }

  /**
   * Inicia una nueva partida eligiendo una palabra aleatoria de una categoría predefinida.
   * @param {string} categoryKey 
   */
  startWithCategory(categoryKey = 'general') {
    const list = CATEGORIES[categoryKey] || CATEGORIES.general;
    const randomIndex = Math.floor(Math.random() * list.length);
    const word = list[randomIndex];
    const categoryLabels = {
      tecnologia: 'Tecnología',
      paises: 'Países',
      animales: 'Animales',
      general: 'Cultura General'
    };
    
    this.initGame(word, categoryLabels[categoryKey] || 'Categoría Rápida');
  }

  /**
   * Inicia una partida basada en una frase ingresada por el usuario.
   * Filtra palabras cortas (menores a 3 letras) y selecciona una aleatoria.
   * @param {string} phrase 
   */
  startWithPhrase(phrase) {
    if (!phrase || typeof phrase !== 'string') {
      throw new Error('Debes ingresar una frase válida.');
    }

    // Dividir por espacios y limpiar palabras
    const words = phrase
      .trim()
      .split(/\s+/)
      .map(w => w.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, ''))
      .filter(w => w.length >= 3);

    if (words.length === 0) {
      throw new Error('La frase debe contener al menos una palabra de 3 o más letras.');
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex].toUpperCase();
    
    this.initGame(selectedWord, 'Frase Personalizada');
  }

  /**
   * Inicializa las variables de estado del juego.
   * @param {string} word 
   * @param {string} categoryName 
   */
  initGame(word, categoryName) {
    this.secretWord = word.toUpperCase();
    this.normalizedSecretWord = normalizeText(this.secretWord);
    this.guessedLetters.clear();
    this.wrongLetters.clear();
    this.attemptsLeft = MAX_ATTEMPTS;
    this.status = 'PLAYING';
    this.categoryName = categoryName;

    // Agregar automáticamente espacios si la palabra contiene espacios
    for (let i = 0; i < this.secretWord.length; i++) {
      if (this.secretWord[i] === ' ') {
        this.guessedLetters.add(' ');
      }
    }
  }

  /**
   * Procesa la suposición de una letra por parte del usuario.
   * @param {string} rawLetter 
   * @returns {Object} { isCorrect, isRepeated, status }
   */
  guessLetter(rawLetter) {
    if (this.status !== 'PLAYING') {
      return { isCorrect: false, isRepeated: true, status: this.status };
    }

    const letter = normalizeText(rawLetter);
    if (!letter || letter.length !== 1 || !/[A-ZÑ]/.test(letter)) {
      return { isCorrect: false, isRepeated: false, status: this.status };
    }

    if (this.guessedLetters.has(letter) || this.wrongLetters.has(letter)) {
      return { isCorrect: false, isRepeated: true, status: this.status };
    }

    if (this.normalizedSecretWord.includes(letter)) {
      this.guessedLetters.add(letter);

      // Verificar si ya se adivinaron todas las letras
      const isWon = [...this.normalizedSecretWord].every(char => 
        char === ' ' || this.guessedLetters.has(char)
      );

      if (isWon) {
        this.status = 'WON';
      }

      return { isCorrect: true, isRepeated: false, status: this.status };
    } else {
      this.wrongLetters.add(letter);
      this.attemptsLeft--;

      if (this.attemptsLeft <= 0) {
        this.status = 'LOST';
      }

      return { isCorrect: false, isRepeated: false, status: this.status };
    }
  }

  /**
   * Obtiene la estructura visual de la palabra con espacios y letras descubiertas o guiones.
   * @returns {Array<{char: string, revealed: boolean}>}
   */
  getWordDisplayState() {
    return [...this.secretWord].map((originalChar, index) => {
      const normChar = this.normalizedSecretWord[index];
      const isSpace = originalChar === ' ';
      const isRevealed = isSpace || this.guessedLetters.has(normChar);

      return {
        char: originalChar,
        revealed: isRevealed,
        isSpace
      };
    });
  }
}

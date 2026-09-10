/**
 * Módulo de Lógica de Juego del Ahorcado (ES6+)
 * Maneja el estado del juego, selección de palabras, parsing de párrafos y puntuación.
 */

export const MAX_ATTEMPTS = 6;

export const CATEGORIES = {
  tecnologia: [
    'JAVASCRIPT', 'DESARROLLADOR', 'PROGRAMACION', 'COMPUTADORA',
    'ALGORITMO', 'INTELIGENCIA', 'INTERNET', 'VARIABLES', 'FUNCIONES',
    'BASE DE DATOS', 'SERVIDOR', 'FRONTEND', 'BACKEND', 'NAVEGADOR',
    'CIENCIA DE DATOS', 'CIBERSEGURIDAD', 'ARQUITECTURA'
  ],
  paises: [
    'COLOMBIA', 'ARGENTINA', 'ESPAÑA', 'MEXICO', 'PERU', 'CHILE',
    'FRANCIA', 'ALEMANIA', 'JAPON', 'CANADA', 'BRASIL', 'ITALIA',
    'AUSTRALIA', 'PORTUGAL', 'SUIZA', 'URUGUAY', 'COSTA RICA'
  ],
  animales: [
    'LEOPARDO', 'ELEFANTE', 'DELFIN', 'JIRAFA', 'CANGURO', 'PINGÜINO',
    'TIBURON', 'AGUILA', 'CAMALEON', 'HIPOPOTAMO', 'COCODRILO',
    'PANTERA', 'GUACAMAYO', 'COLIBRI', 'ORCA'
  ],
  general: [
    'AVENTURA', 'DESAFIO', 'HORIZONTE', 'UNIVERSO', 'CREATIVIDAD',
    'INSPIRACION', 'NATURALEZA', 'IMAGINACION', 'CONOCIMIENTO', 'ESTRATEGIA',
    'CULTURA', 'LIDERAZGO', 'INNOVACION', 'MARAVILLA'
  ]
};

/**
 * Normaliza cadenas removiendo acentos y convirtiendo a mayúsculas.
 * @param {string} str 
 * @returns {string}
 */
export const normalizeText = (str = '') => {
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
    this.candidateWords = []; // Lista de palabras elegibles (especialmente en Modo Párrafo)
    this.originalParagraph = '';
    this.score = 0;
  }

  /**
   * Inicia una partida basada en una categoría predefinida.
   * @param {string} categoryKey 
   */
  startWithCategory(categoryKey = 'general') {
    const list = CATEGORIES[categoryKey] ?? CATEGORIES.general;
    const randomIndex = Math.floor(Math.random() * list.length);
    const word = list[randomIndex];

    const categoryLabels = {
      tecnologia: 'Tecnología',
      paises: 'Países y Ciudades',
      animales: 'Animales',
      general: 'Cultura General'
    };

    this.candidateWords = [...list];
    this.originalParagraph = '';
    this.initGame(word, categoryLabels[categoryKey] ?? 'Categoría Rápida');
  }

  /**
   * Inicia una partida procesando un párrafo completo ingresado por el usuario.
   * Extrae todas las palabras de 3 o más letras, muestra el banco de palabras y elige una al azar.
   * @param {string} paragraph 
   */
  startWithPhrase(paragraph) {
    if (!paragraph || typeof paragraph !== 'string' || paragraph.trim().length === 0) {
      throw new Error('Debes ingresar un párrafo o texto válido.');
    }

    this.originalParagraph = paragraph.trim();

    // Extraer palabras usando expresiones regulares (mínimo 3 caracteres alfabéticos)
    const rawWords = this.originalParagraph
      .split(/\s+/)
      .map(word => word.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, ''))
      .filter(word => word.length >= 3);

    if (rawWords.length === 0) {
      throw new Error('El párrafo debe contener al menos una palabra válida de 3 o más letras.');
    }

    // Guardar palabras únicas en mayúsculas para la vista previa
    this.candidateWords = [...new Set(rawWords.map(w => w.toUpperCase()))];

    // Elegir una palabra aleatoria del párrafo
    const randomIndex = Math.floor(Math.random() * rawWords.length);
    const selectedWord = rawWords[randomIndex].toUpperCase();

    this.initGame(selectedWord, 'Párrafo Personalizado');
  }

  /**
   * Inicializa el estado para una palabra concreta.
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

    // Aceptar automáticamente espacios si los hubiere
    for (let i = 0; i < this.secretWord.length; i++) {
      if (this.secretWord[i] === ' ') {
        this.guessedLetters.add(' ');
      }
    }
  }

  /**
   * Intenta adivinar una letra.
   * @param {string} rawLetter 
   * @returns {{ isCorrect: boolean, isRepeated: boolean, status: string }}
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

      // Comprobar si todas las letras fueron adivinadas
      const isWon = [...this.normalizedSecretWord].every(char => 
        char === ' ' || this.guessedLetters.has(char)
      );

      if (isWon) {
        this.status = 'WON';
        this.score = this.attemptsLeft * 100 + this.secretWord.length * 20;
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
   * Devuelve el estado de cada carácter de la palabra para su renderizado en la interfaz.
   * @returns {Array<{char: string, revealed: boolean, isSpace: boolean}>}
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

/**
 * Aplicación Principal del Ahorcado (App Controller)
 * Integra el juego (game.js), la UI (ui.js) y la memoria local (storage.js).
 */

import { HangmanGame } from './game.js';
import { UIManager } from './ui.js';
import { incrementWordsGuessed, resetWordsGuessed } from './storage.js';

class AppController {
  constructor() {
    this.game = new HangmanGame();
    this.ui = new UIManager();
    this.currentMode = 'category'; // 'category' | 'phrase'
    this.currentCategory = 'general';
  }

  init() {
    this.bindEvents();
    this.ui.updateScoreBadge();
    
    // Iniciar con categoría general por defecto
    this.startNewCategoryGame(this.currentCategory);
  }

  bindEvents() {
    // Pestañas / Toggles de Modo de Juego
    const tabBtnCategory = document.getElementById('tab-btn-category');
    const tabBtnPhrase = document.getElementById('tab-btn-phrase');
    const viewCategory = document.getElementById('view-category-mode');
    const viewPhrase = document.getElementById('view-phrase-mode');

    if (tabBtnCategory && tabBtnPhrase) {
      tabBtnCategory.addEventListener('click', () => {
        this.currentMode = 'category';
        tabBtnCategory.classList.add('active');
        tabBtnPhrase.classList.remove('active');
        viewCategory.classList.remove('d-none');
        viewPhrase.classList.add('d-none');
      });

      tabBtnPhrase.addEventListener('click', () => {
        this.currentMode = 'phrase';
        tabBtnPhrase.classList.add('active');
        tabBtnCategory.classList.remove('active');
        viewPhrase.classList.remove('d-none');
        viewCategory.classList.add('d-none');
      });
    }

    // Botones de selección de categoría
    const categoryButtons = document.querySelectorAll('[data-category]');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-category');
        categoryButtons.forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.currentCategory = cat;
        this.startNewCategoryGame(cat);
      });
    });

    // Formulario de frase personalizada
    const phraseForm = document.getElementById('phrase-form');
    const phraseInput = document.getElementById('phrase-input');

    if (phraseForm) {
      phraseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phrase = phraseInput ? phraseInput.value : '';
        try {
          this.game.startWithPhrase(phrase);
          this.updateUI();
          if (phraseInput) phraseInput.value = '';
          this.ui.showToast('¡Partida iniciada con tu frase!', 'info');
        } catch (error) {
          this.ui.showToast(error.message, 'warning');
        }
      });
    }

    // Evento de Teclado Físico (keydown)
    window.addEventListener('keydown', (e) => {
      // Ignorar si se está escribiendo en el textarea
      if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'Ñ' || (key.length === 1 && key >= 'A' && key <= 'Z')) {
        this.handleKeyPress(key);
      }
    });

    // Botón de Reiniciar Marcador de LocalStorage
    const resetScoreBtn = document.getElementById('reset-score-btn');
    if (resetScoreBtn) {
      resetScoreBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas reiniciar tu contador de palabras descubiertas?')) {
          resetWordsGuessed();
          this.ui.updateScoreBadge();
          this.ui.showToast('Contador reiniciado a 0.', 'info');
        }
      });
    }
  }

  /**
   * Inicia una partida con la categoría indicada.
   * @param {string} categoryKey 
   */
  startNewCategoryGame(categoryKey) {
    this.game.startWithCategory(categoryKey);
    this.updateUI();
  }

  /**
   * Maneja la pulsación de una letra (virtual o física).
   * @param {string} letter 
   */
  handleKeyPress(letter) {
    if (this.game.status !== 'PLAYING') return;

    const result = this.game.guessLetter(letter);

    if (result.isRepeated) {
      this.ui.showToast(`Ya intentaste la letra '${letter}'.`, 'warning');
      return;
    }

    this.updateUI();

    // Comprobar estado final del juego
    if (result.status === 'WON') {
      const newTotal = incrementWordsGuessed();
      this.ui.updateScoreBadge();
      this.ui.showResultModal('WON', this.game.secretWord, newTotal, () => {
        this.restartGame();
      });
    } else if (result.status === 'LOST') {
      this.ui.showResultModal('LOST', this.game.secretWord, 0, () => {
        this.restartGame();
      });
    }
  }

  /**
   * Actualiza todos los elementos de la interfaz.
   */
  updateUI() {
    this.ui.renderCategory(this.game.categoryName);
    this.ui.renderWord(this.game.getWordDisplayState());
    this.ui.renderKeyboard(
      this.game.guessedLetters,
      this.game.wrongLetters,
      (letter) => this.handleKeyPress(letter)
    );
    this.ui.renderHangman(this.game.attemptsLeft);
  }

  /**
   * Reinicia la partida según el modo de juego actual.
   */
  restartGame() {
    if (this.currentMode === 'phrase') {
      // Si estaba en modo frase, pedirle ingresar otra o volver a categoría
      this.startNewCategoryGame(this.currentCategory);
    } else {
      this.startNewCategoryGame(this.currentCategory);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});

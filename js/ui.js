/**
 * Módulo de Interfaz de Usuario (UI)
 * Maneja el renderizado del DOM, animaciones SVG del ahorcado, teclado y modal.
 */

import { getWordsGuessed } from './storage.js';

export class UIManager {
  constructor() {
    // Elementos principales del DOM
    this.wordsGuessedBadge = document.getElementById('words-guessed-count');
    this.categoryBadge = document.getElementById('category-badge');
    this.wordContainer = document.getElementById('word-display');
    this.keyboardContainer = document.getElementById('keyboard-display');
    this.attemptsCountEl = document.getElementById('attempts-count');
    this.attemptsBarEl = document.getElementById('attempts-progress-bar');
    
    // Modal
    this.modalEl = document.getElementById('result-modal');
    this.modalTitleEl = document.getElementById('modal-title');
    this.modalMessageEl = document.getElementById('modal-message');
    this.modalWordEl = document.getElementById('modal-word');
    this.modalActionBtn = document.getElementById('modal-action-btn');
    
    // Partes del Ahorcado en SVG
    this.hangmanParts = [
      document.querySelector('.svg-head'),
      document.querySelector('.svg-body'),
      document.querySelector('.svg-arm-left'),
      document.querySelector('.svg-arm-right'),
      document.querySelector('.svg-leg-left'),
      document.querySelector('.svg-leg-right')
    ];
  }

  /**
   * Actualiza el badge del contador de palabras descubiertas desde LocalStorage.
   */
  updateScoreBadge() {
    if (this.wordsGuessedBadge) {
      const count = getWordsGuessed();
      this.wordsGuessedBadge.textContent = count;
    }
  }

  /**
   * Renderiza el estado actual de la palabra en pantalla.
   * @param {Array<{char: string, revealed: boolean, isSpace: boolean}>} displayState 
   */
  renderWord(displayState) {
    if (!this.wordContainer) return;
    this.wordContainer.innerHTML = '';

    displayState.forEach(({ char, revealed, isSpace }) => {
      const tile = document.createElement('div');

      if (isSpace) {
        tile.className = 'letter-tile tile-space';
      } else {
        tile.className = `letter-tile ${revealed ? 'revealed' : 'hidden'}`;
        tile.textContent = revealed ? char : '';
      }

      this.wordContainer.appendChild(tile);
    });
  }

  /**
   * Renderiza el teclado de letras virtuales (A-Z + Ñ).
   * @param {Set<string>} guessedLetters 
   * @param {Set<string>} wrongLetters 
   * @param {Function} onKeyPressCallback 
   */
  renderKeyboard(guessedLetters, wrongLetters, onKeyPressCallback) {
    if (!this.keyboardContainer) return;
    this.keyboardContainer.innerHTML = '';

    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

    alphabet.forEach(letter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'key-btn';
      button.textContent = letter;
      button.setAttribute('data-letter', letter);

      if (guessedLetters.has(letter)) {
        button.classList.add('correct');
        button.disabled = true;
      } else if (wrongLetters.has(letter)) {
        button.classList.add('wrong');
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        if (!button.disabled) {
          onKeyPressCallback(letter);
        }
      });

      this.keyboardContainer.appendChild(button);
    });
  }

  /**
   * Actualiza la ilustración SVG del ahorcado según los intentos restantes.
   * @param {number} attemptsLeft (Máximo 6)
   */
  renderHangman(attemptsLeft) {
    const wrongCount = 6 - attemptsLeft;

    this.hangmanParts.forEach((part, index) => {
      if (part) {
        if (index < wrongCount) {
          part.classList.add('visible');
        } else {
          part.classList.remove('visible');
        }
      }
    });

    if (this.attemptsCountEl) {
      this.attemptsCountEl.textContent = attemptsLeft;
    }

    if (this.attemptsBarEl) {
      const percentage = (attemptsLeft / 6) * 100;
      this.attemptsBarEl.style.width = `${percentage}%`;
      
      // Cambio dinámico de color de barra de intentos
      if (attemptsLeft <= 2) {
        this.attemptsBarEl.style.backgroundColor = 'var(--color-danger)';
      } else if (attemptsLeft <= 4) {
        this.attemptsBarEl.style.backgroundColor = 'var(--color-accent)';
      } else {
        this.attemptsBarEl.style.backgroundColor = 'var(--color-success)';
      }
    }
  }

  /**
   * Actualiza la categoría actual mostrada en el tablero.
   * @param {string} categoryName 
   */
  renderCategory(categoryName) {
    if (this.categoryBadge) {
      this.categoryBadge.textContent = categoryName || 'Ahorcado';
    }
  }

  /**
   * Muestra el modal de resultados al ganar o perder.
   * @param {'WON'|'LOST'} status 
   * @param {string} secretWord 
   * @param {number} totalGuessedWords 
   * @param {Function} onRestartCallback 
   */
  showResultModal(status, secretWord, totalGuessedWords, onRestartCallback) {
    if (!this.modalEl) return;

    if (status === 'WON') {
      this.modalTitleEl.textContent = '🎉 ¡Felicitaciones! Has Ganado';
      this.modalTitleEl.className = 'modal-title text-success';
      this.modalMessageEl.innerHTML = `¡Adivinaste la palabra con éxito!<br>Llevas <strong>${totalGuessedWords}</strong> ${totalGuessedWords === 1 ? 'palabra descubierta' : 'palabras descubiertas'} en total.`;
      this.modalActionBtn.textContent = 'Jugar Siguiente Palabra';
      this.modalActionBtn.className = 'btn btn-success';
    } else {
      this.modalTitleEl.textContent = '💔 ¡Has Perdido!';
      this.modalTitleEl.className = 'modal-title text-danger';
      this.modalMessageEl.textContent = 'Se te han agotado los intentos. No te rindas e inténtalo de nuevo.';
      this.modalActionBtn.textContent = 'Intentar de Nuevo';
      this.modalActionBtn.className = 'btn btn-accent';
    }

    if (this.modalWordEl) {
      this.modalWordEl.innerHTML = `La palabra era: <span>${secretWord}</span>`;
    }

    // Handler único para el botón de acción
    const handleNext = () => {
      this.hideModal();
      this.modalActionBtn.removeEventListener('click', handleNext);
      onRestartCallback();
    };

    this.modalActionBtn.onclick = handleNext;
    this.modalEl.classList.add('active');
  }

  /**
   * Oculta el modal de resultados.
   */
  hideModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
  }

  /**
   * Muestra un mensaje Toast emergente para feedback rápido.
   * @param {string} message 
   * @param {'info'|'warning'|'error'} type 
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

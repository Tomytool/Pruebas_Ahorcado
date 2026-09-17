/**
 * Módulo de Interfaz de Usuario (UIManager)
 * Maneja la UI del competidor, formulario de inscripción unificado, pantalla de preparación y modales.
 */

import { getWordsGuessed, getCurrentStreak, getPlayerName, getPreferredTimer } from './storage.js';

export class UIManager {
  constructor() {
    // Competidor y Header
    this.playerNameEl = document.getElementById('player-name-display');
    this.wordsGuessedBadge = document.getElementById('words-guessed-count');
    this.streakBadge = document.getElementById('streak-count');

    // Modal de Registro Unificado del Competidor
    this.playerModalEl = document.getElementById('player-modal');
    this.playerFormEl = document.getElementById('player-form');
    this.playerNameInput = document.getElementById('player-name-input');
    this.playerMinInput = document.getElementById('player-timer-min');
    this.playerSecInput = document.getElementById('player-timer-sec');

    // Elementos del Modal para Selección de Modo
    this.modalTabCategory = document.getElementById('modal-tab-category');
    this.modalTabPhrase = document.getElementById('modal-tab-phrase');
    this.modalViewCategory = document.getElementById('modal-view-category');
    this.modalViewPhrase = document.getElementById('modal-view-phrase');
    this.modalParagraphInput = document.getElementById('modal-paragraph-input');

    // Pantalla de Preparación "¿Estás listo para jugar?"
    this.readyOverlayEl = document.getElementById('ready-overlay');
    this.readyPlayerNameEl = document.getElementById('ready-player-name');
    this.readyCategoryEl = document.getElementById('ready-category');
    this.readyTimerEl = document.getElementById('ready-timer');
    this.btnReadyStart = document.getElementById('btn-ready-start');

    // Temporizador Tablero
    this.timerWidgetEl = document.getElementById('timer-widget');
    this.timerTextEl = document.getElementById('timer-display-text');
    this.timerRingCircle = document.getElementById('timer-ring-circle');
    this.timerInputMin = document.getElementById('timer-input-min');
    this.timerInputSec = document.getElementById('timer-input-sec');

    // Tablero
    this.categoryBadge = document.getElementById('category-badge');
    this.wordContainer = document.getElementById('word-display');
    this.keyboardContainer = document.getElementById('keyboard-display');
    this.attemptsCountEl = document.getElementById('attempts-count');
    this.attemptsBarEl = document.getElementById('attempts-progress-bar');
    this.paragraphWordsContainer = document.getElementById('words-drawer');
    this.wordsDrawerToggle = document.getElementById('words-drawer-toggle');
    this.paragraphWordsList = document.getElementById('paragraph-words-list');

    // Modal de Resultados y Cuadros de Avance
    this.modalEl = document.getElementById('result-modal');
    this.modalTitleEl = document.getElementById('modal-title');
    this.modalMessageEl = document.getElementById('modal-message');
    this.modalWordEl = document.getElementById('modal-word');
    this.modalActionBtn = document.getElementById('modal-action-btn');
    this.progressMatrixContainer = document.getElementById('progress-matrix-container');
    this.progressMatrixList = document.getElementById('progress-matrix-list');

    this.selectedModalMode = 'category'; // 'category' | 'phrase'
    this.selectedModalCategory = 'general';
  }

  /**
   * Muestra la insignia con el nombre del competidor en el encabezado.
   * @param {string} name 
   */
  renderPlayerBadge(name) {
    if (this.playerNameEl) {
      this.playerNameEl.textContent = name || 'Competidor';
    }
  }

  /**
   * Muestra el modal inicial unificado de inscripción (Nombre + Temporizador + Modo + Categoría/Párrafo).
   * @param {Function} onSubmitCallback 
   */
  showRegistrationModal(onSubmitCallback) {
    if (!this.playerModalEl || !this.playerFormEl) return;

    const currentName = getPlayerName();
    const currentTimer = getPreferredTimer();

    if (this.playerNameInput) this.playerNameInput.value = currentName;
    if (this.playerMinInput) this.playerMinInput.value = currentTimer.minutes;
    if (this.playerSecInput) this.playerSecInput.value = currentTimer.seconds;

    // Configurar pestañas de modo dentro del modal
    if (this.modalTabCategory && this.modalTabPhrase) {
      this.modalTabCategory.onclick = () => {
        this.selectedModalMode = 'category';
        this.modalTabCategory.classList.add('active');
        this.modalTabPhrase.classList.remove('active');
        if (this.modalViewCategory) this.modalViewCategory.classList.remove('d-none');
        if (this.modalViewPhrase) this.modalViewPhrase.classList.add('d-none');
      };

      this.modalTabPhrase.onclick = () => {
        this.selectedModalMode = 'phrase';
        this.modalTabPhrase.classList.add('active');
        this.modalTabCategory.classList.remove('active');
        if (this.modalViewPhrase) this.modalViewPhrase.classList.remove('d-none');
        if (this.modalViewCategory) this.modalViewCategory.classList.add('d-none');
      };
    }

    // Configurar subcategorías dentro del modal
    const subcatBtns = document.querySelectorAll('[data-modal-cat]');
    subcatBtns.forEach(btn => {
      btn.onclick = (e) => {
        subcatBtns.forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.selectedModalCategory = e.currentTarget.getAttribute('data-modal-cat') || 'general';
      };
    });

    this.playerModalEl.classList.add('active');
    setTimeout(() => {
      if (this.playerNameInput) this.playerNameInput.focus();
    }, 100);

    const handleFormSubmit = (e) => {
      e.preventDefault();
      const nameVal = this.playerNameInput ? this.playerNameInput.value.trim() : '';
      const minsVal = this.playerMinInput ? parseInt(this.playerMinInput.value, 10) || 0 : 2;
      const secsVal = this.playerSecInput ? parseInt(this.playerSecInput.value, 10) || 0 : 0;
      const paragraphVal = this.modalParagraphInput ? this.modalParagraphInput.value.trim() : '';

      if (!nameVal) {
        this.showToast('Ingresa tu nombre para poder competir.', 'warning');
        return;
      }

      if (this.selectedModalMode === 'phrase' && !paragraphVal) {
        this.showToast('Ingresa un párrafo de texto para iniciar el juego.', 'warning');
        return;
      }

      this.playerFormEl.removeEventListener('submit', handleFormSubmit);
      this.hideRegistrationModal();

      // Sincronizar inputs del tablero
      if (this.timerInputMin) this.timerInputMin.value = minsVal;
      if (this.timerInputSec) this.timerInputSec.value = secsVal;

      onSubmitCallback({
        name: nameVal,
        minutes: minsVal,
        seconds: secsVal,
        mode: this.selectedModalMode,
        category: this.selectedModalCategory,
        paragraph: paragraphVal
      });
    };

    this.playerFormEl.onsubmit = handleFormSubmit;
  }

  /**
   * Oculta el modal de inscripción.
   */
  hideRegistrationModal() {
    if (this.playerModalEl) {
      this.playerModalEl.classList.remove('active');
    }
  }

  /**
   * Despliega la Pantalla de Preparación "¿Estás listo para jugar?" que cubre el fondo del juego.
   * @param {string} playerName 
   * @param {string} categoryName 
   * @param {string} formattedTime 
   * @param {Function} onStartCallback 
   */
  showReadyOverlay(playerName, categoryName, formattedTime, onStartCallback) {
    if (!this.readyOverlayEl) {
      onStartCallback();
      return;
    }

    if (this.readyPlayerNameEl) this.readyPlayerNameEl.textContent = playerName || 'Competidor';
    if (this.readyCategoryEl) this.readyCategoryEl.textContent = categoryName || 'General';
    if (this.readyTimerEl) this.readyTimerEl.textContent = formattedTime || '02:00';

    this.readyOverlayEl.classList.add('active');

    const handleReadyClick = () => {
      this.hideReadyOverlay();
      this.btnReadyStart.removeEventListener('click', handleReadyClick);
      onStartCallback();
    };

    this.btnReadyStart.onclick = handleReadyClick;
  }

  /**
   * Oculta la pantalla de preparación.
   */
  hideReadyOverlay() {
    if (this.readyOverlayEl) {
      this.readyOverlayEl.classList.remove('active');
    }
  }

  /**
   * Obtiene los minutos y segundos ingresados por el usuario en el tablero.
   * @returns {{ minutes: number, seconds: number }}
   */
  getTimerDuration() {
    const mins = this.timerInputMin ? parseInt(this.timerInputMin.value, 10) || 0 : 2;
    const secs = this.timerInputSec ? parseInt(this.timerInputSec.value, 10) || 0 : 0;
    return { minutes: Math.max(0, mins), seconds: Math.max(0, Math.min(59, secs)) };
  }

  /**
   * Renderiza el estado del reloj de cuenta regresiva en el HUD neón.
   * @param {string} formattedTime 
   * @param {number} percentage 
   * @param {boolean} isWarning 
   */
  renderTimer(formattedTime, percentage = 100, isWarning = false) {
    if (this.timerTextEl) {
      this.timerTextEl.textContent = formattedTime;
    }

    if (this.timerRingCircle) {
      const circumference = 138.2;
      const offset = circumference - (percentage / 100) * circumference;
      this.timerRingCircle.style.strokeDashoffset = `${offset}`;
    }

    if (this.timerWidgetEl) {
      if (isWarning) {
        this.timerWidgetEl.classList.add('timer-warning');
      } else {
        this.timerWidgetEl.classList.remove('timer-warning');
      }
    }
  }

  /**
   * Actualiza los marcadores de puntuación y racha.
   */
  updateScoreBadge() {
    if (this.wordsGuessedBadge) {
      this.wordsGuessedBadge.textContent = getWordsGuessed();
    }
    if (this.streakBadge) {
      this.streakBadge.textContent = getCurrentStreak();
    }
    this.renderPlayerBadge(getPlayerName());
  }

  /**
   * Renderiza las fichas de letras de la palabra secreta con auto-escalado fluido.
   * @param {Array<{char: string, revealed: boolean, isSpace: boolean}>} displayState 
   * @param {Function} getCoordsCallback 
   */
  renderWord(displayState, getCoordsCallback) {
    if (!this.wordContainer) return;
    this.wordContainer.innerHTML = '';

    // Asignar cantidad total de caracteres al estilo para escalado matemático
    const totalTiles = displayState.length || 1;
    this.wordContainer.style.setProperty('--tile-count', totalTiles);

    displayState.forEach(({ char, revealed, isSpace }, index) => {
      const tile = document.createElement('div');

      if (isSpace) {
        tile.className = 'letter-tile tile-space';
      } else {
        tile.className = `letter-tile ${revealed ? 'revealed' : 'hidden'}`;
        tile.textContent = revealed ? char : '';

        if (revealed && getCoordsCallback) {
          setTimeout(() => {
            const rect = tile.getBoundingClientRect();
            getCoordsCallback(rect.left + rect.width / 2, rect.top + rect.height / 2);
          }, 50);
        }
      }

      this.wordContainer.appendChild(tile);
    });
  }

  /**
   * Muestra las palabras extraídas del párrafo o de la categoría.
   * @param {Array<string>} candidateWords 
   * @param {string} secretWord 
   */
  renderCandidateWords(candidateWords = [], secretWord = '') {
    if (!this.paragraphWordsContainer || !this.paragraphWordsList) return;

    if (candidateWords.length === 0) {
      this.paragraphWordsContainer.classList.add('d-none');
      return;
    }

    this.paragraphWordsContainer.classList.remove('d-none');
    this.paragraphWordsList.innerHTML = '';

    const countBadge = document.getElementById('words-count-badge');
    if (countBadge) {
      countBadge.textContent = candidateWords.length;
    }

    candidateWords.forEach(word => {
      const chip = document.createElement('span');
      chip.className = 'word-chip';
      chip.textContent = word;

      if (secretWord && word === secretWord) {
        chip.classList.add('target-word');
      }

      this.paragraphWordsList.appendChild(chip);
    });
  }

  /**
   * Renderiza la Matriz Visual de Cuadros de Avance.
   * @param {Array<{isWin: boolean, attemptsLeft: number}>} history 
   */
  renderProgressMatrix(history = []) {
    if (!this.progressMatrixList) return;
    this.progressMatrixList.innerHTML = '';

    if (history.length === 0) {
      this.progressMatrixList.innerHTML = '<span class="matrix-empty">Sin partidas anteriores</span>';
      return;
    }

    history.forEach((match, idx) => {
      const box = document.createElement('div');
      box.className = `matrix-box ${match.isWin ? 'win' : 'loss'}`;
      box.title = `Partida ${history.length - idx}: ${match.isWin ? 'Victoria' : 'Derrota'} (${match.attemptsLeft} intentos rest.)`;
      box.innerHTML = match.isWin ? '🟩' : '🟥';
      this.progressMatrixList.appendChild(box);
    });
  }

  /**
   * Renderiza el teclado virtual estructurado en 3 filas de 9 letras (A-I, J-Q, R-Z).
   * @param {Set<string>} guessedLetters 
   * @param {Set<string>} wrongLetters 
   * @param {Function} onKeyPressCallback 
   */
  renderKeyboard(guessedLetters, wrongLetters, onKeyPressCallback) {
    if (!this.keyboardContainer) return;
    this.keyboardContainer.innerHTML = '';

    // Estructura fija de 3 filas de 9 teclas (27 caracteres del alfabeto hispano)
    const rows = [
      'ABCDEFGHI'.split(''),
      'JKLMNÑOPQ'.split(''),
      'RSTUVWXYZ'.split('')
    ];

    rows.forEach(rowLetters => {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      rowLetters.forEach(letter => {
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
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
            onKeyPressCallback(letter);
          }
        });

        rowEl.appendChild(button);
      });

      this.keyboardContainer.appendChild(rowEl);
    });
  }

  /**
   * Actualiza los intentos restantes.
   * @param {number} attemptsLeft 
   */
  renderAttempts(attemptsLeft) {
    if (this.attemptsCountEl) {
      this.attemptsCountEl.textContent = attemptsLeft;
    }

    if (this.attemptsBarEl) {
      const percentage = (attemptsLeft / 6) * 100;
      this.attemptsBarEl.style.width = `${percentage}%`;

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
   * Actualiza la categoría mostrada.
   * @param {string} categoryName 
   */
  renderCategory(categoryName) {
    if (this.categoryBadge) {
      this.categoryBadge.textContent = categoryName || 'Ahorcado';
    }
  }

  /**
   * Muestra el modal de resultados.
   * @param {'WON'|'LOST'|'TIME_EXPIRED'} status 
   * @param {string} secretWord 
   * @param {number} totalGuessedWords 
   * @param {number} streak 
   * @param {string} playerName 
   * @param {Array} history 
   * @param {Function} onRestartCallback 
   */
  showResultModal(status, secretWord, totalGuessedWords, streak, playerName, history, onRestartCallback) {
    if (!this.modalEl) return;

    const name = playerName || 'Competidor';

    if (status === 'WON') {
      this.modalTitleEl.textContent = `🎉 ¡Excelente jugada, ${name}!`;
      this.modalTitleEl.className = 'modal-title text-success';
      this.modalMessageEl.innerHTML = `¡Has descubierto la palabra a tiempo!<br>Llevas <strong>${totalGuessedWords}</strong> palabras adivinadas.<br>Racha actual: 🔥 <strong>${streak}</strong>`;
      this.modalActionBtn.textContent = 'Siguiente Palabra';
      this.modalActionBtn.className = 'btn btn-success';
    } else if (status === 'TIME_EXPIRED') {
      this.modalTitleEl.textContent = `⏰ ¡Tiempo Agotado, ${name}!`;
      this.modalTitleEl.className = 'modal-title text-danger';
      this.modalMessageEl.textContent = 'El reloj de cuenta regresiva ha llegado a 00:00 antes de adivinar la palabra.';
      this.modalActionBtn.textContent = 'Reintentar Partida';
      this.modalActionBtn.className = 'btn btn-accent';
    } else {
      this.modalTitleEl.textContent = `💔 ¡Ánimo, ${name}!`;
      this.modalTitleEl.className = 'modal-title text-danger';
      this.modalMessageEl.textContent = 'Se te han agotado los intentos. ¡No te rindas e inténtalo de nuevo!';
      this.modalActionBtn.textContent = 'Intentar de Nuevo';
      this.modalActionBtn.className = 'btn btn-accent';
    }

    if (this.modalWordEl) {
      this.modalWordEl.innerHTML = `La palabra secreta era: <span>${secretWord}</span>`;
    }

    this.renderProgressMatrix(history);

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
   * Muestra un mensaje emergente Toast.
   * @param {string} message 
   * @param {'info'|'warning'|'error'} type 
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

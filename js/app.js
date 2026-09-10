/**
 * Controlador Principal de la Aplicación (App Controller)
 * Unifica competidor, registro unificado con tiempo y modo, pantalla de preparación opaca, 3D, audio y UI.
 */

import { HangmanGame } from './game.js';
import { UIManager } from './ui.js';
import { SoundEffects } from './audio.js';
import { ParticleSystem, ScreenShakeManager } from './particles.js';
import { ThreeHangmanStage } from './threeStage.js';
import { GameTimer } from './timer.js';
import {
  getPlayerName,
  setPlayerName,
  getPreferredTimer,
  setPreferredTimer,
  recordWin,
  recordLoss,
  resetEntireGame
} from './storage.js';

class AppController {
  constructor() {
    this.game = new HangmanGame();
    this.ui = new UIManager();
    this.audio = new SoundEffects();
    this.particles = new ParticleSystem();
    this.shake = new ScreenShakeManager();
    this.timer = new GameTimer();
    this.threeStage = null;

    this.currentMode = 'category'; // 'category' | 'phrase'
    this.currentCategory = 'general';
  }

  init() {
    // Inicializar escenario 3D Three.js
    this.threeStage = new ThreeHangmanStage('three-canvas-container');

    this.bindEvents();
    this.bindTimerEvents();
    this.checkPlayerRegistration();
  }

  /**
   * Configura el comportamiento del reloj de cuenta regresiva.
   */
  bindTimerEvents() {
    this.timer.onTick = (remaining, total, formatted, pct) => {
      const isWarning = remaining <= 15 && remaining > 0;
      this.ui.renderTimer(formatted, pct, isWarning);
    };

    let lastWarnSec = -1;
    this.timer.onWarning = (remainingSec) => {
      if (remainingSec !== lastWarnSec) {
        lastWarnSec = remainingSec;
        this.audio.playTimeWarning();
      }
    };

    this.timer.onExpire = () => {
      if (this.game.status !== 'PLAYING') return;

      this.game.status = 'LOST';
      this.audio.playTimeUpSound();
      this.shake.addTrauma(0.8);
      if (this.threeStage) this.threeStage.updateProgress(6);

      const stats = recordLoss(0, this.game.secretWord.length);

      setTimeout(() => {
        this.ui.updateScoreBadge();
        this.ui.showResultModal(
          'TIME_EXPIRED',
          this.game.secretWord,
          0,
          stats.currentStreak,
          getPlayerName(),
          stats.history,
          () => this.restartGame()
        );
      }, 500);
    };

    // Preajustes rápidos de temporizador en el tablero
    const presetButtons = document.querySelectorAll('[data-timer-preset]');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const totalSecs = parseInt(e.currentTarget.getAttribute('data-timer-preset'), 10) || 120;
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;

        if (this.ui.timerInputMin) this.ui.timerInputMin.value = mins;
        if (this.ui.timerInputSec) this.ui.timerInputSec.value = secs;

        setPreferredTimer(mins, secs);
        presetButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.restartGame();
      });
    });
  }

  /**
   * Comprueba la inscripción del competidor.
   */
  checkPlayerRegistration() {
    const existingName = getPlayerName();
    if (!existingName) {
      this.ui.showRegistrationModal((data) => {
        this.applyRegistrationPayload(data);
      });
    } else {
      this.ui.updateScoreBadge();
      const prefTimer = getPreferredTimer();
      if (this.ui.timerInputMin) this.ui.timerInputMin.value = prefTimer.minutes;
      if (this.ui.timerInputSec) this.ui.timerInputSec.value = prefTimer.seconds;
      this.startNewCategoryGame(this.currentCategory);
    }
  }

  /**
   * Aplica los datos capturados en el formulario inicial unificado.
   * @param {{ name: string, minutes: number, seconds: number, mode: string, category: string, paragraph: string }} data 
   */
  applyRegistrationPayload(data) {
    setPlayerName(data.name);
    setPreferredTimer(data.minutes, data.seconds);
    this.ui.updateScoreBadge();

    this.timer.setDuration(data.minutes, data.seconds);
    this.currentMode = data.mode;

    if (data.mode === 'phrase' && data.paragraph) {
      try {
        this.game.startWithPhrase(data.paragraph);
      } catch (err) {
        this.ui.showToast(err.message, 'warning');
        this.game.startWithCategory('general');
      }
    } else {
      this.currentCategory = data.category || 'general';
      this.game.startWithCategory(this.currentCategory);
    }

    if (this.threeStage) this.threeStage.setVictory(false);
    this.updateUI();

    // Desplegar pantalla de preparación opaca
    this.ui.showReadyOverlay(
      getPlayerName(),
      this.game.categoryName,
      this.timer.getFormattedTime(),
      () => {
        this.timer.start();
        this.ui.showToast(`¡Partida lista para ${data.name}!`, 'info');
      }
    );
  }

  bindEvents() {
    // Cambio de Modo en Tablero
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

    // Botones de selección de Categoría en Tablero
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

    // Formulario de Párrafo Personalizado en Tablero
    const phraseForm = document.getElementById('phrase-form');
    const phraseInput = document.getElementById('phrase-input');

    if (phraseForm) {
      phraseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const paragraph = phraseInput ? phraseInput.value : '';
        try {
          this.timer.stop();
          this.game.startWithPhrase(paragraph);
          if (this.threeStage) this.threeStage.setVictory(false);

          const { minutes, seconds } = this.ui.getTimerDuration();
          setPreferredTimer(minutes, seconds);
          this.timer.setDuration(minutes, seconds);

          this.updateUI();

          this.ui.showReadyOverlay(
            getPlayerName(),
            this.game.categoryName,
            this.timer.getFormattedTime(),
            () => {
              this.timer.start();
              this.ui.showToast('¡Partida iniciada! Descubre la palabra.', 'info');
            }
          );
        } catch (error) {
          this.ui.showToast(error.message, 'warning');
        }
      });
    }

    // Evento de Teclado Físico
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'Ñ' || (key.length === 1 && key >= 'A' && key <= 'Z')) {
        this.handleKeyPress(key);
      }
    });

    // Botón de Reinicio Total del Juego
    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        if (confirm('⚠️ ¿Estás seguro de que deseas reiniciar TODO el juego?\n\nSe eliminarán tu perfil de competidor, historial de cuadros de avance y estadísticas.')) {
          this.timer.stop();
          resetEntireGame();
          this.ui.showToast('Juego reiniciado por completo.', 'info');
          setTimeout(() => location.reload(), 500);
        }
      });
    }

    // Botón de Editar Nombre, Tiempo y Modo del Competidor
    const editPlayerBtn = document.getElementById('edit-player-btn');
    if (editPlayerBtn) {
      editPlayerBtn.addEventListener('click', () => {
        this.timer.pause();
        this.ui.showRegistrationModal((data) => {
          this.applyRegistrationPayload(data);
        });
      });
    }
  }

  /**
   * Inicia una partida con la categoría indicada y despliega el overlay de preparación.
   * @param {string} categoryKey 
   */
  startNewCategoryGame(categoryKey) {
    this.timer.stop();
    this.game.startWithCategory(categoryKey);
    if (this.threeStage) this.threeStage.setVictory(false);

    const { minutes, seconds } = this.ui.getTimerDuration();
    setPreferredTimer(minutes, seconds);
    this.timer.setDuration(minutes, seconds);

    this.updateUI();

    this.ui.showReadyOverlay(
      getPlayerName(),
      this.game.categoryName,
      this.timer.getFormattedTime(),
      () => {
        this.timer.start();
      }
    );
  }

  /**
   * Procesa la pulsación de una letra.
   * @param {string} letter 
   */
  handleKeyPress(letter) {
    if (this.game.status !== 'PLAYING') return;

    this.audio.playKeyClick();
    const result = this.game.guessLetter(letter);

    if (result.isRepeated) {
      this.ui.showToast(`Ya intentaste la letra '${letter}'.`, 'warning');
      return;
    }

    if (result.isCorrect) {
      this.audio.playCorrect();
    } else {
      this.audio.playWrong();
      this.shake.addTrauma(0.5);
    }

    this.updateUI();

    // Evaluar estado final
    if (result.status === 'WON') {
      this.timer.stop();
      const stats = recordWin(this.game.attemptsLeft, this.game.secretWord.length);
      this.audio.playWin();
      this.particles.burstConfetti();
      if (this.threeStage) this.threeStage.setVictory(true);

      setTimeout(() => {
        this.ui.updateScoreBadge();
        this.ui.showResultModal(
          'WON',
          this.game.secretWord,
          stats.total,
          stats.currentStreak,
          getPlayerName(),
          stats.history,
          () => this.restartGame()
        );
      }, 500);
    } else if (result.status === 'LOST') {
      this.timer.stop();
      const stats = recordLoss(0, this.game.secretWord.length);
      this.audio.playGameOver();

      setTimeout(() => {
        this.ui.updateScoreBadge();
        this.ui.showResultModal(
          'LOST',
          this.game.secretWord,
          0,
          stats.currentStreak,
          getPlayerName(),
          stats.history,
          () => this.restartGame()
        );
      }, 500);
    }
  }

  /**
   * Actualiza los elementos de la interfaz.
   */
  updateUI() {
    this.ui.renderCategory(this.game.categoryName);
    this.ui.renderWord(this.game.getWordDisplayState(), (x, y) => {
      this.particles.burstSparkles(x, y, 15);
    });
    this.ui.renderCandidateWords(this.game.candidateWords, this.game.status !== 'PLAYING' ? this.game.secretWord : '');
    this.ui.renderKeyboard(
      this.game.guessedLetters,
      this.game.wrongLetters,
      (letter) => this.handleKeyPress(letter)
    );
    this.ui.renderAttempts(this.game.attemptsLeft);

    if (this.threeStage) {
      const wrongCount = 6 - this.game.attemptsLeft;
      this.threeStage.updateProgress(wrongCount);
    }
  }

  /**
   * Reinicia la partida conservando el modo actual.
   */
  restartGame() {
    if (this.currentMode === 'phrase' && this.game.originalParagraph) {
      this.timer.stop();
      this.game.startWithPhrase(this.game.originalParagraph);
      if (this.threeStage) this.threeStage.setVictory(false);

      const { minutes, seconds } = this.ui.getTimerDuration();
      this.timer.setDuration(minutes, seconds);

      this.updateUI();

      this.ui.showReadyOverlay(
        getPlayerName(),
        this.game.categoryName,
        this.timer.getFormattedTime(),
        () => {
          this.timer.start();
        }
      );
    } else {
      this.startNewCategoryGame(this.currentCategory);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});

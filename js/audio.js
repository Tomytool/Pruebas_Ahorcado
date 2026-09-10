/**
 * Módulo de Efectos de Sonido Sintetizados (Web Audio API)
 * Genera sonidos dinámicos para el juego sin necesidad de archivos externos.
 */

export class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  /**
   * Inicializa el contexto de audio en la primera interacción del usuario.
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Genera un tono sintetizado con frecuencia, tipo de onda y envolvente.
   * @param {number} freq - Frecuencia en Hz
   * @param {string} type - 'sine', 'square', 'sawtooth', 'triangle'
   * @param {number} duration - Duración en segundos
   * @param {number} gainVal - Volúmen (0 a 1)
   */
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Ignorar errores
    }
  }

  playKeyClick() {
    this.playTone(400, 'sine', 0.05, 0.08);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.12);
      }, idx * 60);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.25);

      gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  /**
   * Alerta sonora de advertencia cuando el tiempo está por agotarse.
   */
  playTimeWarning() {
    this.playTone(880, 'square', 0.08, 0.1);
  }

  /**
   * Sonido dramático cuando el temporizador llega a 00:00.
   */
  playTimeUpSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [440, 370, 310, 220];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.3, 0.15);
      }, idx * 100);
    });
  }

  playWin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    arpeggio.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.15);
      }, i * 90);
    });
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [300, 260, 220, 180];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.15);
      }, idx * 120);
    });
  }
}

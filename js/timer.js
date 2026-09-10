/**
 * Módulo de Temporizador / Cuenta Regresiva (GameTimer)
 * Administra el tiempo límite de la partida usando delta-time preciso (performance.now()).
 */

export class GameTimer {
  constructor() {
    this.totalSeconds = 120; // 2 minutos por defecto
    this.remainingSeconds = 120;
    this.isRunning = false;
    this.timerId = null;
    this.lastTime = 0;
    
    // Callbacks
    this.onTick = null;       // (remainingSeconds, totalSeconds, formattedTime) => {}
    this.onWarning = null;    // (remainingSeconds) => {}
    this.onExpire = null;     // () => {}
  }

  /**
   * Configura el tiempo total del temporizador.
   * @param {number} minutes 
   * @param {number} seconds 
   */
  setDuration(minutes = 2, seconds = 0) {
    const mins = Math.max(0, parseInt(minutes, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(seconds, 10) || 0));
    this.totalSeconds = mins * 60 + secs;
    this.remainingSeconds = this.totalSeconds;
  }

  /**
   * Inicia o reinicia la cuenta regresiva.
   */
  start() {
    this.stop();
    if (this.totalSeconds <= 0) return; // Temporizador ilimitado/desactivado

    this.remainingSeconds = this.totalSeconds;
    this.isRunning = true;
    this.lastTime = performance.now();

    this.emitTick();

    this.timerId = setInterval(() => {
      if (!this.isRunning) return;

      const now = performance.now();
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.remainingSeconds = Math.max(0, this.remainingSeconds - delta);
      this.emitTick();

      // Emitir advertencia si restan menos de 15 segundos
      if (this.remainingSeconds <= 15 && this.remainingSeconds > 0 && this.onWarning) {
        this.onWarning(Math.ceil(this.remainingSeconds));
      }

      // Expiración
      if (this.remainingSeconds <= 0) {
        this.stop();
        if (this.onExpire) {
          this.onExpire();
        }
      }
    }, 200);
  }

  /**
   * Pausa la cuenta regresiva.
   */
  pause() {
    this.isRunning = false;
  }

  /**
   * Reanuda la cuenta regresiva.
   */
  resume() {
    if (this.remainingSeconds > 0 && !this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
    }
  }

  /**
   * Detiene por completo la cuenta regresiva.
   */
  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Formatea los segundos restantes a mm:ss.
   * @returns {string}
   */
  getFormattedTime() {
    const totalSecs = Math.ceil(this.remainingSeconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  }

  /**
   * Devuelve el porcentaje de tiempo restante (0 a 100).
   * @returns {number}
   */
  getPercentage() {
    if (this.totalSeconds <= 0) return 100;
    return Math.max(0, (this.remainingSeconds / this.totalSeconds) * 100);
  }

  emitTick() {
    if (this.onTick) {
      this.onTick(this.remainingSeconds, this.totalSeconds, this.getFormattedTime(), this.getPercentage());
    }
  }
}

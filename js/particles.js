/**
 * Módulo de Partículas y Game Feel (Particles & Shake Manager)
 * Maneja los destellos en 2D/3D al acertar letras, confeti al ganar y sacudidas de pantalla.
 */

export class ParticleSystem {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Genera un estallido de chispas luminosas alrededor de una posición específica (ej. letra descubierta).
   * @param {number} x 
   * @param {number} y 
   * @param {number} count 
   */
  burstSparkles(x, y, count = 20) {
    const colors = ['#00f2fe', '#4facfe', '#ffffff', '#ffcb00', '#00e676'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015,
        type: 'sparkle'
      });
    }
  }

  /**
   * Genera una lluvia de confeti festivo para celebrar la victoria.
   */
  burstConfetti() {
    const colors = ['#ff007f', '#00f2fe', '#ffcb00', '#00e676', '#9c27b0', '#ff5722'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.008 + 0.004,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'confetti'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.type === 'confetti') {
        p.rotation += p.vRot;
        p.vy += 0.05; // Gravedad suave
      } else {
        p.vx *= 0.95; // Fricción
        p.vy *= 0.95;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.type === 'confetti') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

/**
 * Gestor de sacudida de pantalla (Screen Shake) desacoplado usando Trauma Decay.
 */
export class ScreenShakeManager {
  constructor() {
    this.trauma = 0;
    this.decay = 1.4; // trauma perdido por segundo
    this.maxOffset = 14; // desfasaje máximo en pixeles
    this._lastTime = performance.now();
    this.targetElement = document.body;

    this.update();
  }

  addTrauma(amount = 0.5) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update() {
    const now = performance.now();
    const dt = (now - this._lastTime) / 1000;
    this._lastTime = now;

    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.decay * dt);
      const shake = this.trauma * this.trauma; // Escala cuadrática para mayor suavidad
      const offsetX = (Math.sin(now * 0.03) * this.maxOffset * shake).toFixed(2);
      const offsetY = (Math.cos(now * 0.04) * this.maxOffset * shake).toFixed(2);
      
      this.targetElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    } else {
      this.targetElement.style.transform = 'none';
    }

    requestAnimationFrame(() => this.update());
  }
}

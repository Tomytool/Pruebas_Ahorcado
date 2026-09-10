/**
 * Escenario 3D del Ahorcado con Three.js
 * Renders an interactive 3D gallows, dynamic lighting, and animated mannequin character.
 */

export class ThreeHangmanStage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.parts = [];
    this.characterGroup = null;
    this.gallowsGroup = null;
    this.ropeMesh = null;

    // Control de animación y ratón
    this.mouse = { x: 0, y: 0 };
    this.targetCameraPos = { x: 0, y: 1.5, z: 7 };
    this.time = 0;
    this.visiblePartsCount = 0;
    this.isVictory = false;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js no está cargado aún.');
      return;
    }

    const width = this.container.clientWidth || 300;
    const height = this.container.clientHeight || 320;

    // 1. Escena
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0e2629, 0.08);

    // 2. Cámara
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.5, 7.5);

    // 3. Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xd97736, 1.5, 10);
    pointLight.position.set(-3, 4, 2);
    this.scene.add(pointLight);

    // 5. Construcción de Horca 3D y Personaje
    this.createGallows();
    this.createCharacter();

    // 6. Eventos
    window.addEventListener('resize', () => this.onWindowResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.onWindowResize());
      observer.observe(this.container);
    }

    // 7. Bucle de Animación
    this.animate();
  }

  createGallows() {
    this.gallowsGroup = new THREE.Group();

    // Materiales de Madera y Metal Neón
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x185359,
      roughness: 0.6,
      metalness: 0.2
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xd97736,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0xd97736,
      emissiveIntensity: 0.2
    });

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0d3539,
      roughness: 0.8
    });

    // Base de la Horca
    const baseGeo = new THREE.BoxGeometry(2.5, 0.25, 1.8);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(-0.5, -2, 0);
    baseMesh.receiveShadow = true;
    this.gallowsGroup.add(baseMesh);

    // Poste Vertical
    const poleGeo = new THREE.BoxGeometry(0.2, 4.2, 0.2);
    const poleMesh = new THREE.Mesh(poleGeo, woodMat);
    poleMesh.position.set(-1.4, 0.1, 0);
    poleMesh.castShadow = true;
    this.gallowsGroup.add(poleMesh);

    // Travesaño Superior Horizontal
    const beamGeo = new THREE.BoxGeometry(2.4, 0.2, 0.2);
    const beamMesh = new THREE.Mesh(beamGeo, woodMat);
    beamMesh.position.set(-0.3, 2.1, 0);
    beamMesh.castShadow = true;
    this.gallowsGroup.add(beamMesh);

    // Soporte Diagonal de Refuerzo
    const supportGeo = new THREE.BoxGeometry(0.15, 1.1, 0.15);
    const supportMesh = new THREE.Mesh(supportGeo, woodMat);
    supportMesh.position.set(-1.0, 1.6, 0);
    supportMesh.rotation.z = -Math.PI / 4;
    this.gallowsGroup.add(supportMesh);

    // Cuerda del Ahorcado
    const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97736, roughness: 0.9 });
    this.ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
    this.ropeMesh.position.set(0.6, 1.7, 0);
    this.gallowsGroup.add(this.ropeMesh);

    this.scene.add(this.gallowsGroup);
  }

  createCharacter() {
    this.characterGroup = new THREE.Group();
    this.characterGroup.position.set(0.6, 1.3, 0); // Posición suspendida bajo la cuerda

    const cyanNeonMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.3
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9
    });

    // 1. Cabeza (Índice 0)
    const headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, cyanNeonMat);
    headGroup.add(headMesh);
    // Ojos Neón estilizados
    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 0.05, 0.3);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.12, 0.05, 0.3);
    headGroup.add(eyeL, eyeR);
    headGroup.position.set(0, -0.4, 0);
    this.characterGroup.add(headGroup);

    // 2. Torso (Índice 1)
    const torsoGroup = new THREE.Group();
    const torsoGeo = new THREE.CylinderGeometry(0.25, 0.18, 1.1, 16);
    const torsoMesh = new THREE.Mesh(torsoGeo, cyanNeonMat);
    torsoGroup.add(torsoMesh);
    torsoGroup.position.set(0, -1.2, 0);
    this.characterGroup.add(torsoGroup);

    // 3. Brazo Izquierdo (Índice 2)
    const armLGroup = new THREE.Group();
    const armLGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.9, 12);
    const armLMesh = new THREE.Mesh(armLGeo, jointMat);
    armLMesh.position.set(0, -0.4, 0);
    armLGroup.add(armLMesh);
    armLGroup.position.set(-0.35, -0.8, 0);
    armLGroup.rotation.z = Math.PI / 8;
    this.characterGroup.add(armLGroup);

    // 4. Brazo Derecho (Índice 3)
    const armRGroup = new THREE.Group();
    const armRGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.9, 12);
    const armRMesh = new THREE.Mesh(armRGeo, jointMat);
    armRMesh.position.set(0, -0.4, 0);
    armRGroup.add(armRMesh);
    armRGroup.position.set(0.35, -0.8, 0);
    armRGroup.rotation.z = -Math.PI / 8;
    this.characterGroup.add(armRGroup);

    // 5. Pierna Izquierda (Índice 4)
    const legLGroup = new THREE.Group();
    const legLGeo = new THREE.CylinderGeometry(0.09, 0.07, 1.0, 12);
    const legLMesh = new THREE.Mesh(legLGeo, cyanNeonMat);
    legLMesh.position.set(0, -0.45, 0);
    legLGroup.add(legLMesh);
    legLGroup.position.set(-0.18, -1.8, 0);
    legLGroup.rotation.z = Math.PI / 16;
    this.characterGroup.add(legLGroup);

    // 6. Pierna Derecha (Índice 5)
    const legRGroup = new THREE.Group();
    const legRGeo = new THREE.CylinderGeometry(0.09, 0.07, 1.0, 12);
    const legRMesh = new THREE.Mesh(legRGeo, cyanNeonMat);
    legRMesh.position.set(0, -0.45, 0);
    legRGroup.add(legRMesh);
    legRGroup.position.set(0.18, -1.8, 0);
    legRGroup.rotation.z = -Math.PI / 16;
    this.characterGroup.add(legRGroup);

    // Ocultar todas las partes inicialmente
    this.parts = [headGroup, torsoGroup, armLGroup, armRGroup, legLGroup, legRGroup];
    this.parts.forEach(part => {
      part.visible = false;
      part.scale.set(0, 0, 0);
    });

    this.scene.add(this.characterGroup);
  }

  /**
   * Actualiza el número de partes visibles del ahorcado (0 a 6).
   * @param {number} wrongCount (Número de fallos cometido: 6 - intentosRestantes)
   */
  updateProgress(wrongCount) {
    this.visiblePartsCount = wrongCount;

    this.parts.forEach((part, index) => {
      if (index < wrongCount) {
        if (!part.visible) {
          part.visible = true;
          // Animación de aparición (Bounce/Pop Scale)
          part.scale.set(0.1, 0.1, 0.1);
          let progress = 0;
          const popInterval = setInterval(() => {
            progress += 0.15;
            const s = Math.min(1, Math.sin(progress * Math.PI) * 1.2 + progress);
            part.scale.set(s, s, s);
            if (progress >= 1) {
              part.scale.set(1, 1, 1);
              clearInterval(popInterval);
            }
          }, 16);
        }
      } else {
        part.visible = false;
        part.scale.set(0, 0, 0);
      }
    });
  }

  /**
   * Activa animación especial de victoria o reseteo.
   */
  setVictory(isWin) {
    this.isVictory = isWin;
    if (isWin) {
      this.targetCameraPos = { x: 0.6, y: 0, z: 4.5 };
    } else {
      this.targetCameraPos = { x: 0, y: 1.5, z: 7.5 };
    }
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.renderer || !this.scene || !this.camera) return;

    this.time += 0.03;

    // Bamboleo/Oscilación suave del personaje suspendido
    if (this.characterGroup && this.visiblePartsCount > 0) {
      const swingAngle = Math.sin(this.time * 1.5) * 0.08 * (this.visiblePartsCount / 6);
      this.characterGroup.rotation.z = swingAngle;
    }

    // Rotación suave del personaje al ganar
    if (this.isVictory && this.characterGroup) {
      this.characterGroup.rotation.y += 0.03;
    } else if (this.characterGroup) {
      this.characterGroup.rotation.y = 0;
    }

    // Movimiento suave de cámara siguiendo el ratón (Parallax 3D)
    const targetX = this.targetCameraPos.x + this.mouse.x * 0.4;
    const targetY = this.targetCameraPos.y + this.mouse.y * 0.3;

    this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
    this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.05;

    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }
}

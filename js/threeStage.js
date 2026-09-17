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

    // 4. Luces (Ajustadas para maniquí cerámico/arcilla suave mate con sombras limpias)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Luz de contorno / acento cyan suave para integrar silueta contra fondo oscuro
    const pointLight = new THREE.PointLight(0x00f2fe, 0.45, 12);
    pointLight.position.set(-3, 4, 3);
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

    // Materiales de Madera Oscura y Acentos Arcade
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x143c44,
      roughness: 0.65,
      metalness: 0.15
    });

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c252a,
      roughness: 0.85
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

    // Cuerda del Ahorcado (Tono cáñamo dorado suave)
    const ropeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.78, 12);
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xcaa472,
      roughness: 0.85,
      metalness: 0.05
    });
    this.ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
    this.ropeMesh.position.set(0.6, 1.71, 0);
    this.ropeMesh.castShadow = true;
    this.gallowsGroup.add(this.ropeMesh);

    this.scene.add(this.gallowsGroup);
  }

  /**
   * Crea el muñeco humanoide estilizado (estilo mannequin minimalista blanco/gris suave).
   * Basado en la estética de figura de arcilla / porcelana de diseño.
   */
  createCharacter() {
    this.characterGroup = new THREE.Group();
    this.characterGroup.position.set(0.6, 1.32, 0); // Suspendido en el extremo inferior de la cuerda

    // Material del maniquí: Blanco grisáceo mate ultra suave (Clean Clay Mannequin)
    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0xebedf2,
      roughness: 0.36,
      metalness: 0.02
    });

    const ropeNooseMat = new THREE.MeshStandardMaterial({
      color: 0xcaa472,
      roughness: 0.85,
      metalness: 0.05
    });

    // -------------------------------------------------------------
    // PARTE 1: Cabeza + Cuello + Lazo de Horca (Índice 0)
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();

    // Cabeza: Esfera limpia y lisa (sin rasgos faciales toscos)
    const headGeo = new THREE.SphereGeometry(0.36, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, mannequinMat);
    headMesh.position.set(0, -0.36, 0);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Cuello esbelto
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.22, 20);
    const neckMesh = new THREE.Mesh(neckGeo, mannequinMat);
    neckMesh.position.set(0, -0.68, 0);
    neckMesh.castShadow = true;
    headGroup.add(neckMesh);

    // Lazo de la soga alrededor del cuello
    const nooseGeo = new THREE.TorusGeometry(0.12, 0.032, 12, 24);
    const nooseMesh = new THREE.Mesh(nooseGeo, ropeNooseMat);
    nooseMesh.rotation.x = Math.PI / 2;
    nooseMesh.position.set(0, -0.69, 0);
    headGroup.add(nooseMesh);

    // Nudo corredizo de la soga
    const knotGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const knotMesh = new THREE.Mesh(knotGeo, ropeNooseMat);
    knotMesh.position.set(0.12, -0.69, 0.02);
    headGroup.add(knotMesh);

    this.characterGroup.add(headGroup);

    // -------------------------------------------------------------
    // PARTE 2: Torso estilizado + Pelvis (Índice 1)
    // -------------------------------------------------------------
    const torsoGroup = new THREE.Group();

    // Hombros curvados
    const shoulderBarGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.58, 16);
    const shoulderBarMesh = new THREE.Mesh(shoulderBarGeo, mannequinMat);
    shoulderBarMesh.rotation.z = Math.PI / 2;
    shoulderBarMesh.position.set(0, -0.84, 0);
    shoulderBarMesh.castShadow = true;
    torsoGroup.add(shoulderBarMesh);

    const shoulderLGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const shoulderLMesh = new THREE.Mesh(shoulderLGeo, mannequinMat);
    shoulderLMesh.position.set(-0.29, -0.84, 0);
    const shoulderRMesh = new THREE.Mesh(shoulderLGeo, mannequinMat);
    shoulderRMesh.position.set(0.29, -0.84, 0);
    torsoGroup.add(shoulderLMesh, shoulderRMesh);

    // Pecho / Caja torácica suave
    const chestGeo = new THREE.CylinderGeometry(0.23, 0.165, 0.55, 24);
    const chestMesh = new THREE.Mesh(chestGeo, mannequinMat);
    chestMesh.position.set(0, -1.14, 0);
    chestMesh.scale.set(1, 1, 0.8); // Suave aplanamiento en Z
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // Cintura y Pelvis estilizada
    const pelvisGeo = new THREE.CylinderGeometry(0.165, 0.185, 0.38, 24);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, mannequinMat);
    pelvisMesh.position.set(0, -1.56, 0);
    pelvisMesh.scale.set(1, 1, 0.78);
    pelvisMesh.castShadow = true;
    torsoGroup.add(pelvisMesh);

    // Articulaciones de cadera
    const hipGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const hipL = new THREE.Mesh(hipGeo, mannequinMat);
    hipL.position.set(-0.13, -1.72, 0);
    const hipR = new THREE.Mesh(hipGeo, mannequinMat);
    hipR.position.set(0.13, -1.72, 0);
    torsoGroup.add(hipL, hipR);

    this.characterGroup.add(torsoGroup);

    // -------------------------------------------------------------
    // PARTE 3: Brazo Izquierdo (Índice 2)
    // -------------------------------------------------------------
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.30, -0.86, 0);
    armLGroup.rotation.z = 0.06; // Caída relajada vertical

    // Brazo superior
    const upperArmGeo = new THREE.CylinderGeometry(0.058, 0.048, 0.52, 16);
    const upperArmL = new THREE.Mesh(upperArmGeo, mannequinMat);
    upperArmL.position.set(0, -0.26, 0);
    upperArmL.castShadow = true;
    armLGroup.add(upperArmL);

    // Codo
    const elbowGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const elbowL = new THREE.Mesh(elbowGeo, mannequinMat);
    elbowL.position.set(0, -0.52, 0);
    armLGroup.add(elbowL);

    // Antebrazo
    const foreArmGeo = new THREE.CylinderGeometry(0.048, 0.040, 0.50, 16);
    const foreArmL = new THREE.Mesh(foreArmGeo, mannequinMat);
    foreArmL.position.set(0, -0.77, 0);
    foreArmL.castShadow = true;
    armLGroup.add(foreArmL);

    // Mano estilizada (cápsula suave sin dedos exagerados)
    const handGeo = new THREE.SphereGeometry(0.040, 12, 12);
    const handL = new THREE.Mesh(handGeo, mannequinMat);
    handL.position.set(0, -1.04, 0);
    handL.scale.set(0.8, 1.6, 0.35);
    handL.castShadow = true;
    armLGroup.add(handL);

    this.characterGroup.add(armLGroup);

    // -------------------------------------------------------------
    // PARTE 4: Brazo Derecho (Índice 3)
    // -------------------------------------------------------------
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.30, -0.86, 0);
    armRGroup.rotation.z = -0.06;

    const upperArmR = new THREE.Mesh(upperArmGeo, mannequinMat);
    upperArmR.position.set(0, -0.26, 0);
    upperArmR.castShadow = true;
    armRGroup.add(upperArmR);

    const elbowR = new THREE.Mesh(elbowGeo, mannequinMat);
    elbowR.position.set(0, -0.52, 0);
    armRGroup.add(elbowR);

    const foreArmR = new THREE.Mesh(foreArmGeo, mannequinMat);
    foreArmR.position.set(0, -0.77, 0);
    foreArmR.castShadow = true;
    armRGroup.add(foreArmR);

    const handR = new THREE.Mesh(handGeo, mannequinMat);
    handR.position.set(0, -1.04, 0);
    handR.scale.set(0.8, 1.6, 0.35);
    handR.castShadow = true;
    armRGroup.add(handR);

    this.characterGroup.add(armRGroup);

    // -------------------------------------------------------------
    // PARTE 5: Pierna Izquierda (Índice 4)
    // -------------------------------------------------------------
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.13, -1.74, 0);
    legLGroup.rotation.z = 0.015;

    // Muslo
    const thighGeo = new THREE.CylinderGeometry(0.075, 0.062, 0.65, 16);
    const thighL = new THREE.Mesh(thighGeo, mannequinMat);
    thighL.position.set(0, -0.32, 0);
    thighL.castShadow = true;
    legLGroup.add(thighL);

    // Rodilla
    const kneeGeo = new THREE.SphereGeometry(0.062, 12, 12);
    const kneeL = new THREE.Mesh(kneeGeo, mannequinMat);
    kneeL.position.set(0, -0.65, 0);
    legLGroup.add(kneeL);

    // Pantorrilla
    const calfGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.65, 16);
    const calfL = new THREE.Mesh(calfGeo, mannequinMat);
    calfL.position.set(0, -0.98, 0);
    calfL.castShadow = true;
    legLGroup.add(calfL);

    // Tobillo
    const ankleGeo = new THREE.SphereGeometry(0.052, 12, 12);
    const ankleL = new THREE.Mesh(ankleGeo, mannequinMat);
    ankleL.position.set(0, -1.30, 0);
    legLGroup.add(ankleL);

    // Pie horizontal alargado (apuntando hacia adelante)
    const footGeo = new THREE.BoxGeometry(0.072, 0.045, 0.17);
    const footL = new THREE.Mesh(footGeo, mannequinMat);
    footL.position.set(0, -1.33, 0.045);
    footL.castShadow = true;
    legLGroup.add(footL);

    this.characterGroup.add(legLGroup);

    // -------------------------------------------------------------
    // PARTE 6: Pierna Derecha (Índice 5)
    // -------------------------------------------------------------
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.13, -1.74, 0);
    legRGroup.rotation.z = -0.015;

    const thighR = new THREE.Mesh(thighGeo, mannequinMat);
    thighR.position.set(0, -0.32, 0);
    thighR.castShadow = true;
    legRGroup.add(thighR);

    const kneeR = new THREE.Mesh(kneeGeo, mannequinMat);
    kneeR.position.set(0, -0.65, 0);
    legRGroup.add(kneeR);

    const calfR = new THREE.Mesh(calfGeo, mannequinMat);
    calfR.position.set(0, -0.98, 0);
    calfR.castShadow = true;
    legRGroup.add(calfR);

    const ankleR = new THREE.Mesh(ankleGeo, mannequinMat);
    ankleR.position.set(0, -1.30, 0);
    legRGroup.add(ankleR);

    const footR = new THREE.Mesh(footGeo, mannequinMat);
    footR.position.set(0, -1.33, 0.045);
    footR.castShadow = true;
    legRGroup.add(footR);

    this.characterGroup.add(legRGroup);

    // Inicializar lista ordenada de las 6 partes
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
    this.updateCameraTarget();
  }

  updateCameraTarget() {
    const isMobile = (this.container && (this.container.clientWidth < 450 || this.container.clientHeight < 160));
    if (this.isVictory) {
      this.targetCameraPos = isMobile ? { x: 0.6, y: 0, z: 5.0 } : { x: 0.6, y: 0, z: 4.2 };
    } else {
      this.targetCameraPos = isMobile ? { x: 0, y: 0.2, z: 7.2 } : { x: 0, y: 0.15, z: 5.7 };
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
    this.updateCameraTarget();
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

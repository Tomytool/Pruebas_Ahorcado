# 🎮 El Juego del Ahorcado 3D

> Plataforma pedagógica e interactiva de adivinanza de palabras impulsada por gráficos 3D con Three.js, temporizador de cuenta regresiva configurable, cuadros de avance y experiencia de competencia personalizada.

**Autor:** Tomytool  
**Licencia:** ISC  

---

## 🌟 Descripción y Temática

**El Juego del Ahorcado 3D** es una aplicación web moderna que transforma la dinámica tradicional del ahorcado en una experiencia inmersiva y educativa. El objetivo principal es descubrir la palabra secreta seleccionada (o extraída de un texto personalizado) adivinando las letras antes de que se agoten los intentos o concluya el tiempo límite.

El proyecto incorpora un escenario tridimensional interactivo desarrollado en **Three.js**, efectos de audio sintetizados mediante la **Web Audio API**, y un sistema de competencia adaptado tanto para uso pedagógico como para partidas rápidas.

> [!NOTE]
> La aplicación no requiere dependencias de backend ni instalación pesada; se ejecuta directamente en el navegador utilizando HTML5, CSS3 moderno y módulos JavaScript ES6+.

---

## ✨ Características Principales

- **Escenario 3D Interactivo (Three.js)**:
  - Renderizado tridimensional en tiempo real de la horca y un personaje tipo maniquí neón.
  - Animación progresiva por cada intento fallido y movimiento de cámara tipo *parallax* al interactuar con el ratón.
  - Efectos visuales de victoria con rotación 3D del personaje y fuegos artificiales de partículas.
- **Perfil del Competidor y Cuadros de Avance**:
  - Formulario de inscripción inicial para personalizar el nombre del jugador.
  - Cuadros de avance (*Progress Matrix*) que muestran el historial visual reciente de partidas ganadas y perdidas.
- **Temporizador de Cuenta Regresiva Configurable**:
  - Reloj neón interactivo con anillo SVG animado.
  - Configuración manual de minutos y segundos o accesos rápidos (*presets*).
  - Alerta visual y sonora cuando restan menos de 15 segundos.
- **Modos de Juego Versátiles**:
  - **Categorías Rápidas**: Elección de temas predefinidos (Tecnología, Países y Ciudades, Animales, Cultura General).
  - **Párrafo Personalizado**: Ingrese cualquier texto o párrafo; la aplicación extrae las palabras candidatas (≥ 3 letras), las muestra en una columna lateral y selecciona una al azar.
- **Pantalla de Preparación Opaca ("¿Estás listo?")**:
  - Confirmación previa a revelar el tablero para dar tiempo de preparación al competidor antes de iniciar el tiempo.
- **Diseño Mobile-First y Responsivo**:
  - Columna lateral (*sidebar*) de palabras descubribles integrada al tablero de juego.
  - Fichas de letras (`.letter-tile`) y teclado virtual con dimensiones adaptativas (`clamp()`).
  - Ajuste dinámico de cámara 3D mediante `ResizeObserver`.
- **Efectos de Audio y Partículas**:
  - Sintetizador de audio nativo (Web Audio API) para efectos sonoros de pulsación, acierto, error y victoria.
  - Motor de partículas de brillo, confeti y vibración de pantalla (*screen shake*).

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3**: Estructura semántica, variables CSS, layout en CSS Grid & Flexbox, glassmorphism y tipografías Google Fonts (*Outfit* y *Inter*).
- **JavaScript (ES6+)**: Módulos nativos (`import`/`export`), sintaxis moderna async/await, clases ES6 y gestión de estado local (`localStorage`).
- **Three.js (r128)**: Gráficos y renderizado 3D WebGL con iluminación direccional, sombras suaves y niebla ambiental.
- **Web Audio API**: Generación de efectos sonoros generativos sintetizados por código sin necesidad de archivos MP3/WAV pesados.

---

## 🚀 Inicio Rápido

Para ejecutar la aplicación localmente:

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   ```

2. **Abrir en el navegador**:
   Abre el archivo `index.html` en cualquier navegador web moderno o sirve la carpeta mediante un servidor HTTP local:

   ```bash
   # Utilizando Python
   python -m http.server 8080

   # O utilizando npx serve
   npx serve .
   ```

3. Navega a `http://localhost:8080` en tu navegador.

---

## ⌨️ Controles e Interacción

- **Teclado Físico**: Puedes presionar directamente las teclas (`A-Z`, `Ñ`) de tu teclado para adivinar letras.
- **Teclado Virtual / Pantalla Táctil**: Toca o haz clic en cualquier letra del teclado en pantalla.
- **Navegación 3D**: Desplaza el ratón sobre el escenario 3D para ajustar la perspectiva de la cámara en tiempo real.

---

## 👤 Autor

Desarrollado con dedicación por **Tomytool**.

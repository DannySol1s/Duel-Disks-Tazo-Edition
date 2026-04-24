# ⚔️ Duel Disks: Tazo Edition (Duelo de Quintetos)

¡Bienvenido a **Duel Disks: Tazo Edition**! Un juego de cartas temático de Yu-Gi-Oh! diseñado con la estética de los clásicos tazos coleccionables. Enfrenta a dos duelistas en una batalla épica de 5 rondas donde la estrategia y la suerte deciden al ganador.

![Duelo de Quintetos](https://images.ygoprodeck.com/images/cards_small/83764718.jpg) <!-- Imagen de ejemplo o banner si existiera -->

## 🎮 Características del Juego

- **Duelo de Quintetos**: Cada jugador recibe 5 cartas aleatorias de la base de datos de Yu-Gi-Oh! (Speed Duel / Rush Duel).
- **Selección Ciega**: Los jugadores eligen su carta y modo de batalla en secreto, pasando el dispositivo o simplemente ocultando su elección.
- **Modos de Combate**: Elige entre **Modo Ataque** (⚔️) o **Modo Defensa** (🛡️) para cada ronda.
- **Animaciones Dinámicas**:
  - Efectos de "volteo" (flip) al revelar cartas.
  - Cuenta regresiva dramática con efectos de relámpagos.
  - Resplandores (glow) para los ganadores y desvanecimiento para los perdedores.
- **Diseño Premium**: Interfaz moderna con *glassmorphism*, modo oscuro, y tipografías elegantes (Cinzel Decorative & Exo 2).
- **Totalmente Responsivo**: Optimizado para verse en pantalla completa sin necesidad de desplazarse.

## 📜 Reglas de Batalla

El juego utiliza una lógica de resolución basada en los atributos clásicos de Yu-Gi-Oh!:

1. **⚔️ vs ⚔️**: Gana la carta con el mayor **ATK**.
2. **⚔️ vs 🛡️**: El atacante debe superar la **DEF** del defensor. Si la DEF es mayor o igual, el defensor gana la ronda.
3. **🛡️ vs 🛡️**: Si ambos jugadores eligen defensa, el ganador se decide por el **Nivel (★)** de la carta.
4. **Empate**: Si los valores son idénticos, la ronda se declara empate.

*El primer duelista en ganar 3 rondas se lleva la victoria total.*

## 🚀 Tecnologías Utilizadas

- **Core**: [Svelte 5](https://svelte.dev/) (usando Runes como `$state` y `$derived`).
- **Lógica**: TypeScript para un tipado seguro y manejo de estados.
- **Estilos**: Vanilla CSS con variables personalizadas y animaciones complejas.
- **API**: [YGOPRODeck API](https://db.ygoprodeck.com/api-guide/) para obtener datos e imágenes reales de las cartas.

## 🛠️ Instalación y Uso

1. **Clonar el repositorio**:
   ```sh
   git clone https://github.com/DannySol1s/Duel-Disks-Tazo-Edition.git
   ```
2. **Instalar dependencias**:
   ```sh
   npm install
   ```
3. **Ejecutar en modo desarrollo**:
   ```sh
   npm run dev
   ```
4. **Abrir en el navegador**:
   Visita `http://localhost:5173` para empezar el duelo.

## 📁 Estructura del Proyecto

- `src/lib/gameStore.ts`: Motor lógico del juego y manejo de estados de Svelte.
- `src/lib/components/`: Componentes reutilizables como `BattlePhase`, `RevealCountdown`, y `ResultPhase`.
- `src/app.css`: Sistema de diseño global y tokens de estilo.
- `src/routes/+page.svelte`: Punto de entrada principal y layout del juego.

---

Desarrollado con ❤️ por **Antigravity** en colaboración con el usuario. ¡Que comience el duelo!

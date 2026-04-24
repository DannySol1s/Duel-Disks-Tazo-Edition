<div align="center">

# ⚔️ Duel Disks: Tazo Edition
### Experiencia nostálgica de duelos Yu-Gi-Oh! estilo Tazos coleccionables

![Svelte](https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

*"¿Estás listo para liberar el poder de tus cartas en un formato legendario?"*

</div>

---

## 🧐 ¿Qué es?

**Duel Disks: Tazo Edition** es un proyecto interactivo que fusiona la mecánica clásica de los juegos de cartas coleccionables (TCG) con la nostalgia de los **tazos** de los años 90 y 2000. El propósito principal es ofrecer un simulador de "Duelo de Quintetos" (5 vs 5) donde la estrategia visual y la rapidez de decisión son fundamentales.

El proyecto nació como un desafío técnico para explorar las nuevas capacidades de **Svelte 5** (Runes), implementando un sistema de juego de selección ciega totalmente reactivo. La motivación principal fue recrear la emoción de los duelos de Yu-Gi-Oh! mediante una interfaz moderna, minimalista y altamente animada que se sienta como un producto premium en la palma de la mano.

En este juego, los usuarios no solo compiten con números; experimentan una narrativa visual a través de efectos de revelación, relámpagos de victoria y una estética de *dark mode* con acentos dorados y violetas que evocan el Reino de los Duelos.

---

## ✨ Características Principales

| Emoji | Nombre | Descripción |
| :---: | :--- | :--- |
| 🎴 | **Duelo de Quintetos** | Sistema de batalla 5 vs 5 con cartas aleatorias obtenidas vía API. |
| 🔒 | **Selección Ciega** | Mecánica de juego local por turnos donde cada jugador oculta su estrategia. |
| ⚔️ | **Modos Híbridos** | Resolución de conflictos basada en ATK vs ATK, ATK vs DEF o Nivel de carta. |
| ⚡ | **Reveal Countdown** | Animación dramática de 3 segundos con efectos de relámpago y flip 3D. |
| 📱 | **Responsive Pro** | Interfaz adaptativa que garantiza una experiencia sin scroll en cualquier pantalla. |
| 💎 | **Glassmorphism** | Diseño visual basado en transparencias, desenfoques y gradientes vibrantes. |

---

## 🗃️ Contenido del Juego

| # | Emoji + Nombre | Categoría | Descripción Breve |
| :---: | :--- | :--- | :--- |
| 1 | 🐉 Monstruos Normales | Contenido API | Cartas base con estadísticas puras de ATK y DEF. |
| 2 | 🪄 Monstruos de Efecto | Contenido API | Criaturas avanzadas provenientes del formato Speed Duel. |
| 3 | 🃏 Tazos Digitales | UI Component | Representación circular/cuadrada animada de las cartas clásicas. |
| 4 | 🏆 Historial de Rondas | Lógica | Registro detallado de cada enfrentamiento y su ganador. |

---

## 🏗️ Arquitectura del Proyecto

### 🛠️ Stack Tecnológico
```text
root
├── Svelte 5 (Frontend Framework)
├── TypeScript (Programming Language)
├── Vite (Build Tool)
└── YGOPRODeck API (Data Source)
```

### 📁 Estructura de Archivos
```text
src/
├── lib/
│   ├── components/
│   │   ├── BattlePhase.svelte      # Orquestador principal del duelo
│   │   ├── RevealCountdown.svelte  # Animaciones de cuenta regresiva y efectos
│   │   ├── ResultPhase.svelte      # Pantalla final y resumen de puntuación
│   │   └── Tazo.svelte             # Componente base de la carta/tazo
│   ├── api.ts                      # Configuración de fetch a YGOPRODeck
│   ├── gameStore.ts                # Estado global (Writable stores & Lógica)
│   └── types.ts                    # Interfaces de TypeScript para el juego
├── routes/
│   └── +page.svelte                # Layout principal y router de fases
└── app.css                         # Tokens de diseño y estilos globales
```

---

## ⚙️ Arquitectura Técnica Central

Diagrama de flujo del ciclo de vida de un duelo:

```text
[ INICIO ] --> ( Cargar Cartas API ) --> [ FASE P1 ] --( Elige Carta/Modo )--+
                                                                             |
      +----------------------------------------------------------------------+
      v
[ FASE P2 ] --( Elige Carta/Modo )--> [ REVEALING ] --( Animación Countdown )--+
                                                                             |
      +----------------------------------------------------------------------+
      v
[ REVEAL RESULT ] --( ¿Fin de Juego? )--[ SÍ ]--> [ RESULTADOS FINALES ]
      |                                  |
      +--[ NO (Siguiente Ronda) ]--------+
```

---

## 🚀 Cómo Ejecutar

### Prerrequisitos
- Node.js (v18 o superior)
- npm o pnpm

### Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/DannySol1s/Duel-Disks-Tazo-Edition.git

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

### Comandos Útiles
| Comando | Descripción |
| :--- | :--- |
| `npm run build` | Genera el bundle de producción en la carpeta /dist. |
| `npm run preview` | Previsualiza localmente la versión de producción. |
| `npm run check` | Ejecuta validaciones de tipos y lints de Svelte. |

---

## 📐 Diseño Responsivo

| Rango | Dispositivo Target | Comportamiento del Layout |
| :--- | :--- | :--- |
| `> 1024px` | Desktop | Contenedor centrado a 1000px, cartas en 5 columnas grandes. |
| `768px - 1024px` | Tablets | Grid adaptativo, se prioriza el tamaño de la carta sobre el margen. |
| `< 768px` | Mobile | Stack vertical en revelación, fuentes escaladas para legibilidad. |

---

## 🎨 Sistema de Diseño

```css
/* Tokens principales en app.css */
:root {
  --clr-bg: #07090f;            /* Fondo profundo */
  --clr-gold: #e8a020;          /* Acento legendario */
  --clr-violet: #7c3aed;        /* Energía mágica */
  --font-title: 'Cinzel Decorative'; /* Tipografía de fantasía */
  --font-body: 'Exo 2';         /* Tipografía tecnológica */
}
```

---

## 🎓 Valor Formativo

> "El desarrollo de este proyecto permitió dominar la transición entre estados complejos y la sincronización de animaciones de alto rendimiento en el navegador."

- **Aprendizajes Clave**:
  - Implementación de **Svelte 5 Runes** para reactividad granular.
  - Creación de sistemas de juego por fases (FSM - Finite State Machine).
  - Animaciones 3D avanzadas y manejo de *z-index* dinámico.
  - Optimización de consumo de APIs externas de alto volumen de datos.

---

## ✍️ Autor

**Danny Solís**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DannySol1s)

---

<div align="center">

© 2026 Duel Disks: Tazo Edition — *¡Cree en el corazón de las cartas!*

</div>

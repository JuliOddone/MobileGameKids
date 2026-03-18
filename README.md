# 🌸 Sanrio Slots — Kawaii Fortune 🎰

Un juego de **slots con recompensa variable** (slot-loop) con estética de la franquicia **Sanrio**, diseñado para ser adictivo y visualmente impactante. Incluye personajes como Hello Kitty, Cinnamoroll, Pompompurin, My Melody y Keroppi.

> Construido con **HTML + CSS + JavaScript** puro — sin frameworks, sin dependencias, sin build tools. Abrí `index.html` y jugá.

---

## 🎮 Demo

Abrí `index.html` en cualquier navegador moderno. Para experiencia móvil, usá las DevTools de Chrome (F12 → toggle device toolbar → 375×812).

---

## ✨ Características

### Mecánicas de Juego
| Feature | Descripción |
|---|---|
| **Slot Machine 3x3** | 3 rodillos con 7 símbolos (5 personajes + Wild + Bonus) |
| **Hold & Spin** | Congelá rodillos después de un giro y re-girá los demás a mitad de costo |
| **Cascadas** | Las ganancias encadenan cascadas con multiplicadores x1 → x2 → x3 → x5 → x8 |
| **Bonus Round** | 3 símbolos Bonus → mini-juego interactivo "Café Kawaii" (elegí 3 de 9 regalos) |
| **Near-Miss** | Sistema psicológico de "casi ganaste" para mantener engagement |
| **Auto-Spin & Turbo** | Modo automático + modo turbo para giros rápidos |

### Economía y Social
| Feature | Descripción |
|---|---|
| **Torneo Semanal** | Tabla de líderes simulada con premios al Top 10 |
| **Misiones** | 3 misiones activas que rotan al completarse (ej: "Ganá 3 veces con Cinnamoroll") |
| **Club VIP** | 4 niveles (Bronce → Plata → Oro → Diamante) con bonificaciones de payout y XP |
| **Daily Bonus** | Calendario de 7 días con recompensas progresivas |
| **Social Proof** | Ticker inferior con "jugadores ganando" para simular actividad en vivo |

### Retención y Progresión
| Feature | Descripción |
|---|---|
| **Pase de Temporada** | 30 niveles de recompensas desbloqueables con XP |
| **Eventos Limitados** | "Semana [Personaje]" con payout x1.5 — rota semanalmente |
| **50+ Logros** | Sistema completo de achievements con recompensas en monedas |
| **Colección** | 15 variantes de personajes para desbloquear (álbum kawaii) |
| **XP y Niveles** | Sistema de experiencia con bonus por subir de nivel |

### Visual y Narrativa
| Feature | Descripción |
|---|---|
| **Modo Oscuro** | Tema premium púrpura/neón pastel toggle |
| **Intro Cinemática** | Splash animado "Café Kawaii Fortune" con CTA |
| **Poderes de Personaje** | Cada personaje tiene un poder único que se activa aleatoriamente |
| **Narrativa (Lore)** | Historia del Café Kawaii Fortune con fichas de personaje |
| **Confetti & Efectos** | Partículas, screen shake, flash, monedas volando, glow |

---

## 🗂️ Estructura del Proyecto

```
MobileGame/
├── index.html          # Estructura HTML principal (modals, HUD, reels, intro)
├── style.css           # Sistema de diseño completo + modo oscuro
├── game.js             # Config, datos (achievements, season pass, VIP), estado
├── gameplay.js         # Motor de giro, Hold & Spin, cascadas, bonus round
├── features.js         # UI, misiones, torneo, VIP, logros, dark mode, init
└── assets/
    ├── hello_kitty.png
    ├── cinnamoroll.png
    ├── pompompurin.png
    ├── my_melody.png
    ├── keroppi.png
    └── wild.png
```

---

## 🚀 Cómo Ejecutar

### Opción 1: Abrir directamente
```
Doble click en index.html
```

### Opción 2: Servidor local (recomendado)
```bash
# Con Python
python -m http.server 8080

# Con Node.js
npx serve .

# Con PHP
php -S localhost:8080
```

### Opción 3: Live Server (VS Code)
Instalá la extensión **Live Server** y hacé click derecho → "Open with Live Server" en `index.html`.

---

## 🎨 Stack Tecnológico

- **HTML5** — Estructura semántica, meta tags para PWA
- **CSS3** — Variables CSS, glassmorphism, backdrop-filter, keyframe animations, responsive
- **JavaScript ES6+** — Async/await, módulos, localStorage, Canvas API (confetti)
- **Google Fonts** — Fredoka (display) + Nunito (body)
- **Sin dependencias** — Cero npm, cero build, cero frameworks

---

## 🧠 Mecánicas de Adicción (Game Design)

El juego implementa las siguientes técnicas de diseño conductual:

| Técnica | Implementación |
|---|---|
| **Variable Ratio Schedule** | Probabilidad de ganar variable; ganancias pequeñas frecuentes, grandes raras |
| **Near-Miss Effect** | 2 símbolos iguales + casi-match en el 3er rodillo |
| **Loss Disguised as Win** | Ganar menos de lo apostado pero con animación de celebración |
| **Streak System** | Victorias consecutivas multiplican recompensas (badge de fuego visible) |
| **Sunk Cost Fallacy** | Barra de XP siempre cerca del próximo nivel |
| **Collection Drive** | 15 variantes de personajes para completar el álbum |
| **Endowed Progress** | Empezás con 1000 monedas para sentir que ya tenés algo que perder |
| **Social Proof** | Ticker de "otros jugadores ganando" crea sensación de oportunidad |
| **Cascading Rewards** | Multiplicadores crecientes dan dopamina incremental |

---

## 📱 Compatibilidad

| Plataforma | Estado |
|---|---|
| Chrome (Desktop) | ✅ Completo |
| Chrome (Android) | ✅ Completo |
| Safari (iOS) | ✅ Completo |
| Firefox | ✅ Completo |
| Edge | ✅ Completo |

> El juego usa `backdrop-filter` y `dvh` que requieren navegadores modernos (2020+).

---

## 🔧 Configuración

Toda la configuración del juego está en `game.js` → objeto `CONFIG`:

```javascript
// Modificar probabilidades
symbols: [{ weight: 20, payout: 5 }, ...]  // peso = frecuencia, payout = multiplicador

// Modificar apuestas disponibles
betLevels: [5, 10, 25, 50, 100, 250, 500]

// Modificar dificultad
nearMissChance: 0.18        // Probabilidad de near-miss (0-1)
miniJackpotInterval: [40, 60] // Mini-jackpot cada 40-60 giros
powerChance: 0.08           // Probabilidad de activar poder de personaje
```

---

## 📄 Licencia

Este proyecto es de uso personal y educativo. Los personajes de Sanrio son propiedad de **Sanrio Co., Ltd.** y se usan con fines de fan art / no comercial.

---

## 🤝 Contribuir

1. Hacé un fork del repositorio
2. Creá tu branch (`git checkout -b feature/nueva-feature`)
3. Hacé commit (`git commit -m 'Agregar nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Abrí un Pull Request

---

<p align="center">
  Hecho con 💖 y mucho ✨ kawaii ✨
</p>

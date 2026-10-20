# Pomodoro Cotopaxi

Aplicación móvil de la **Academia Cotopaxi** para estudiar con la técnica Pomodoro. Funciona sin conexión, sin publicidad y sin crear una cuenta: al abrirla se entra directo al temporizador.

| Característica | Detalle |
| :--- | :--- |
| Ciclos Pomodoro | Estudio → Descanso corto → … → Descanso largo tras 4 pomodoros (configurable) |
| Control de sesión | Iniciar, pausar, continuar y reiniciar (con confirmación) |
| Segundo plano | El tiempo se calcula con *timestamps* persistidos: no se pierde al bloquear el celular ni al cerrar la app |
| Alarma | Notificación local con sonido (canal de alarma) y vibración al terminar cada fase, programada aunque la app esté cerrada |
| Ajustes | Duración de cada fase y pomodoros por ciclo, con restablecimiento a 25 / 5 / 15 / 4 |
| Offline | Todo se guarda en el dispositivo (AsyncStorage); no hay servidor ni autenticación |

---

## Stack técnico

| Área | Tecnología |
| :--- | :--- |
| Framework | Expo SDK 58 (React Native 0.88 + React 19), ejecutable en **Expo Go** |
| Lenguaje | TypeScript en modo `strict` (sin `any`) |
| Estado global | Zustand 5 con middleware `persist` |
| Persistencia | `@react-native-async-storage/async-storage` 2 |
| Navegación | React Navigation 7 (`native-stack`) + `react-native-screens` |
| Notificaciones | `expo-notifications` (notificaciones locales programadas) |
| Pruebas | Jest 30 + `jest-expo` + `react-test-renderer` |
| Calidad | ESLint (`@react-native`) + Prettier |

---

## Requisitos

- **Node.js** ≥ 22.13
- La app **Expo Go** en el celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), en una versión compatible con el SDK 58
- El celular y la computadora conectados a la **misma red Wi-Fi**

No hace falta instalar JDK, Android Studio ni el Android SDK para ejecutar la app con Expo Go.

---

## Instalación y ejecución

```bash
npm install
```

```bash
npx expo start
```

En la terminal aparece un código QR:

- **Android:** abre Expo Go y pulsa *Scan QR code*.
- **iPhone:** escanea el QR con la cámara y ábrelo en Expo Go.

La primera vez la app pide permiso para enviar notificaciones; acéptalo para recibir la alarma.

Si el celular no está en la misma red (o la red bloquea la conexión), usa un túnel:

```bash
npx expo start --tunnel
```

### Generar un APK (opcional)

Expo Go sirve para desarrollar y probar. Para un APK instalable sin Expo Go se usa EAS Build (requiere una cuenta gratuita de Expo):

```bash
npx eas-cli build -p android --profile preview
```

---

## Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm start` / `npx expo start` | Inicia el servidor de Expo y muestra el QR para Expo Go |
| `npm run android` | Inicia Expo y abre la app en un emulador o celular Android conectado |
| `npm run ios` | Inicia Expo y abre la app en el simulador de iOS (requiere macOS) |
| `npm run lint` | Ejecuta ESLint con las reglas del proyecto |
| `npm test` | Ejecuta las pruebas unitarias y de componentes |
| `npx tsc --noEmit` | Verifica los tipos de TypeScript |

---

## Estructura del proyecto

```text
index.ts                     Punto de entrada (registerRootComponent de Expo)
App.tsx                      Raíz: SafeArea, navegación y sincronización de alarmas
app.json                     Configuración de Expo (nombre, ícono, plugins)
assets/                      Íconos y splash
src/
├── components/
│   ├── HeaderSettingsButton.tsx   Botón "Ajustes" de la cabecera
│   └── SettingStepper.tsx         Control − / + reutilizable
├── hooks/
│   ├── useTimerTicker.ts          Tick en primer plano y re-sincronización con AppState
│   └── useNotificationSync.ts     Permisos y programación de alarmas
├── navigation/
│   ├── RootNavigator.tsx          Stack tipado (Timer, Settings)
│   └── types.ts                   RootStackParamList
├── screens/
│   ├── TimerScreen.tsx            Pantalla principal
│   └── SettingsScreen.tsx         Pantalla de ajustes
├── services/
│   └── notifications.ts           Canal, permisos y alarmas con expo-notifications
├── store/
│   ├── types.ts                   Tipos del estado
│   ├── timerLogic.ts              Lógica pura (fases, timestamps, validación)
│   └── usePomodoroStore.ts        Store de Zustand persistido
├── theme/                         Colores y tipografía (DESIGN.md)
└── utils/
    └── formatTime.ts              Segundos → MM:SS
__tests__/                         48 pruebas en 9 archivos
docs/
├── ARQUITECTURA.md                Diseño interno y decisiones técnicas
├── HISTORIAS_DE_USUARIO.md        Trazabilidad HU → código → pruebas
└── skills/                        Guías de navegación, estado y pruebas
```

---

## Reglas de desarrollo

El proyecto sigue las reglas de [`CLAUDE.md`](CLAUDE.md). ESLint hace cumplir las que se pueden automatizar:

| Regla | Cómo se verifica |
| :--- | :--- |
| TypeScript estricto, sin `any` | `strict: true` + `@typescript-eslint/no-explicit-any: error` |
| Sin `console.log` | `no-console: error` |
| Sin estilos en línea | `react-native/no-inline-styles: error`; todo va en `StyleSheet.create()` o en `src/theme` |
| Sin imports duplicados o sin usar | `no-duplicate-imports` y `@typescript-eslint/no-unused-vars` en `error` |
| Criterio de aceptación | Cada incremento termina con `npx tsc --noEmit`, `npm run lint` y `npm test` sin errores |

La paleta y la tipografía están en [`DESIGN.md`](DESIGN.md) e implementadas en [`src/theme`](src/theme).

---

## Documentación adicional

- [Arquitectura](docs/ARQUITECTURA.md): estado, cálculo con *timestamps*, alarmas y decisiones técnicas.
- [Historias de usuario](docs/HISTORIAS_DE_USUARIO.md): qué parte del código y qué pruebas cubren cada HU.
- [Guía de diseño](DESIGN.md)
- Skills: [navegación](docs/skills/skill_de_navegaci_n.md), [estado](docs/skills/skill_de_gesti_n_de_estado.md), [pruebas y compilación](docs/skills/skill_de_pruebas_y_compilaci_n.md)

---

## Limitaciones conocidas

- **Expo Go solo admite notificaciones locales.** Es lo que usa la app; las notificaciones *push* (remotas) no se usan.
- **Modo silencio:** en Android el canal de alarma usa el flujo de audio de **alarma**, que suena aunque el celular esté en vibración. Con "No molestar" suena solo si el usuario da a la app el acceso a "No molestar". En iOS, Expo Go no puede saltarse el modo silencio (eso requiere el permiso de alertas críticas de Apple).
- **Alarmas exactas (Android 12+):** sin el permiso "Alarmas y recordatorios" la alarma puede llegar con unos minutos de retraso. Dentro de Expo Go este permiso depende de Expo Go, no de la app; con un APK propio (EAS Build) se controla desde `app.json`.
- **Pruebas en dispositivo:** las pruebas automáticas simulan `expo-notifications` y AsyncStorage; el comportamiento real de alarmas y segundo plano debe comprobarse en un celular.

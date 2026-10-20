# Historias de usuario - Trazabilidad

Relación entre cada historia de usuario de [`CLAUDE.md`](../CLAUDE.md), el código que la implementa y las pruebas que la verifican.

**Estado:** ✅ implementada y probada con Jest · ⚠️ implementada con una limitación conocida. Ninguna HU se ha probado todavía en un dispositivo físico.

| HU | Nombre | Estado |
| :--- | :--- | :---: |
| HU-001 | Control de sesión | ✅ |
| HU-002 | Ciclos Pomodoro | ✅ |
| HU-003 | Ejecución en background / app cerrada | ✅ |
| HU-004 | Notificaciones y alarma | ⚠️ |
| HU-005 | Ajustes de tiempos | ✅ |
| HU-006 | Offline y sin anuncios | ✅ |

---

## HU-001 · Control de sesión

> Inicio, pausa, reanudación y reinicio con confirmación de temporizador.

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Iniciar | `startTimer` guarda `targetEndTime` · botón "Iniciar" en `TimerScreen` | `usePomodoroStore.test.ts` › inicia guardando el timestamp de fin |
| Pausar y reanudar sin perder tiempo | `pauseTimer` / `startTimer` · el botón cambia a "Pausar" y "Continuar" | `usePomodoroStore.test.ts` › pausa y reanuda sin perder tiempo · `TimerScreen.test.tsx` › cambia a Pausar y luego a Continuar |
| Reiniciar con confirmación | `resetTimer` · `Alert` con "Cancelar" / "Reiniciar" | `usePomodoroStore.test.ts` › reinicia la fase actual · `TimerScreen.test.tsx` › pide confirmación antes de reiniciar |

"Reiniciar" vuelve al inicio de la **fase actual**; no reinicia el ciclo completo. El botón está desactivado si no hay una sesión en curso o en pausa.

---

## HU-002 · Ciclos Pomodoro

> Transición automática entre Estudio, Descanso Corto y Descanso Largo (por defecto 4 ciclos).

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Estudio → Descanso corto | `getNextPhase` en `timerLogic.ts` | `timerLogic.test.ts` › pasa de estudio a descanso corto |
| Descanso largo tras N pomodoros | `getNextPhase` compara con `pomodorosPerCycle` | `timerLogic.test.ts` › pasa a descanso largo al completar el 4.º pomodoro |
| Reinicio del ciclo | El contador vuelve a 0 tras el descanso largo | `timerLogic.test.ts` › reinicia el ciclo tras el descanso largo |
| Transición automática | `resolveTimer` encadena la siguiente fase sin intervención | `usePomodoroStore.test.ts` › sincroniza el tiempo al volver de segundo plano |
| Indicador visual | Fase en `TimerScreen` y un punto por pomodoro del ciclo | `TimerScreen.test.tsx` › muestra la fase de estudio y 25:00 |

---

## HU-003 · Ejecución en background / app cerrada

> Cálculo de tiempo transcurrido utilizando timestamps persistentes.

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Tiempo basado en timestamps | `targetEndTime` + `computeRemainingSeconds` | `timerLogic.test.ts` › computeRemainingSeconds |
| Re-sincronizar al volver a primer plano | `useTimerTicker` escucha `AppState` y llama a `syncBackgroundTime` | `timerLogic.test.ts` › recalcula el tiempo restante tras bloquear el celular |
| Fases terminadas con la app cerrada | `resolveTimer` avanza por todas las fases vencidas | `timerLogic.test.ts` › transiciona de fase si terminó con la app cerrada · encadena varias fases |
| Sobrevivir al cierre de la app | `persist` guarda el temporizador en AsyncStorage y se re-sincroniza al rehidratar | Cubierto por la lógica anterior; la rehidratación real se debe comprobar en dispositivo |

---

## HU-004 · Notificaciones y alarma ⚠️

> Notificaciones locales y audio/vibración que respete/sobrescriba estados en silencio y solicite permisos iniciales.

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Solicitar permisos iniciales | `initializeNotifications` al montar `App` | `useNotificationSync.test.tsx` › solicita permisos al iniciar · `notifications.test.ts` › pide permisos si aún no están concedidos |
| Avisar si faltan permisos | `Alert` con opción de abrir "Alarmas y recordatorios" | `useNotificationSync.test.tsx` › ofrece abrir los ajustes si faltan las alarmas exactas |
| Notificación local al terminar la fase | `schedulePhaseAlarms` con un trigger `DATE` en cada fin de fase | `notifications.test.ts` › programa una alarma por cada fin de fase futuro |
| Suena con la app cerrada | Un ciclo completo de alarmas programado por adelantado | `useNotificationSync.test.tsx` › programa un ciclo completo de alarmas |
| Cancelar al pausar o reiniciar | `cancelPhaseAlarms` | `useNotificationSync.test.tsx` › cancela las alarmas al pausar · `notifications.test.ts` › cancela solo las alarmas de la app |
| Sonido y vibración | Canal `MAX` con `sound: 'default'` y `vibrationPattern` | `notifications.test.ts` › crea el canal de alarma en Android |
| Sobrescribir modo silencio | Audio por el flujo de **alarma** (`AndroidAudioUsage.ALARM`) y `bypassDnd: true` | `notifications.test.ts` › crea el canal de alarma en Android (verifica `usage: ALARM`) |

**Limitación:** en Android la alarma suena aunque el celular esté en vibración (usa el volumen de alarma), pero con "No molestar" solo suena si el usuario da a la app ese acceso. En iOS, Expo Go no puede saltarse el modo silencio, porque eso requiere el permiso de alertas críticas de Apple. Dentro de Expo Go el permiso de alarmas exactas depende de Expo Go, así que la alarma puede llegar con unos minutos de retraso.

---

## HU-005 · Ajustes de tiempos

> Configuración de duraciones y reseteo a valores por defecto (25 / 5 / 15 / 4).

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Configurar duraciones | `SettingsScreen` con un `SettingStepper` por fase | `SettingsScreen.test.tsx` › modifica la duración de estudio desde el stepper |
| Configurar pomodoros por ciclo | Stepper "Pomodoros antes del descanso largo" | `SettingsScreen.test.tsx` › modifica los pomodoros por ciclo |
| Restablecer valores por defecto | `resetSettingsToDefault` con confirmación | `SettingsScreen.test.tsx` › restablece los valores por defecto tras confirmar · `usePomodoroStore.test.ts` › restablece los valores por defecto |
| Valores dentro de rango | `sanitizeSettings` y límites en `SettingStepper` | `timerLogic.test.ts` › sanitizeSettings · `SettingStepper.test.tsx` › deshabilita los botones en los límites |
| Guardado automático | `persist` en AsyncStorage | Mock de AsyncStorage en `jest.setup.ts` |
| No alterar la sesión en curso | `updateSettings` solo cambia el tiempo visible si el temporizador está inactivo | `usePomodoroStore.test.ts` › no altera una sesión en curso al cambiar ajustes |

---

## HU-006 · Offline y sin anuncios

> Sin autenticación, acceso directo a la app principal y almacenamiento local.

| Criterio | Implementación | Prueba |
| :--- | :--- | :--- |
| Sin autenticación | `RootNavigator` abre directo en `Timer` | `App.test.tsx` › abre directamente en el temporizador sin pantalla de login |
| Almacenamiento local | AsyncStorage; no hay llamadas de red ni servidor | Revisión de dependencias: ninguna librería de red ni de anuncios |
| Sin anuncios | No hay SDK de publicidad en `package.json` | Revisión de dependencias |

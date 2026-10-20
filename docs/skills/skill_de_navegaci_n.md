# Navigation Skill - Reglas e Instrucciones para la Navegación

Esta guía define cómo debe implementarse y gestionarse la navegación en la aplicación móvil de Pomodoro utilizando React Navigation.

---

## 1. Arquitectura de Navegación

La aplicación debe contar con un acceso directo sin registro ni pantallas de inicio de sesión (cumpliendo la **HU-006**).

### Estructura de Pantallas
1. **TimerScreen (Pantalla Principal):**
   - Muestra la cuenta regresiva activa o pausada.
   - Indicador de la fase actual (Estudio, Descanso Corto, Descanso Largo).
   - Contador de pomodoros completados en el ciclo actual.
   - Controles: Iniciar, Pausar, Reiniciar.
   - Botón de acceso a la pantalla de Ajustes.

2. **SettingsScreen (Pantalla de Ajustes):**
   - Configuración de tiempos para cada fase (HU-005).
   - Configuración de número de pomodoros por ciclo largo.
   - Botón para restablecer a los valores por defecto.

---

## 2. Tipado Estricto de Navegación

Toda la navegación debe estar fuertemente tipada con TypeScript. No utilizar `any` para las rutas ni parámetros.

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Timer: undefined;
  Settings: undefined;
};
```

---

## 3. Reglas de Implementación

1. **Sin Encabezados Innecesarios:** El header debe usar los colores del tema oficial definido en `DESIGN.md`.
2. **Animaciones Fluidas:** Transiciones estándar sin sobrecargar el hilo de UI.
3. **Persistencia de Estado:** Al navegar entre `TimerScreen` y `SettingsScreen`, el temporizador debe mantener su cuenta en ejecucion sin reiniciarse ni re-renderizarse innecesariamente.
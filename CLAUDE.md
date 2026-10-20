# Reglas y Directivas para Claude Code - App Pomodoro Academia Cotopaxi

## Información General del Proyecto
Aplicación móvil con React Native y TypeScript para la Academia Cotopaxi enfocada en la técnica Pomodoro sin publicidad, sin cuenta y con funcionamiento offline.

---

## Reglas Estrictas de Desarrollo

1. **Regla de Atomicidad:** 
   Cada incremento debe enfocarse en un solo componente o pantalla a la vez. No avances al siguiente archivo hasta que el actual compile sin errores.

2. **Regla de TypeScript Estricto:** 
   Todo código generado debe usar TypeScript tipado. Está estrictamente prohibido usar el tipo `any`.

3. **Regla de Limpieza Móvil:** 
   Cada vez que crees o modifiques un componente, asegúrate de remover los `console.log` de desarrollo y verificar que no haya imports duplicados o sin usar.

4. **Regla de Estilos Unificados:** 
   No uses estilos en línea (`style={{...}}`). Todos los estilos deben declararse utilizando la utilidad `StyleSheet.create()` al final del archivo del componente o importarse desde el archivo de diseño global (`DESIGN.md` / `theme.ts`).

5. **Regla de Criterio de Aceptación:** 
   Antes de dar una tarea por terminada, debes ejecutar el comando de pruebas y confirmar de forma textual que la compilación fue exitosa.

---

## Cobertura de Historias de Usuario (HU)

- **HU-001 (Control de Sesión):** Inicio, pausa, reanudación y reinicio con confirmación de temporizador.
- **HU-002 (Ciclos Pomodoro):** Transición automática entre Estudio, Descanso Corto y Descanso Largo (por defecto 4 ciclos).
- **HU-003 (Ejecución en Background / App Cerrada):** Cálculo de tiempo transcurrido utilizando *timestamps* persistentes (evitar pérdida de tiempo al bloquear o cerrar la app).
- **HU-004 (Notificaciones y Alarma):** Integración de notificaciones locales y audio/vibración que respete/sobrescriba estados en silencio y solicite permisos iniciales.
- **HU-005 (Ajustes de Tiempos):** Configuración de duraciones y reseteo a valores por defecto (25m estudio, 5m descanso corto, 15m descanso largo, 4 pomodoros).
- **HU-006 (Offline & Sin Anuncios):** Sin autenticación, acceso directo a la app principal y almacenamiento local.

---

## Habilidades y Guías Asociadas
- **Navegación:** Revisar `navigation-skill.md`
- **Gestión de Estado:** Revisar `state-skill.md`
- **Pruebas y Compilación:** Revisar `testing-skill.md`
- **Guía de Diseño:** Revisar `DESIGN.md`
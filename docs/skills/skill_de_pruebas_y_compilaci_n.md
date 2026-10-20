# Testing & Compilation Skill - Guía Paso a Paso

Esta guía especifica los comandos y procedimientos obligatorios para compilar, probar y verificar la aplicación.

---

## 1. Comandos de Verificación y Compilación

Antes de dar cualquier tarea o incremento por terminado, se deben ejecutar secuencialmente los siguientes comandos:

### Step 1: Chequeo de Tipos de TypeScript
```bash
npx tsc --noEmit
```
*Criterio de éxito:* Cero errores de TypeScript en la salida.

### Step 2: Linter y Limpieza de Código
```bash
npm run lint
```
*Criterio de éxito:* Sin advertencias de imports no usados ni variables no declaradas.

### Step 3: Pruebas Unitarias
```bash
npm test
```
*Criterio de éxito:* Todas las pruebas unitarias del temporizador y cálculo de timestamps deben pasar exitosamente.

---

## 2. Compilación del APK (Android)

Para generar el ejecutable para la demostración en el dispositivo físico:

```bash
# Limpiar caché de compilación
cd android && ./gradlew clean

# Compilar APK de Release
./gradlew assembleRelease
```
El archivo resultante estará ubicado en: `android/app/build/outputs/apk/release/app-release.apk`.

---

## 3. Verificación del Criterio de Aceptación (Obligatorio para Claude Code)

Cada actualización de código debe culminar con la confirmación explícita:
> *"Se ha ejecutado `npx tsc --noEmit` y `npm test`. La compilación fue exitosa y sin errores de TypeScript."*
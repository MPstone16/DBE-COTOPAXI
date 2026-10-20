# Guía de Diseño Visual y Colores - Academia Cotopaxi

Esta especificación de diseño establece la paleta cromática oficial y la jerarquía de estilos aplicable a todos los componentes de la aplicación.

---

## 1. Paleta de Colores (Organizada de Principal a Secundario)

| Nivel / Uso | Código Hex | Nombre del Color | Aplicación en la Interfaz |
| :--- | :--- | :--- | :--- |
| **Principal (60%)** | `#141759` | Azul Oscuro Institucional | Fondo principal de pantallas, barras superiores, textos destacados. |
| **Secundario (20%)** | `#54578C` | Azul Medio Muted | Contenedores de tarjetas, bordes, temporizador secundario, elementos pasivos. |
| **Acento Primario (10%)** | `#D9A91A` | Dorado Principal | Botones de acción principal (Iniciar, Continuar), barra de progreso activa. |
| **Acento Secundario (5%)** | `#F2D194` | Dorado Claro | Indicadores de fase, highlights, botones secundarios o de pausa. |
| **Fondo / Superficie (5%)** | `#F2F2F2` | Blanco Humo / Gris Claro | Textos sobre fondos oscuros, fondos de tarjetas claras o modales. |

---

## 2. Tipografía y Jerarquía

- **Temporizador Gigante:** 64px - Bold - Color: `#F2F2F2` o `#D9A91A`
- **Títulos de Fase:** 24px - SemiBold - Color: `#F2D194`
- **Texto General / Subtítulos:** 16px - Regular - Color: `#F2F2F2`
- **Etiquetas de Ajuste:** 14px - Medium - Color: `#54578C` o `#F2F2F2`

---

## 3. Ejemplo de Implementación en React Native

```typescript
// src/theme/colors.ts
export const Colors = {
  primary: '#141759',
  secondary: '#54578C',
  accentPrimary: '#D9A91A',
  accentSecondary: '#F2D194',
  backgroundLight: '#F2F2F2',
} as const;

// Ejemplo de StyleSheet estricto (según regla de estilos unificados)
import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.accentPrimary,
  },
  button: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```
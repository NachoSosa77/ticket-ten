# Project Documentation Rules (Non-Obvious Only)

- El README no documenta prácticamente nada (solo título); la fuente de verdad está en código/config.
- El dominio funcional actual es admin de eventos/funciones/entradas bajo `src/app/admin/eventos/**`; no asumir storefront público implementado.
- La validación de formularios está duplicada intencionalmente (cliente + server action) con Zod para UX inmediata y seguridad de backend.
- La estructura de formularios está centralizada en `FormBuilder` + `*.config.ts` + `*.schema.ts`; documentar nuevas pantallas siguiendo ese patrón, no con JSX ad-hoc por campo.
- Los mensajes/formatos están orientados a `es-AR` (incluyendo zona horaria fija para utilidades de fecha), relevante para explicar comportamientos de hora y locale.

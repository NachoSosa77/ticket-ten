# Project Debug Rules (Non-Obvious Only)

- No hay comando de tests en `package.json`; para depurar lógica hay que reproducir vía UI (`npm run dev`) o inspección de server actions.
- Prisma depende de `DATABASE_URL` y `engine: "classic"` en `prisma.config.ts`; errores de conexión/migración suelen ser de entorno antes que de código.
- El cliente Prisma en `src/lib/prisma.ts` se cachea en `globalThis` fuera de producción; si cambias logging/conexión, reiniciar dev server para validar.
- Las mutaciones críticas usan server actions con `redirect(...)`; al debuggear, recordar que el flujo puede terminar por redirección y no por retorno visible en cliente.
- El parseo de `datetime-local` está encapsulado en `parseDatetimeLocal()` (`src/lib/datetime.ts`); bugs de hora deben revisarse ahí, no en `new Date(...)` del navegador.

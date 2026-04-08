# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- No hay framework de tests configurado: en `package.json` solo existen `dev`, `build`, `start`, `lint`; no hay comando para test único ni suite.
- Comandos reales del repo: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Prisma no tiene scripts npm: usar CLI directa desde raíz (configurada por `prisma.config.ts`): `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`.
- `prisma.config.ts` usa `engine: "classic"` y `DATABASE_URL` obligatoria; sin eso, Prisma falla.
- Patrón de formularios obligatorio: `*.config.ts` (estructura UI) + `*.schema.ts` (Zod) + `FormBuilder` genérico.
- Las server actions validan SIEMPRE con `safeParse` y devuelven `{ success, message, errors }`; mantener ese contrato para que formularios cliente mapeen errores por campo.
- Navegación post-acción está centralizada en actions con `revalidatePath(...)` + `redirect(...)`; no manejar redirecciones desde formularios cliente.
- Parseo de `datetime-local`: usar `parseDatetimeLocal()` (`src/lib/datetime.ts`) para evitar offsets UTC implícitos del constructor nativo.
- Render de fecha para UI está fijado a `es-AR` + `America/Argentina/Buenos_Aires` en utilidades; no usar `toLocaleString()` directo para pantallas funcionales.
- Convención de datos nullable al persistir: strings opcionales via `value || null` (description/imageUrl/maxPerPurchase), no string vacío.
- Hay acoplamiento implícito con admin inicial: `createEventAction` setea `createdById: 1`; no quitarlo sin resolver autenticación/seed.
- Alias obligatorio de imports internos: `@/*` -> `src/*` (definido en `tsconfig.json`).
- No se detectaron reglas externas adicionales (`CLAUDE.md`, `.cursorrules`, `.cursor/rules`, `.github/copilot-instructions.md`, `.roorules`).

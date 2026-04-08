# Project Coding Rules (Non-Obvious Only)

- Mantener el patrón de formularios en 3 piezas: `*.config.ts` (UI), `*.schema.ts` (Zod) y componente cliente que delega render en `FormBuilder`.
- En server actions, conservar contrato de retorno `{ success, message, errors }` con `errors` por campo; los forms cliente consumen exactamente esa forma.
- Para `datetime-local`, convertir con `parseDatetimeLocal()` de `src/lib/datetime.ts`; no usar `new Date(value)` directo en acciones.
- Persistencia de opcionales string: normalizar a `null` (`value || null`) en Prisma para evitar vacíos inconsistentes.
- `createEventAction` depende de `createdById: 1` (acoplamiento temporal a admin seed); cambios aquí requieren resolver auth/seed primero.
- Usar alias interno `@/*` para imports del proyecto (mapeado a `src/*`), consistente con el código actual.

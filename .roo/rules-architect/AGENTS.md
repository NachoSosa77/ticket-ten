# Project Architecture Rules (Non-Obvious Only)

- Arquitectura mutacional centrada en Server Actions (`src/app/actions/*.actions.ts`) con secuencia fija: validar (Zod) -> persistir (Prisma) -> `revalidatePath` -> `redirect`.
- Las páginas admin dependen de query params de éxito/error (ej. `?success=created`) para feedback post-redirect; mantener esos códigos alineados entre actions y pages.
- Existe acoplamiento temporal de dominio: creación de eventos fija `createdById: 1`, lo que asume admin semillado previo.
- `Event` -> `EventSession` es cascada en Prisma, pero `Order` referencia `EventSession` con `onDelete: Restrict`; no modelar borrado físico de sesiones con órdenes.
- La capa de formularios abstrae tipos de campo en `src/lib/forms/types.ts`; extender tipos/UX requiere primero ampliar esa abstracción común.

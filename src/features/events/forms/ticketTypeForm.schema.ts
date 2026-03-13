import { z } from "zod";

export const ticketTypeFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stockTotal: z.coerce
    .number()
    .int("El stock debe ser entero")
    .min(1, "El stock debe ser al menos 1"),
  maxPerPurchase: z
    .union([z.coerce.number().int().min(1, "Debe ser al menos 1"), z.nan()])
    .optional()
    .transform((value) => (Number.isNaN(value) ? undefined : value)),
  isActive: z.boolean().default(true),
});

export type TicketTypeFormInput = z.infer<typeof ticketTypeFormSchema>;

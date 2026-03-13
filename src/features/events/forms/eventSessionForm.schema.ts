import { z } from "zod";

export const eventSessionFormSchema = z.object({
  venueName: z
    .string()
    .trim()
    .min(3, "El lugar debe tener al menos 3 caracteres"),
  startsAt: z.string().trim().min(1, "Debes indicar una fecha y hora"),
});

export type EventSessionFormInput = z.infer<typeof eventSessionFormSchema>;

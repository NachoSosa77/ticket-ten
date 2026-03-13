import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  slug: z
    .string()
    .trim()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener minúsculas, números y guiones",
    ),
  description: z.string().trim().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  category: z.enum(["CONCERT", "SHOW", "THEATER"], {
    errorMap: () => ({ message: "Selecciona una categoría válida" }),
  }),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

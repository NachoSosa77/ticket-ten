import { z } from "zod";

export const buyerLoginFormSchema = z.object({
  email: z.string().trim().email("Debes ingresar un email válido"),
  password: z.string().min(1, "Debes ingresar tu contraseña"),
});

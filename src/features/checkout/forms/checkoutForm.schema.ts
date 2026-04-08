import { z } from "zod";

type CheckoutSchemaTicketType = {
  id: number;
  maxPerPurchase: number | null;
};

export const checkoutBuyerSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  buyerEmail: z.string().trim().email("Debes ingresar un email válido"),
});

export function buildCheckoutFormSchema(
  ticketTypes: CheckoutSchemaTicketType[],
) {
  const shape: Record<string, z.ZodTypeAny> = {
    buyerName: checkoutBuyerSchema.shape.buyerName,
    buyerEmail: checkoutBuyerSchema.shape.buyerEmail,
  };

  for (const ticketType of ticketTypes) {
    shape[`quantity_${ticketType.id}`] = z.coerce
      .number()
      .int("La cantidad debe ser un número entero")
      .min(0, "La cantidad no puede ser negativa")
      .refine(
        (value) =>
          ticketType.maxPerPurchase == null ||
          value <= ticketType.maxPerPurchase,
        {
          message:
            ticketType.maxPerPurchase == null
              ? "Cantidad inválida"
              : `Máximo por compra: ${ticketType.maxPerPurchase}`,
        },
      );
  }

  return z.object(shape).superRefine((values, ctx) => {
    const hasAnyQuantity = ticketTypes.some((ticketType) => {
      const value = values[`quantity_${ticketType.id}`];
      return typeof value === "number" && value > 0;
    });

    if (!hasAnyQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantities"],
        message: "Debes seleccionar al menos una entrada.",
      });
    }
  });
}

export type CheckoutSchemaTicketTypeInput = CheckoutSchemaTicketType;

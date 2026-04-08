import { FormConfig } from "@/lib/forms/types";

type CheckoutTicketTypeConfig = {
  id: number;
  name: string;
  price: string;
  availableStock: number;
  maxPerPurchase: number | null;
};

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value));
}

export function buildCheckoutFormConfig(
  ticketTypes: CheckoutTicketTypeConfig[],
): FormConfig {
  return {
    fields: [
      {
        name: "buyerName",
        label: "Nombre y apellido",
        type: "text",
        required: true,
        placeholder: "Ej: Juan Pérez",
      },
      {
        name: "buyerEmail",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "juan@email.com",
      },
      ...ticketTypes.map((ticketType) => ({
        name: `quantity_${ticketType.id}`,
        label: `${ticketType.name} (${formatPrice(ticketType.price)})`,
        type: "number" as const,
        required: false,
        placeholder: "0",
        description:
          ticketType.maxPerPurchase != null
            ? `Disponibles: ${ticketType.availableStock}. Máximo por compra: ${ticketType.maxPerPurchase}.`
            : `Disponibles: ${ticketType.availableStock}. Sin límite por compra.`,
      })),
    ],
  };
}

export type { CheckoutTicketTypeConfig };

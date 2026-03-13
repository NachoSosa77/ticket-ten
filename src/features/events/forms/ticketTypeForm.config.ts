import { FormConfig } from "@/lib/forms/types";

export const ticketTypeFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Ej: General, VIP, Platea",
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Información adicional sobre esta entrada",
    },
    {
      name: "price",
      label: "Precio",
      type: "number",
      required: true,
      placeholder: "Ej: 15000",
      description: "Precio en ARS.",
    },
    {
      name: "stockTotal",
      label: "Stock total",
      type: "number",
      required: true,
      placeholder: "Ej: 200",
    },
    {
      name: "maxPerPurchase",
      label: "Máximo por compra",
      type: "number",
      placeholder: "Ej: 4",
      description: "Déjalo vacío si no quieres limitar la compra.",
    },
    {
      name: "isActive",
      label: "Entrada activa",
      type: "checkbox",
    },
  ],
};

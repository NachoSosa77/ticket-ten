import { FormConfig } from "@/lib/forms/types";

export const eventSessionFormConfig: FormConfig = {
  fields: [
    {
      name: "venueName",
      label: "Lugar",
      type: "text",
      required: true,
      placeholder: "Ej: Teatro Gran Rex",
    },
    {
      name: "startsAt",
      label: "Fecha y hora",
      type: "datetime-local",
      required: true,
      description: "Define la fecha y horario de la función.",
    },
  ],
};

import { FormConfig } from "@/lib/forms/types";

export const eventFormConfig: FormConfig = {
  fields: [
    {
      name: "title",
      label: "Título",
      type: "text",
      required: true,
      placeholder: "Ej: Los Redondos Tributo",
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      placeholder: "Ej: los-redondos-tributo",
      description: "Se usará en la URL pública del evento.",
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Describe el evento...",
    },
    {
      name: "imageUrl",
      label: "URL de imagen",
      type: "text",
      placeholder: "https://...",
    },
    {
      name: "category",
      label: "Categoría",
      type: "select",
      required: true,
      options: [
        { label: "Concierto", value: "CONCERT" },
        { label: "Show", value: "SHOW" },
        { label: "Teatro", value: "THEATER" },
      ],
    },
  ],
};

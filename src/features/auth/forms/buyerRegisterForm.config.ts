import { FormConfig } from "@/lib/forms/types";

export const buyerRegisterFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "Nombre y apellido",
      type: "text",
      required: true,
      placeholder: "Ej: Juan Pérez",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "tu@email.com",
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      required: true,
      placeholder: "Mínimo 8 caracteres",
    },
    {
      name: "confirmPassword",
      label: "Confirmar contraseña",
      type: "password",
      required: true,
      placeholder: "Repite la contraseña",
    },
  ],
};

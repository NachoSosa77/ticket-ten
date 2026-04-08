import { FormConfig } from "@/lib/forms/types";

export const adminRegisterFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Administrador",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "admin@email.com",
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      required: true,
      placeholder: "••••••••",
    },
    {
      name: "confirmPassword",
      label: "Confirmar contraseña",
      type: "password",
      required: true,
      placeholder: "••••••••",
    },
  ],
};

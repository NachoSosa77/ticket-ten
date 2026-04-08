import { FormConfig } from "@/lib/forms/types";

export const adminLoginFormConfig: FormConfig = {
  fields: [
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
  ],
};

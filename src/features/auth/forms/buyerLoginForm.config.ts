import { FormConfig } from "@/lib/forms/types";

export const buyerLoginFormConfig: FormConfig = {
  fields: [
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
      placeholder: "••••••••",
    },
  ],
};

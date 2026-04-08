"use client";

import { loginBuyerAction, type BuyerAuthActionState } from "@/app/actions/buyer-auth.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import { buyerLoginFormConfig } from "@/features/auth/forms/buyerLoginForm.config";
import { buyerLoginFormSchema } from "@/features/auth/forms/buyerLoginForm.schema";
import { useState, useTransition } from "react";

type FormValues = Record<string, string | number | boolean>;

const initialValues: FormValues = {
  email: "",
  password: "",
};

type BuyerLoginFormProps = {
  nextPath?: string;
};

export default function BuyerLoginForm({ nextPath = "/mi-cuenta" }: BuyerLoginFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (name: string, value: string | number | boolean) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = buyerLoginFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      });

      setMessage("Revisa los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("email", String(values.email ?? ""));
      fd.append("password", String(values.password ?? ""));
      fd.append("next", nextPath);

      const result: BuyerAuthActionState = await loginBuyerAction({ success: false }, fd);

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo iniciar sesión.");
      }
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {message && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {message}
        </div>
      )}

      <FormBuilder
        config={buyerLoginFormConfig}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Ingresar"
      />
    </div>
  );
}


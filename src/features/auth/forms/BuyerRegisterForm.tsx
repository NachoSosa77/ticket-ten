"use client";

import {
    registerBuyerAction,
    type BuyerAuthActionState,
} from "@/app/actions/buyer-auth.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import { buyerRegisterFormConfig } from "@/features/auth/forms/buyerRegisterForm.config";
import { buyerRegisterFormSchema } from "@/features/auth/forms/buyerRegisterForm.schema";
import { useState, useTransition } from "react";

type FormValues = Record<string, string | number | boolean>;

const initialValues: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type BuyerRegisterFormProps = {
  nextPath?: string;
};

export default function BuyerRegisterForm({
  nextPath = "/mi-cuenta",
}: BuyerRegisterFormProps) {
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

    const parsed = buyerRegisterFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? "",
      });

      setMessage("Revisa los datos ingresados.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", String(values.name ?? ""));
      fd.append("email", String(values.email ?? ""));
      fd.append("password", String(values.password ?? ""));
      fd.append("confirmPassword", String(values.confirmPassword ?? ""));
      fd.append("next", nextPath);

      const result: BuyerAuthActionState = await registerBuyerAction(
        { success: false },
        fd,
      );

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo crear la cuenta.");
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
        config={buyerRegisterFormConfig}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Crear cuenta"
      />
    </div>
  );
}


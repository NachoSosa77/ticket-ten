"use client";

import { createEventAction } from "@/app/actions/event.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import { useState, useTransition } from "react";
import { eventFormConfig } from "./eventForm.config";
import { eventFormSchema } from "./eventForm.schema";

type FormValues = Record<string, string | number | boolean>;

const initialValues: FormValues = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  category: "",
};

export default function EventCreateForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error" | null>(null);
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

    const parsed = eventFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        title: fieldErrors.title?.[0] ?? "",
        slug: fieldErrors.slug?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        imageUrl: fieldErrors.imageUrl?.[0] ?? "",
        category: fieldErrors.category?.[0] ?? "",
      });

      setMessage("Revisa los campos del formulario.");
      setMessageTone("error");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("title", String(values.title));
      fd.append("slug", String(values.slug));
      fd.append("description", String(values.description));
      fd.append("imageUrl", String(values.imageUrl));
      fd.append("category", String(values.category));

      const result = await createEventAction({ success: false }, fd);

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo crear el evento.");
        setMessageTone("error");
        return;
      }

      setMessage(result.message ?? "Evento creado correctamente.");
      setMessageTone("success");
      setErrors({});
      setValues(initialValues);
    });
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo evento</h1>
        <p className="text-sm text-slate-600">
          Completa la información básica del evento.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {message}
        </div>
      )}

      <FormBuilder
        config={eventFormConfig}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Crear evento"
      />
    </div>
  );
}

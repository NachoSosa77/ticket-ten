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
        return;
      }

      setMessage(result.message ?? "Evento creado correctamente.");
      setErrors({});
      setValues(initialValues);
    });
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border p-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo evento</h1>
        <p className="text-sm text-gray-500">
          Completa la información básica del evento.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border px-3 py-2 text-sm">{message}</div>
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

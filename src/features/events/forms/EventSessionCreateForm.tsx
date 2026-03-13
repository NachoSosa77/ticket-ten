"use client";

import { createEventSessionAction } from "@/app/actions/event-session.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import { useState, useTransition } from "react";
import { eventSessionFormConfig } from "./eventSessionForm.config";
import { eventSessionFormSchema } from "./eventSessionForm.schema";

type FormValues = Record<string, string | number | boolean>;

const initialValues: FormValues = {
  venueName: "",
  startsAt: "",
};

type EventSessionCreateFormProps = {
  eventId: number;
};

export default function EventSessionCreateForm({
  eventId,
}: EventSessionCreateFormProps) {
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

    const parsed = eventSessionFormSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        venueName: fieldErrors.venueName?.[0] ?? "",
        startsAt: fieldErrors.startsAt?.[0] ?? "",
      });

      setMessage("Revisa los campos del formulario.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("venueName", String(values.venueName));
      fd.append("startsAt", String(values.startsAt));

      const result = await createEventSessionAction(eventId, fd);

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo crear la función.");
        return;
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border p-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva función</h1>
        <p className="text-sm text-gray-500">
          Completa la fecha, hora y lugar de esta función.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border px-3 py-2 text-sm">{message}</div>
      )}

      <FormBuilder
        config={eventSessionFormConfig}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Crear función"
      />
    </div>
  );
}

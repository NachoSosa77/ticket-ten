"use client";

import { createTicketTypeAction } from "@/app/actions/ticket-type.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import { useState, useTransition } from "react";
import { ticketTypeFormConfig } from "./ticketTypeForm.config";
import { ticketTypeFormSchema } from "./ticketTypeForm.schema";

type FormValues = Record<string, string | number | boolean>;

const initialValues: FormValues = {
  name: "",
  description: "",
  price: "",
  stockTotal: "",
  maxPerPurchase: "",
  isActive: true,
};

type TicketTypeCreateFormProps = {
  eventId: number;
  sessionId: number;
};

export default function TicketTypeCreateForm({
  eventId,
  sessionId,
}: TicketTypeCreateFormProps) {
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

    const normalizedValues = {
      ...values,
      maxPerPurchase:
        values.maxPerPurchase === "" ? Number.NaN : values.maxPerPurchase,
    };

    const parsed = ticketTypeFormSchema.safeParse(normalizedValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        price: fieldErrors.price?.[0] ?? "",
        stockTotal: fieldErrors.stockTotal?.[0] ?? "",
        maxPerPurchase: fieldErrors.maxPerPurchase?.[0] ?? "",
        isActive: fieldErrors.isActive?.[0] ?? "",
      });

      setMessage("Revisa los campos del formulario.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", String(values.name));
      fd.append("description", String(values.description));
      fd.append("price", String(values.price));
      fd.append("stockTotal", String(values.stockTotal));
      fd.append("maxPerPurchase", String(values.maxPerPurchase));
      fd.append("isActive", String(values.isActive));

      const result = await createTicketTypeAction(eventId, sessionId, fd);

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo crear la entrada.");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border p-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva entrada</h1>
        <p className="text-sm text-gray-500">
          Define nombre, precio, stock y límites de compra.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border px-3 py-2 text-sm">{message}</div>
      )}

      <FormBuilder
        config={ticketTypeFormConfig}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Crear entrada"
      />
    </div>
  );
}

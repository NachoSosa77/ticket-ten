"use client";

import { createOrderCheckoutAction } from "@/app/actions/order.actions";
import FormBuilder from "@/components/forms/FormBuilder";
import {
  buildCheckoutFormConfig,
  type CheckoutTicketTypeConfig,
} from "@/features/checkout/forms/checkoutForm.config";
import { buildCheckoutFormSchema } from "@/features/checkout/forms/checkoutForm.schema";
import { useMemo, useState, useTransition } from "react";

type FormValues = Record<string, string | number | boolean>;

type CheckoutCreateFormProps = {
  sessionId: number;
  ticketTypes: CheckoutTicketTypeConfig[];
  initialBuyerName?: string;
  initialBuyerEmail?: string;
};

function buildInitialValues(
  ticketTypes: CheckoutTicketTypeConfig[],
  initialBuyerName?: string,
  initialBuyerEmail?: string,
): FormValues {
  return {
    buyerName: initialBuyerName ?? "",
    buyerEmail: initialBuyerEmail ?? "",
    ...Object.fromEntries(ticketTypes.map((ticketType) => [`quantity_${ticketType.id}`, 0])),
  };
}

export default function CheckoutCreateForm({
  sessionId,
  ticketTypes,
  initialBuyerName,
  initialBuyerEmail,
}: CheckoutCreateFormProps) {
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(ticketTypes, initialBuyerName, initialBuyerEmail),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const config = useMemo(() => buildCheckoutFormConfig(ticketTypes), [ticketTypes]);
  const schema = useMemo(
    () =>
      buildCheckoutFormSchema(
        ticketTypes.map((ticketType) => ({
          id: ticketType.id,
          maxPerPurchase: ticketType.maxPerPurchase,
        })),
      ),
    [ticketTypes],
  );

  const handleChange = (name: string, value: string | number | boolean) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      quantities: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        buyerName: fieldErrors.buyerName?.[0] ?? "",
        buyerEmail: fieldErrors.buyerEmail?.[0] ?? "",
        quantities: fieldErrors.quantities?.[0] ?? "",
        ...Object.fromEntries(
          ticketTypes.map((ticketType) => [
            `quantity_${ticketType.id}`,
            fieldErrors[`quantity_${ticketType.id}`]?.[0] ?? "",
          ]),
        ),
      });

      setMessage("Revisa los campos del checkout.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("buyerName", String(values.buyerName ?? ""));
      fd.append("buyerEmail", String(values.buyerEmail ?? ""));

      for (const ticketType of ticketTypes) {
        fd.append(
          `quantity_${ticketType.id}`,
          String(values[`quantity_${ticketType.id}`] ?? 0),
        );
      }

      const result = await createOrderCheckoutAction(sessionId, fd);

      if (!result.success) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "No se pudo procesar la compra.");
        return;
      }
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
      {message && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {message}
        </div>
      )}

      {errors.quantities && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errors.quantities}
        </div>
      )}

      <FormBuilder
        config={config}
        values={values}
        errors={errors}
        isSubmitting={isPending}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Confirmar compra"
      />
    </div>
  );
}

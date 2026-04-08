"use client";

import { cancelOrderAction } from "@/app/actions/order.actions";
import { useTransition } from "react";

type OrderCancelActionProps = {
  eventId: number;
  sessionId: number;
  orderId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUND_PENDING" | "REFUNDED";
};

export default function OrderCancelAction({
  eventId,
  sessionId,
  orderId,
  status,
}: OrderCancelActionProps) {
  const [isPending, startTransition] = useTransition();

  if (status === "CANCELLED" || status === "REFUNDED") {
    return <span className="text-xs text-slate-400">Sin acciones</span>;
  }

  const handleCancel = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar esta orden? Se devolverá el stock vendido.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      await cancelOrderAction(eventId, sessionId, orderId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Procesando..." : "Cancelar"}
    </button>
  );
}


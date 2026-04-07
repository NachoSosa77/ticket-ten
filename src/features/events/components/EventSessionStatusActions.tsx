"use client";

import {
  cancelEventSessionAction,
  reactivateEventSessionAction,
} from "@/app/actions/event-session.actions";
import { useTransition } from "react";

type EventSessionStatus = "SCHEDULED" | "SOLD_OUT" | "CANCELLED";

type EventSessionStatusActionsProps = {
  eventId: number;
  sessionId: number;
  status: EventSessionStatus;
};

export default function EventSessionStatusActions({
  eventId,
  sessionId,
  status,
}: EventSessionStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar esta función?",
    );

    if (!confirmed) return;

    startTransition(async () => {
      await cancelEventSessionAction(eventId, sessionId);
    });
  };

  const handleReactivate = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres reactivar esta función?",
    );

    if (!confirmed) return;

    startTransition(async () => {
      await reactivateEventSessionAction(eventId, sessionId);
    });
  };

  if (status === "CANCELLED") {
    return (
      <button
        type="button"
        onClick={handleReactivate}
        disabled={isPending}
        className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Procesando..." : "Reactivar"}
      </button>
    );
  }

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

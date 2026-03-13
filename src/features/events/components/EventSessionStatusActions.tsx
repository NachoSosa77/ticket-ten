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
        className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white cursor-pointer transition hover:scale-105 hover:bg-green-700 disabled:opacity-60"
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
      className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white cursor-pointer transition hover:scale-105 hover:bg-red-700 disabled:opacity-60"
    >
      {isPending ? "Procesando..." : "Cancelar"}
    </button>
  );
}

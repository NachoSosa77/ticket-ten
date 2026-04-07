"use client";

import {
  cancelEventAction,
  publishEventAction,
  reactivateEventAction,
} from "@/app/actions/event.actions";
import { useTransition } from "react";

type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

type EventStatusActionsProps = {
  eventId: number;
  status: EventStatus;
};

export default function EventStatusActions({
  eventId,
  status,
}: EventStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    startTransition(async () => {
      await publishEventAction(eventId);
    });
  };

  const handleCancel = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar este evento?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await cancelEventAction(eventId);
    });
  };

  const handleReactivate = () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres reactivar este evento? Pasará a borrador.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      await reactivateEventAction(eventId);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Publicar"}
        </button>
      )}

      {status !== "CANCELLED" && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Cancelar"}
        </button>
      )}

      {status === "CANCELLED" && (
        <button
          type="button"
          onClick={handleReactivate}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Reactivar"}
        </button>
      )}
    </div>
  );
}

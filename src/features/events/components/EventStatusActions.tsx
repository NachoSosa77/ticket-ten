"use client";

import { cancelEventAction, publishEventAction } from "@/app/actions/event.actions";
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

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && (
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white 
cursor-pointer transition hover:scale-105 hover:bg-green-700 disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Publicar"}
        </button>
      )}

      {status !== "CANCELLED" && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white 
cursor-pointer transition hover:scale-105 hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Cancelar"}
        </button>
      )}
    </div>
  );
}

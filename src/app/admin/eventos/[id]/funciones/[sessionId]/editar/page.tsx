import EventSessionEditForm from "@/features/events/forms/EventSessionEditForm";
import { formatDateTimeLocal } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function EditEventSessionPage({ params }: PageProps) {
  const { id, sessionId } = await params;

  const eventId = Number(id);
  const parsedSessionId = Number(sessionId);

  if (!Number.isFinite(eventId) || !Number.isFinite(parsedSessionId)) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!event) {
    notFound();
  }

  const session = await prisma.eventSession.findFirst({
    where: {
      id: parsedSessionId,
      eventId,
    },
    select: {
      id: true,
      venueName: true,
      startsAt: true,
      status: true,
    },
  });

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/eventos/${event.id}/funciones`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver a funciones
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">Editar función</h1>
        <p className="text-sm text-gray-500">
          Evento: {event.title}
        </p>
      </div>

      <EventSessionEditForm
        eventId={event.id}
        session={{
          id: session.id,
          venueName: session.venueName,
          startsAt: formatDateTimeLocal(session.startsAt),
          status: session.status,
        }}
      />
    </div>
  );
}

import TicketTypeCreateForm from "@/features/events/forms/TicketTypeCreateForm";
import { formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function NewTicketTypePage({ params }: PageProps) {
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
    },
  });

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver a entradas
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">Nueva entrada</h1>
        <p className="text-sm text-gray-500">
          {event.title} · {formatEventDateTime(session.startsAt)} · {session.venueName}
        </p>
      </div>

      <TicketTypeCreateForm eventId={event.id} sessionId={session.id} />
    </div>
  );
}

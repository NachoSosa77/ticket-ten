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
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <div>
        <Link
          href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas`}
            className="text-sm font-medium text-slate-500 transition hover:text-indigo-700"
        >
          ← Volver a entradas
        </Link>

          <p className="mt-4 text-xs font-medium tracking-[0.14em] text-indigo-600">
            ENTRADAS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Nueva entrada
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {event.title} · {formatEventDateTime(session.startsAt)} · {session.venueName}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <TicketTypeCreateForm eventId={event.id} sessionId={session.id} />
      </section>
    </div>
  );
}

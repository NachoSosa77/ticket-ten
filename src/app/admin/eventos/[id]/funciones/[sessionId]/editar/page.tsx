import EventSessionEditForm from "@/features/events/forms/EventSessionEditForm";
import { requireAdminUser } from "@/lib/auth/session";
import { formatDateTimeLocal } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; sessionId: string }>;
};

export default async function EditEventSessionPage({ params }: PageProps) {
  const adminUser = await requireAdminUser("/admin/eventos");
  const { id, sessionId } = await params;

  const eventId = Number(id);
  const parsedSessionId = Number(sessionId);

  if (!Number.isFinite(eventId) || !Number.isFinite(parsedSessionId)) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, createdById: adminUser.id },
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
      createdById: adminUser.id,
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative space-y-3">
          <Link
            href={`/admin/eventos/${event.id}/funciones`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-50 transition hover:bg-white/20"
          >
            ← Volver a funciones
          </Link>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
            ⚡ Edición de función
          </span>

          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Editar función
          </h1>
          <p className="text-sm text-indigo-100 md:text-base">
            {event.title} · {session.venueName}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EventSessionEditForm
          eventId={event.id}
          session={{
            id: session.id,
            venueName: session.venueName,
            startsAt: formatDateTimeLocal(session.startsAt),
            status: session.status,
          }}
        />
      </section>
    </div>
  );
}

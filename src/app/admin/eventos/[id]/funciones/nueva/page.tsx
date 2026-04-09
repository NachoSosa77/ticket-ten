import EventSessionCreateForm from "@/features/events/forms/EventSessionCreateForm";
import { requireAdminUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewEventSessionPage({ params }: PageProps) {
  const adminUser = await requireAdminUser("/admin/eventos");
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isFinite(eventId)) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, createdById: adminUser.id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }

  if (event.status === "CANCELLED") {
    redirect(`/admin/eventos/${event.id}/funciones?error=create`);
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <div>
            <Link
              href={`/admin/eventos/${event.id}/funciones`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
            >
              ← Volver a funciones
            </Link>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
            🗓️ Nueva función
          </span>

          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Programar nueva función
          </h1>

          <p className="max-w-2xl text-sm text-indigo-100 md:text-base">
            Definí fecha, horario y capacidad para sumar una nueva instancia al
            evento <span className="font-semibold text-white">{event.title}</span>.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EventSessionCreateForm eventId={event.id} />
      </section>
    </div>
  );
}

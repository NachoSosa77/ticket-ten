import EventSessionStatusActions from "@/features/events/components/EventSessionStatusActions";
import { formatEventDate, formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function getSessionStatusStyles(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "border border-sky-200 bg-sky-50 text-sky-800";
    case "SOLD_OUT":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "CANCELLED":
      return "border border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "created":
      return "Función creada correctamente.";
    case "updated":
      return "Función actualizada correctamente.";
    case "cancelled":
      return "Función cancelada correctamente.";
    case "reactivated":
      return "Función reactivada correctamente.";
    default:
      return null;
  }
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "cancel":
      return "No se pudo cancelar la función.";
    case "create":
      return "No se pudo crear la función para este evento.";
    default:
      return null;
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function EventSessionsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const successMessage = getSuccessMessage(success);
  const errorMessage = getErrorMessage(error);
  const eventId = Number(id);

  if (!Number.isFinite(eventId)) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      sessions: {
        orderBy: {
          startsAt: "asc",
        },
        select: {
          id: true,
          venueName: true,
          startsAt: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin/eventos"
              className="text-sm font-medium text-indigo-100 transition hover:text-white"
          >
            ← Volver a eventos
          </Link>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Funciones del evento
            </h1>
            <p className="mt-2 text-sm text-indigo-100">
            {event.title} · {event.slug}
          </p>
        </div>

        {event.status !== "CANCELLED" ? (
          <Link
            href={`/admin/eventos/${event.id}/funciones/nueva`}
              className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50"
          >
            Nueva función
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100">
            Reactivá el evento para agregar funciones
          </span>
        )}
      </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
          {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-indigo-900 shadow-sm">
        <span className="font-medium">Estado del evento:</span> {event.status}
      </div>

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha y hora</th>
              <th className="px-4 py-3 font-medium">Lugar</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creada</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {event.sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Este evento todavía no tiene funciones cargadas.
                </td>
              </tr>
            ) : (
              event.sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-slate-100 text-slate-800 transition hover:bg-indigo-50/40 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    {formatEventDateTime(session.startsAt)}
                  </td>
                  <td className="px-4 py-3">{session.venueName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getSessionStatusStyles(
                        session.status,
                      )}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatEventDate(session.createdAt)}
                  </td>
                  <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <Link
      href={`/admin/eventos/${event.id}/funciones/${session.id}/editar`}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
    >
      Editar
    </Link>

    <Link
      href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas`}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
    >
      Entradas
    </Link>

    <EventSessionStatusActions
      eventId={event.id}
      sessionId={session.id}
      status={session.status}
    />
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

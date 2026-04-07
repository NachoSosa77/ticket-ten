import EventStatusActions from "@/features/events/components/EventStatusActions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function getStatusStyles(status: string) {
  switch (status) {
    case "DRAFT":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "PUBLISHED":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "CANCELLED":
      return "border border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "created":
      return "Evento creado correctamente.";
    case "updated":
      return "Evento actualizado correctamente.";
    case "published":
      return "Evento publicado correctamente.";
    case "cancelled":
      return "Evento cancelado correctamente.";
    case "reactivated":
      return "Evento reactivado correctamente.";
    default:
      return null;
  }
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "publish":
      return "No se pudo publicar el evento.";
    case "cancel":
      return "No se pudo cancelar el evento.";
    case "reactivate":
      return "No se pudo reactivar el evento.";
    default:
      return null;
  }
}

type EventosPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const { success, error } = await searchParams;
  const successMessage = getSuccessMessage(success);
  const errorMessage = getErrorMessage(error);

  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  const totalEvents = events.length;
  const publishedEvents = events.filter((event) => event.status === "PUBLISHED").length;
  const draftEvents = events.filter((event) => event.status === "DRAFT").length;
  const cancelledEvents = events.filter((event) => event.status === "CANCELLED").length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
              🎟️ Gestión de eventos
            </span>

            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">Eventos</h1>

            <p className="text-sm text-indigo-100 md:text-base">
              Administrá el ciclo completo de tus eventos desde un mismo panel,
              con una vista clara del estado de cada publicación.
            </p>
          </div>

          <Link
            href="/admin/eventos/nuevo"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50"
          >
            Nuevo evento
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Total de eventos</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{totalEvents}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Publicados</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">{publishedEvents}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">En borrador</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-700">{draftEvents}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Cancelados</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-rose-700">{cancelledEvents}</p>
        </article>
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

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No hay eventos cargados todavía.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-slate-100 text-slate-800 transition hover:bg-indigo-50/40 last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-slate-500">{event.slug}</td>
                  <td className="px-4 py-3">{event.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                        event.status,
                      )}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(event.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/eventos/${event.id}/editar`}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Editar
                      </Link>

                      <Link
                        href={`/admin/eventos/${event.id}/funciones`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Funciones
                      </Link>

                      <EventStatusActions
                        eventId={event.id}
                        status={event.status}
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

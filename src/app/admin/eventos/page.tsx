import EventStatusActions from "@/features/events/components/EventStatusActions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function getStatusStyles(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    case "PUBLISHED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Eventos</h1>

        <Link
          href="/admin/eventos/nuevo"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Nuevo evento
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No hay eventos cargados todavía.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3 text-gray-600">{event.slug}</td>
                  <td className="px-4 py-3">{event.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusStyles(
                        event.status,
                      )}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(event.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/eventos/${event.id}/editar`}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer transition"
                      >
                        Editar
                      </Link>

                      <Link
                        href={`/admin/eventos/${event.id}/funciones`}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition"
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

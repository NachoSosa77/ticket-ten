import EventSessionStatusActions from "@/features/events/components/EventSessionStatusActions";
import { formatEventDate, formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function getSessionStatusStyles(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "SOLD_OUT":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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
    default:
      return null;
  }
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "cancel":
      return "No se pudo cancelar la función.";
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/eventos"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver a eventos
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">Funciones del evento</h1>
          <p className="text-sm text-gray-500">
            {event.title} · {event.slug}
          </p>
        </div>

        <Link
          href={`/admin/eventos/${event.id}/funciones/nueva`}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Nueva función
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

      <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <span className="font-medium">Estado del evento:</span> {event.status}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Este evento todavía no tiene funciones cargadas.
                </td>
              </tr>
            ) : (
              event.sessions.map((session) => (
                <tr key={session.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    {formatEventDateTime(session.startsAt)}
                  </td>
                  <td className="px-4 py-3">{session.venueName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSessionStatusStyles(
                        session.status,
                      )}`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatEventDate(session.createdAt)}
                  </td>
                  <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <Link
      href={`/admin/eventos/${event.id}/funciones/${session.id}/editar`}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition"
    >
      Editar
    </Link>

    <Link
      href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas`}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition"
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

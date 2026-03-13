import { formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value));
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "created":
      return "Entrada creada correctamente.";
    default:
      return null;
  }
}

type PageProps = {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<{ success?: string }>;
};

export default async function TicketTypesPage({
  params,
  searchParams,
}: PageProps) {
  const { id, sessionId } = await params;
  const { success } = await searchParams;
  const successMessage = getSuccessMessage(success);
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
      ticketTypes: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stockTotal: true,
          stockSold: true,
          maxPerPurchase: true,
          isActive: true,
        },
      },
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

        <h1 className="mt-2 text-2xl font-semibold">Entradas de la función</h1>
        <p className="text-sm text-gray-500">
          {event.title} · {formatEventDateTime(session.startsAt)} ·{" "}
          {session.venueName}
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas/nueva`}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Nueva entrada
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock total</th>
              <th className="px-4 py-3 font-medium">Vendidas</th>
              <th className="px-4 py-3 font-medium">Máx. por compra</th>
              <th className="px-4 py-3 font-medium">Activa</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {session.ticketTypes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Esta función todavía no tiene tipos de entrada cargados.
                </td>
              </tr>
            ) : (
              session.ticketTypes.map((ticketType) => (
                <tr key={ticketType.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{ticketType.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {ticketType.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(ticketType.price.toString())}
                  </td>
                  <td className="px-4 py-3">{ticketType.stockTotal}</td>
                  <td className="px-4 py-3">{ticketType.stockSold}</td>
                  <td className="px-4 py-3">
                    {ticketType.maxPerPurchase ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        ticketType.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticketType.isActive ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">Próximamente</span>
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

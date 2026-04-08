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

  const totalStock = session.ticketTypes.reduce(
    (acc, ticketType) => acc + ticketType.stockTotal,
    0,
  );
  const totalSold = session.ticketTypes.reduce(
    (acc, ticketType) => acc + ticketType.stockSold,
    0,
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <Link
              href={`/admin/eventos/${event.id}/funciones`}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-50 transition hover:bg-white/20"
            >
              ← Volver a funciones
            </Link>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
              ⚡ Gestión de entradas
            </span>

            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Entradas de la función
            </h1>
            <p className="text-sm text-indigo-100 md:text-base">
              {event.title} · {formatEventDateTime(session.startsAt)} · {session.venueName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/eventos/${event.id}/funciones/${session.id}/ordenes`}
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Ver órdenes
            </Link>

            <Link
              href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas/nueva`}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50"
            >
              Nueva entrada
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Tipos de entrada</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {session.ticketTypes.length}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Stock total</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {totalStock}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Entradas vendidas</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {totalSold}
          </p>
        </article>
      </section>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 text-left text-slate-700">
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
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  Esta función todavía no tiene tipos de entrada cargados.
                </td>
              </tr>
            ) : (
              session.ticketTypes.map((ticketType) => (
                <tr
                  key={ticketType.id}
                  className="border-b border-slate-100 text-slate-800 transition hover:bg-indigo-50/30 last:border-b-0"
                >
                  <td className="px-4 py-3">{ticketType.name}</td>
                  <td className="px-4 py-3 text-slate-500">
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
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        ticketType.isActive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ticketType.isActive ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">Próximamente</span>
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

import OrderCancelAction from "@/features/orders/components/OrderCancelAction";
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
    case "cancelled":
      return "Orden cancelada correctamente y stock reintegrado.";
    default:
      return null;
  }
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "cancel":
      return "No se pudo cancelar la orden.";
    default:
      return null;
  }
}

function getOrderStatusStyles(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "PENDING":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "CANCELLED":
      return "border border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

type PageProps = {
  params: Promise<{ id: string; sessionId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function OrdersBySessionAdminPage({
  params,
  searchParams,
}: PageProps) {
  const { id, sessionId } = await params;
  const { success, error } = await searchParams;
  const successMessage = getSuccessMessage(success);
  const errorMessage = getErrorMessage(error);

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
    },
  });

  if (!session) {
    notFound();
  }

  const orders = await prisma.order.findMany({
    where: {
      sessionId: session.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderCode: true,
      buyerName: true,
      buyerEmail: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          ticketType: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href={`/admin/eventos/${event.id}/funciones/${session.id}/entradas`}
              className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-50 transition hover:bg-white/20"
            >
              ← Volver a entradas
            </Link>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Órdenes de la función
            </h1>
            <p className="mt-2 text-sm text-indigo-100">
              {event.title} · {formatEventDateTime(session.startsAt)} · {session.venueName}
            </p>
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

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/70 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Comprador</th>
              <th className="px-4 py-3 font-medium">Entradas</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Esta función aún no tiene órdenes registradas.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 text-slate-800 transition hover:bg-indigo-50/40 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.orderCode ?? "—"}</p>
                    <p className="text-xs text-slate-500">#{order.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.buyerName}</p>
                    <p className="text-xs text-slate-500">{order.buyerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-xs text-slate-600">
                          {item.ticketType.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">{formatPrice(order.totalAmount.toString())}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusStyles(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <OrderCancelAction
                      eventId={event.id}
                      sessionId={session.id}
                      orderId={order.id}
                      status={order.status}
                    />
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


import { requireBuyerUser } from "@/lib/auth/session";
import { formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value));
}

export default async function BuyerDashboardPage() {
  const buyerUser = await requireBuyerUser("/mi-cuenta");

  const orders = await prisma.order.findMany({
    where: {
      buyerUserId: buyerUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderCode: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
        },
      },
      session: {
        select: {
          id: true,
          startsAt: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  const totalTickets = orders.reduce(
    (acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold md:text-4xl">Mi cuenta</h1>
          <p className="mt-2 text-indigo-100">Bienvenido, {buyerUser.name}</p>
          <p className="mt-1 text-sm text-indigo-100/90">{buyerUser.email}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Compras realizadas</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{totalOrders}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Entradas compradas</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{totalTickets}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Total invertido</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatPrice(totalSpent)}</p>
          </article>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Mis compras</h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
              Aún no tenés compras asociadas a tu cuenta.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
                const orderHref = order.orderCode
                  ? `/mi-cuenta/compras/${order.orderCode}`
                  : null;

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
                          Orden {order.orderCode ?? `#${order.id}`}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {order.session.event.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Función: {formatEventDateTime(order.session.startsAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Estado: {order.status} · Entradas: {totalItems}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          Total: {formatPrice(order.totalAmount.toString())}
                        </p>
                      </div>

                      {orderHref ? (
                        <Link
                          href={orderHref}
                          className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Ver detalle
                        </Link>
                      ) : (
                        <span className="inline-flex rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                          Sin código de orden
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

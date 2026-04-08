import { requireBuyerUser } from "@/lib/auth/session";
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

type PageProps = {
  params: Promise<{ orderCode: string }>;
};

export default async function BuyerOrderDetailPage({ params }: PageProps) {
  const buyerUser = await requireBuyerUser();
  const { orderCode } = await params;

  const order = await prisma.order.findFirst({
    where: {
      orderCode,
      buyerUserId: buyerUser.id,
    },
    select: {
      id: true,
      orderCode: true,
      buyerName: true,
      buyerEmail: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      session: {
        select: {
          startsAt: true,
          venueName: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          subtotal: true,
          ticketType: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">Detalle de compra</p>
          <h1 className="mt-2 text-3xl font-semibold">Orden {order.orderCode ?? `#${order.id}`}</h1>
          <p className="mt-2 text-sm text-indigo-100">Estado: {order.status}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Información de la orden</h2>

          <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-medium">Comprador:</span> {order.buyerName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.buyerEmail}
            </p>
            <p>
              <span className="font-medium">Evento:</span> {order.session.event.title}
            </p>
            <p>
              <span className="font-medium">Función:</span> {formatEventDateTime(order.session.startsAt)}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Entrada</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium">Precio unitario</th>
                  <th className="px-4 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-slate-800">{item.ticketType.name}</td>
                    <td className="px-4 py-3 text-slate-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-800">{formatPrice(item.unitPrice.toString())}</td>
                    <td className="px-4 py-3 text-slate-800">{formatPrice(item.subtotal.toString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-right text-lg font-semibold text-slate-900">
            Total: {formatPrice(order.totalAmount.toString())}
          </p>
        </section>

        <div className="flex items-center gap-3">
          <Link
            href="/mi-cuenta"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Volver a mis compras
          </Link>
          <Link
            href={`/eventos/${order.session.event.slug}`}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Ver evento
          </Link>
        </div>
      </div>
    </main>
  );
}


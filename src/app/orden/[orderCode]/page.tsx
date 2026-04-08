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

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderCode } = await params;

  const order = await prisma.order.findUnique({
    where: { orderCode },
    select: {
      id: true,
      orderCode: true,
      buyerName: true,
      buyerEmail: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      session: {
        select: {
          id: true,
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
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">✅ Compra confirmada</p>
          <h1 className="mt-2 text-3xl font-semibold text-emerald-900">Orden generada</h1>
          <p className="mt-3 text-sm text-emerald-800">
            Código de orden: <span className="font-semibold">{order.orderCode}</span>
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Conserva este código para cualquier consulta de soporte.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Detalle de la orden</h2>

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
              <span className="font-medium">Función:</span>{" "}
              {formatEventDateTime(order.session.startsAt)} · {order.session.venueName}
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
                    <td className="px-4 py-3 text-slate-800">
                      {formatPrice(item.unitPrice.toString())}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {formatPrice(item.subtotal.toString())}
                    </td>
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
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Volver al catálogo
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


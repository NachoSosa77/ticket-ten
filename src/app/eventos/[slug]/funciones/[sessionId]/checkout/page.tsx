import CheckoutCreateForm from "@/features/checkout/forms/CheckoutCreateForm";
import { getCurrentBuyerUser } from "@/lib/auth/session";
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
  params: Promise<{ slug: string; sessionId: string }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { slug, sessionId } = await params;
  const parsedSessionId = Number(sessionId);
  const buyerUser = await getCurrentBuyerUser();

  if (!Number.isFinite(parsedSessionId)) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      sessions: {
        where: {
          id: parsedSessionId,
          status: "SCHEDULED",
        },
        select: {
          id: true,
          startsAt: true,
          venueName: true,
          ticketTypes: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              price: true,
              stockTotal: true,
              stockSold: true,
              maxPerPurchase: true,
            },
          },
        },
      },
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  const session = event.sessions[0];

  if (!session) {
    notFound();
  }

  const ticketTypes = session.ticketTypes
    .map((ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      price: ticketType.price.toString(),
      availableStock: Math.max(ticketType.stockTotal - ticketType.stockSold, 0),
      maxPerPurchase: ticketType.maxPerPurchase,
    }))
    .filter((ticketType) => ticketType.availableStock > 0);

  const totalAvailableStock = ticketTypes.reduce(
    (acc, ticketType) => acc + ticketType.availableStock,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <Link
            href={`/eventos/${event.slug}`}
            className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-50 transition hover:bg-white/20"
          >
            ← Volver al evento
          </Link>

          <h1 className="mt-3 text-2xl font-semibold md:text-3xl">Checkout</h1>
          <p className="mt-2 text-sm text-indigo-100">{event.title}</p>
          <p className="mt-1 text-sm text-indigo-100">
            {formatEventDateTime(session.startsAt)} · {session.venueName}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Tipos de entrada</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{ticketTypes.length}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Stock disponible</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{totalAvailableStock}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Precio mínimo</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {ticketTypes.length > 0
                ? formatPrice(
                    Math.min(...ticketTypes.map((ticketType) => Number(ticketType.price))),
                  )
                : "—"}
            </p>
          </article>
        </section>

        {ticketTypes.length === 0 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
            Esta función no tiene stock disponible para la compra.
          </section>
        ) : (
          <section className="space-y-4">
            {!buyerUser ? (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                ¿Ya tenés cuenta?{" "}
                <Link
                  href={`/auth/ingresar?next=${encodeURIComponent(
                    `/eventos/${event.slug}/funciones/${session.id}/checkout`,
                  )}`}
                  className="font-semibold text-indigo-700 underline-offset-2 hover:underline"
                >
                  Ingresá para autocompletar tus datos y ver tus compras
                </Link>
                .
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Comprando como <span className="font-semibold">{buyerUser.name}</span> ({buyerUser.email}).
              </div>
            )}

            <h2 className="text-lg font-semibold text-slate-900">Completa tus datos</h2>
            <CheckoutCreateForm
              sessionId={session.id}
              ticketTypes={ticketTypes}
              initialBuyerName={buyerUser?.name}
              initialBuyerEmail={buyerUser?.email}
            />
          </section>
        )}
      </div>
    </main>
  );
}

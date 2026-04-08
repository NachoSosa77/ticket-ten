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
  params: Promise<{ slug: string }>;
};

export default async function PublicEventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      category: true,
      status: true,
      sessions: {
        where: {
          status: "SCHEDULED",
        },
        orderBy: {
          startsAt: "asc",
        },
        select: {
          id: true,
          startsAt: true,
          venueName: true,
          ticketTypes: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              stockTotal: true,
              stockSold: true,
            },
          },
        },
      },
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-50 transition hover:bg-white/20"
          >
            ← Volver al catálogo
          </Link>

          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{event.title}</h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-indigo-100">
            {event.category}
          </p>
          <p className="mt-4 max-w-3xl text-sm text-indigo-100 md:text-base">
            {event.description || "Este evento no tiene descripción cargada."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Funciones disponibles</h2>

          {event.sessions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
              Este evento todavía no tiene funciones disponibles.
            </div>
          ) : (
            <div className="space-y-3">
              {event.sessions.map((session) => {
                const availableStock = session.ticketTypes.reduce(
                  (acc, ticketType) =>
                    acc + (ticketType.stockTotal - ticketType.stockSold),
                  0,
                );
                const minPrice = session.ticketTypes.reduce<number | null>(
                  (acc, ticketType) => {
                    const stock = ticketType.stockTotal - ticketType.stockSold;
                    if (stock <= 0) return acc;
                    const price = Number(ticketType.price);
                    if (acc == null) return price;
                    return Math.min(acc, price);
                  },
                  null,
                );

                return (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {formatEventDateTime(session.startsAt)}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{session.venueName}</p>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          Desde {minPrice != null ? formatPrice(minPrice) : "—"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Stock disponible: {availableStock}
                        </p>
                      </div>

                      {availableStock > 0 ? (
                        <Link
                          href={`/eventos/${event.slug}/funciones/${session.id}/checkout`}
                          className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Comprar entradas
                        </Link>
                      ) : (
                        <span className="inline-flex rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                          Sin stock
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


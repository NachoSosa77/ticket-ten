import { formatEventDateTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatPrice(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value));
}

export default async function Home() {
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
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
            where: {
              isActive: true,
            },
            select: {
              id: true,
              price: true,
              stockTotal: true,
              stockSold: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold md:text-4xl">Ticketera</h1>
          <p className="mt-2 text-indigo-100">
            Comprá tus entradas para eventos publicados en simples pasos.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Eventos publicados</h2>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
              No hay eventos publicados en este momento.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => {
                const nextSession = event.sessions[0];
                const minPrice = nextSession?.ticketTypes.reduce<number | null>(
                  (acc, ticketType) => {
                    const hasStock = ticketType.stockTotal - ticketType.stockSold > 0;

                    if (!hasStock) return acc;
                    const price = Number(ticketType.price);
                    if (acc == null) return price;
                    return Math.min(acc, price);
                  },
                  null,
                );

                return (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
                      {event.category}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{event.title}</h3>

                    {nextSession ? (
                      <p className="mt-2 text-sm text-slate-600">
                        Próxima función: {formatEventDateTime(nextSession.startsAt)} ·{" "}
                        {nextSession.venueName}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">
                        Próximamente se publicarán funciones.
                      </p>
                    )}

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Desde {minPrice != null ? formatPrice(minPrice) : "—"}
                    </p>

                    <Link
                      href={`/eventos/${event.slug}`}
                      className="mt-4 inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Ver detalle
                    </Link>
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

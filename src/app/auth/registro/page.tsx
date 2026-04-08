import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterSelectorPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold">Crear cuenta</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Elegí qué tipo de cuenta querés crear.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Comprador</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cuenta para comprar entradas y consultar tu historial.
            </p>
            <Link
              href={`/auth/comprador/registro?next=${encodeURIComponent(nextPath)}`}
              className="mt-4 inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Crear cuenta de comprador
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Vendedor (admin)</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cuenta interna para administrar eventos, funciones y entradas.
            </p>
            <Link
              href={`/auth/admin/registro?next=${encodeURIComponent(nextPath)}`}
              className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Crear cuenta admin
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}

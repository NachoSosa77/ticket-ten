import Link from "next/link";

const stats = [
  {
    label: "Eventos activos",
    value: "12",
    delta: "+3 este mes",
    icon: "🎟️",
  },
  {
    label: "Funciones programadas",
    value: "37",
    delta: "+8 esta semana",
    icon: "🗓️",
  },
  {
    label: "Entradas vendidas",
    value: "4.281",
    delta: "+12.4% vs mes anterior",
    icon: "📈",
  },
  {
    label: "Ingresos estimados",
    value: "$ 18.560.000",
    delta: "Actualizado hace 5 min",
    icon: "💸",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
              ⚡ Dashboard central
            </span>

            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Bienvenido al panel de administración
            </h1>

            <p className="text-sm text-indigo-100 md:text-base">
              Gestioná eventos, funciones y tipos de entradas desde un único
              lugar con visibilidad rápida de la operación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/eventos"
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Ver eventos
            </Link>

            <Link
              href="/admin/eventos/nuevo"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50"
            >
              Crear evento
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <span className="text-lg" aria-hidden>
                {stat.icon}
              </span>
            </div>

            <p className="text-2xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </p>

            <p className="mt-2 text-xs font-medium text-emerald-700">
              {stat.delta}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Accesos rápidos
            </h2>
            <span className="text-xs font-medium text-gray-500">Atajos</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/eventos"
              className="group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition hover:border-indigo-200 hover:from-indigo-50 hover:to-white"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                Administrar eventos
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Editá estado, fecha y configuración general.
              </p>
            </Link>

            <Link
              href="/admin/eventos/nuevo"
              className="group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition hover:border-indigo-200 hover:from-indigo-50 hover:to-white"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                Publicar nuevo evento
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Creá un evento y empezá a vender entradas.
              </p>
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            <li className="rounded-lg bg-gray-50 px-3 py-2">
              ✅ Evento “Festival Urbano” publicado.
            </li>
            <li className="rounded-lg bg-gray-50 px-3 py-2">
              🟡 Función “Noche de Stand-up” actualizada.
            </li>
            <li className="rounded-lg bg-gray-50 px-3 py-2">
              📌 Nuevo tipo de entrada “VIP Early Access”.
            </li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Próximos pasos</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Revisar eventos en borrador y completar información pendiente.
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            Validar precios y cupos antes de publicar nuevas funciones.
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Monitorear ventas diarias y ajustar estrategia de difusión.
          </div>
        </div>
      </section>
    </div>
  );
}

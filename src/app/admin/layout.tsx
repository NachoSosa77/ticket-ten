import { logoutAdminAction } from "@/app/actions/admin-auth.actions";
import { requireAdminUser } from "@/lib/auth/session";
import Link from "next/link";

const navigation = [
  {
    href: "/admin",
    title: "Dashboard",
    description: "Vista general y métricas",
    icon: "📊",
  },
  {
    href: "/admin/eventos",
    title: "Eventos",
    description: "Gestión de eventos y estado",
    icon: "🎟️",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdminUser("/admin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-indigo-50/50 to-white text-slate-900">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-slate-200/70 bg-white/80 p-6 backdrop-blur xl:block">
          <div className="mb-8 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-5 text-white shadow-lg">
            <p className="text-xs font-medium tracking-[0.14em] text-indigo-100">
              PANEL INTERNO
            </p>
            <h1 className="mt-2 text-xl font-semibold">Ticketera Admin</h1>
            <p className="mt-2 text-sm text-indigo-100/90">
              Operá eventos, funciones y entradas desde una única consola.
            </p>
            <p className="mt-3 text-xs text-indigo-100/80">
              Sesión: <span className="font-semibold">{adminUser.email}</span>
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-base" aria-hidden>
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          <form action={logoutAdminAction} className="mt-6">
            <input type="hidden" name="next" value="/auth/admin/ingresar" />
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Cerrar sesión admin
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

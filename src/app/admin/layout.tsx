import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white p-6">
        <h1 className="text-xl font-semibold mb-6">
          Ticketera Admin
        </h1>

        <nav className="space-y-2 text-sm">

          <Link
            href="/admin"
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/eventos"
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
          >
            Eventos
          </Link>

        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

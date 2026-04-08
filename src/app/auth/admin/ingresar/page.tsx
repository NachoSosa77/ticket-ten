import AdminLoginForm from "@/features/auth/forms/AdminLoginForm";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/admin";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-lg space-y-5">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold">Ingreso admin</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Accedé al panel interno para gestionar eventos, funciones y entradas.
          </p>
        </section>

        <AdminLoginForm nextPath={nextPath} />

        <p className="text-sm text-slate-600">
          ¿Necesitás crear un admin?{" "}
          <Link
            href={`/auth/admin/registro?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Registrar admin
          </Link>
        </p>
      </div>
    </main>
  );
}

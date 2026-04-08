import AdminRegisterForm from "@/features/auth/forms/AdminRegisterForm";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AdminRegisterPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/admin";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-lg space-y-5">
        <section className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
          <h1 className="text-3xl font-semibold">Registrar admin</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Creá una cuenta administradora para operar el panel interno.
          </p>
        </section>

        <AdminRegisterForm nextPath={nextPath} />

        <p className="text-sm text-slate-600">
          ¿Ya tenés cuenta admin?{" "}
          <Link
            href={`/auth/admin/ingresar?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}


import EventCreateForm from "@/features/events/forms/EventCreateForm";

export default function NewEventPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
            🆕 Nuevo evento
          </span>

          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Crear nuevo evento
          </h1>

          <p className="max-w-2xl text-sm text-indigo-100 md:text-base">
            Completá la información principal para publicar tu evento con una
            estructura clara y consistente dentro del panel de administración.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EventCreateForm />
      </section>
    </div>
  );
}

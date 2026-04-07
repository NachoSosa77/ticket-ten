import EventEditForm from "@/features/events/forms/EventEditForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isFinite(eventId)) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      category: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <div>
            <Link
              href="/admin/eventos"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
            >
              ← Volver a eventos
            </Link>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
            ✏️ Editar evento
          </span>

          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Actualizar configuración del evento
          </h1>

          <p className="max-w-2xl text-sm text-indigo-100 md:text-base">
            Ajustá la información general, el estado de publicación y los
            detalles visuales para mantener la consistencia del catálogo.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <EventEditForm
          event={{
            id: event.id,
            title: event.title,
            slug: event.slug,
            description: event.description ?? "",
            imageUrl: event.imageUrl ?? "",
            category: event.category,
            status: event.status,
          }}
        />
      </section>
    </div>
  );
}

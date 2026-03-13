import EventSessionCreateForm from "@/features/events/forms/EventSessionCreateForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewEventSessionPage({ params }: PageProps) {
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
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/eventos/${event.id}/funciones`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver a funciones
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">Nueva función</h1>
        <p className="text-sm text-gray-500">
          Evento: {event.title}
        </p>
      </div>

      <EventSessionCreateForm eventId={event.id} />
    </div>
  );
}

import EventEditForm from "@/features/events/forms/EventEditForm";
import { prisma } from "@/lib/prisma";
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
    <main className="p-6">
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
    </main>
  );
}

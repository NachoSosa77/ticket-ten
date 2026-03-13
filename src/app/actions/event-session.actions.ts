"use server";

import { eventSessionFormSchema } from "@/features/events/forms/eventSessionForm.schema";
import { parseDatetimeLocal } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateEventSessionActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function createEventSessionAction(
  eventId: number,
  formData: FormData,
): Promise<CreateEventSessionActionState> {
  const rawData = {
    venueName: formData.get("venueName"),
    startsAt: formData.get("startsAt"),
  };

  const parsed = eventSessionFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        venueName: fieldErrors.venueName?.[0] ?? "",
        startsAt: fieldErrors.startsAt?.[0] ?? "",
      },
    };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    return {
      success: false,
      message: "El evento no existe.",
    };
  }

  try {
    await prisma.eventSession.create({
      data: {
        eventId,
        venueName: parsed.data.venueName,
        startsAt: parseDatetimeLocal(parsed.data.startsAt),
        status: "SCHEDULED",
      },
    });
  } catch (error) {
    console.error("Error al crear función:", error);

    return {
      success: false,
      message: "Ocurrió un error al crear la función.",
    };
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones`);
  redirect(`/admin/eventos/${eventId}/funciones?success=created`);
}

export async function updateEventSessionAction(
  eventId: number,
  sessionId: number,
  formData: FormData,
): Promise<CreateEventSessionActionState> {
  const rawData = {
    venueName: formData.get("venueName"),
    startsAt: formData.get("startsAt"),
  };

  const parsed = eventSessionFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        venueName: fieldErrors.venueName?.[0] ?? "",
        startsAt: fieldErrors.startsAt?.[0] ?? "",
      },
    };
  }

  const session = await prisma.eventSession.findFirst({
    where: {
      id: sessionId,
      eventId,
    },
    select: {
      id: true,
    },
  });

  if (!session) {
    return {
      success: false,
      message: "La función no existe.",
    };
  }

  try {
    await prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        venueName: parsed.data.venueName,
        startsAt: parseDatetimeLocal(parsed.data.startsAt),
      },
    });
  } catch (error) {
    console.error("Error al actualizar función:", error);

    return {
      success: false,
      message: "Ocurrió un error al actualizar la función.",
    };
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones`);
  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/editar`);
  redirect(`/admin/eventos/${eventId}/funciones?success=updated`);
}

export async function cancelEventSessionAction(
  eventId: number,
  sessionId: number,
) {
  try {
    const session = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      redirect(`/admin/eventos/${eventId}/funciones?error=cancel`);
    }

    await prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
      },
    });
  } catch (error) {
    console.error("Error al cancelar función:", error);
    redirect(`/admin/eventos/${eventId}/funciones?error=cancel`);
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones`);
  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/editar`);
  redirect(`/admin/eventos/${eventId}/funciones?success=cancelled`);
}

export async function reactivateEventSessionAction(
  eventId: number,
  sessionId: number,
) {
  try {
    const session = await prisma.eventSession.findFirst({
      where: {
        id: sessionId,
        eventId,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      redirect(`/admin/eventos/${eventId}/funciones?error=reactivate`);
    }

    await prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        status: "SCHEDULED",
      },
    });
  } catch (error) {
    console.error("Error al reactivar función:", error);
    redirect(`/admin/eventos/${eventId}/funciones?error=reactivate`);
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones`);
  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/editar`);

  redirect(`/admin/eventos/${eventId}/funciones?success=reactivated`);
}

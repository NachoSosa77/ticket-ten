"use server";

import { eventFormSchema } from "@/features/events/forms/eventForm.schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateEventActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function createEventAction(
  _prevState: CreateEventActionState,
  formData: FormData,
): Promise<CreateEventActionState> {
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    category: formData.get("category"),
  };

  const parsed = eventFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        title: fieldErrors.title?.[0] ?? "",
        slug: fieldErrors.slug?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        imageUrl: fieldErrors.imageUrl?.[0] ?? "",
        category: fieldErrors.category?.[0] ?? "",
      },
    };
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (existingEvent) {
      return {
        success: false,
        message: "Ya existe un evento con ese slug.",
        errors: {
          slug: "Ese slug ya está en uso.",
        },
      };
    }

    await prisma.event.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        imageUrl: parsed.data.imageUrl || null,
        category: parsed.data.category,
        status: "DRAFT",
        createdById: 1,
      },
    });
  } catch (error) {
    console.error("Error al crear evento:", error);

    return {
      success: false,
      message: "Ocurrió un error al crear el evento.",
    };
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=created");
}

export async function updateEventAction(
  eventId: number,
  formData: FormData,
): Promise<CreateEventActionState> {
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    category: formData.get("category"),
  };

  const parsed = eventFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        title: fieldErrors.title?.[0] ?? "",
        slug: fieldErrors.slug?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        imageUrl: fieldErrors.imageUrl?.[0] ?? "",
        category: fieldErrors.category?.[0] ?? "",
      },
    };
  }

  try {
    const existingEvent = await prisma.event.findFirst({
      where: {
        slug: parsed.data.slug,
        NOT: {
          id: eventId,
        },
      },
      select: { id: true },
    });

    if (existingEvent) {
      return {
        success: false,
        message: "Ya existe otro evento con ese slug.",
        errors: {
          slug: "Ese slug ya está en uso.",
        },
      };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        imageUrl: parsed.data.imageUrl || null,
        category: parsed.data.category,
      },
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error);

    return {
      success: false,
      message: "Ocurrió un error al actualizar el evento.",
    };
  }

  revalidatePath("/admin/eventos");
  revalidatePath(`/admin/eventos/${eventId}/editar`);
  redirect("/admin/eventos?success=updated");
}

export async function publishEventAction(eventId: number) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "PUBLISHED",
      },
    });
  } catch (error) {
    console.error("Error al publicar evento:", error);
    redirect("/admin/eventos?error=publish");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=published");
}

export async function cancelEventAction(eventId: number) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "CANCELLED",
      },
    });
  } catch (error) {
    console.error("Error al cancelar evento:", error);
    redirect("/admin/eventos?error=cancel");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=cancelled");
}

export async function reactivateEventAction(eventId: number) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "DRAFT",
      },
    });
  } catch (error) {
    console.error("Error al reactivar evento:", error);
    redirect("/admin/eventos?error=reactivate");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=reactivated");
}

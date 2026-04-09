"use server";

import { eventFormSchema } from "@/features/events/forms/eventForm.schema";
import { requireAdminUser } from "@/lib/auth/session";
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
  const adminUser = await requireAdminUser("/admin/eventos/nuevo");

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
        createdById: adminUser.id,
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
  const adminUser = await requireAdminUser(`/admin/eventos/${eventId}/editar`);

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
    const ownEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        createdById: adminUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!ownEvent) {
      return {
        success: false,
        message: "No tienes permisos para editar este evento.",
      };
    }

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
  const adminUser = await requireAdminUser("/admin/eventos");
  let forbidden = false;

  try {
    const updated = await prisma.event.updateMany({
      where: { id: eventId, createdById: adminUser.id },
      data: {
        status: "PUBLISHED",
      },
    });

    forbidden = updated.count !== 1;
  } catch (error) {
    console.error("Error al publicar evento:", error);
    redirect("/admin/eventos?error=publish");
  }

  if (forbidden) {
    redirect("/admin/eventos?error=forbidden");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=published");
}

export async function cancelEventAction(eventId: number) {
  const adminUser = await requireAdminUser("/admin/eventos");
  let forbidden = false;

  try {
    const updated = await prisma.event.updateMany({
      where: { id: eventId, createdById: adminUser.id },
      data: {
        status: "CANCELLED",
      },
    });

    forbidden = updated.count !== 1;
  } catch (error) {
    console.error("Error al cancelar evento:", error);
    redirect("/admin/eventos?error=cancel");
  }

  if (forbidden) {
    redirect("/admin/eventos?error=forbidden");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=cancelled");
}

export async function reactivateEventAction(eventId: number) {
  const adminUser = await requireAdminUser("/admin/eventos");
  let forbidden = false;

  try {
    const updated = await prisma.event.updateMany({
      where: { id: eventId, createdById: adminUser.id },
      data: {
        status: "DRAFT",
      },
    });

    forbidden = updated.count !== 1;
  } catch (error) {
    console.error("Error al reactivar evento:", error);
    redirect("/admin/eventos?error=reactivate");
  }

  if (forbidden) {
    redirect("/admin/eventos?error=forbidden");
  }

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos?success=reactivated");
}

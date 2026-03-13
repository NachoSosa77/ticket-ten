"use server";

import { ticketTypeFormSchema } from "@/features/events/forms/ticketTypeForm.schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateTicketTypeActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function createTicketTypeAction(
  eventId: number,
  sessionId: number,
  formData: FormData,
): Promise<CreateTicketTypeActionState> {
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stockTotal: formData.get("stockTotal"),
    maxPerPurchase: formData.get("maxPerPurchase"),
    isActive: formData.get("isActive") === "true",
  };

  const parsed = ticketTypeFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        name: fieldErrors.name?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        price: fieldErrors.price?.[0] ?? "",
        stockTotal: fieldErrors.stockTotal?.[0] ?? "",
        maxPerPurchase: fieldErrors.maxPerPurchase?.[0] ?? "",
        isActive: fieldErrors.isActive?.[0] ?? "",
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
    await prisma.ticketType.create({
      data: {
        sessionId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        stockTotal: parsed.data.stockTotal,
        stockSold: 0,
        maxPerPurchase: parsed.data.maxPerPurchase ?? null,
        isActive: parsed.data.isActive,
      },
    });
  } catch (error) {
    console.error("Error al crear tipo de entrada:", error);

    return {
      success: false,
      message: "Ocurrió un error al crear la entrada.",
    };
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/entradas`);
  redirect(
    `/admin/eventos/${eventId}/funciones/${sessionId}/entradas?success=created`,
  );
}

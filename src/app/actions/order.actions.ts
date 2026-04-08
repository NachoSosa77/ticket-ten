"use server";

import { buildCheckoutFormSchema } from "@/features/checkout/forms/checkoutForm.schema";
import { getCurrentBuyerUser } from "@/lib/auth/session";
import { generateOrderCode } from "@/lib/order-code";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateOrderActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

class CheckoutValidationError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

async function createConfirmedOrderTransaction(
  sessionId: number,
  formData: FormData,
) {
  const currentBuyer = await getCurrentBuyerUser();

  const session = await prisma.eventSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      eventId: true,
      event: {
        select: {
          id: true,
          slug: true,
          status: true,
        },
      },
      ticketTypes: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          stockTotal: true,
          stockSold: true,
          maxPerPurchase: true,
        },
      },
    },
  });

  if (
    !session ||
    session.event.status !== "PUBLISHED" ||
    session.status !== "SCHEDULED"
  ) {
    throw new CheckoutValidationError(
      "La función no está disponible para la compra.",
    );
  }

  if (session.ticketTypes.length === 0) {
    throw new CheckoutValidationError(
      "No hay tipos de entrada disponibles para esta función.",
    );
  }

  const schema = buildCheckoutFormSchema(
    session.ticketTypes.map((ticketType) => ({
      id: ticketType.id,
      maxPerPurchase: ticketType.maxPerPurchase,
    })),
  );

  const rawData: Record<string, string | number> = {
    buyerName: currentBuyer?.name ?? String(formData.get("buyerName") ?? ""),
    buyerEmail:
      currentBuyer?.email ??
      String(formData.get("buyerEmail") ?? "").toLowerCase(),
  };

  for (const ticketType of session.ticketTypes) {
    rawData[`quantity_${ticketType.id}`] = Number(
      formData.get(`quantity_${ticketType.id}`) ?? 0,
    );
  }

  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false as const,
      state: {
        success: false,
        message: "Hay errores en el checkout.",
        errors: {
          buyerName: fieldErrors.buyerName?.[0] ?? "",
          buyerEmail: fieldErrors.buyerEmail?.[0] ?? "",
          quantities: fieldErrors.quantities?.[0] ?? "",
          ...Object.fromEntries(
            session.ticketTypes.map((ticketType) => [
              `quantity_${ticketType.id}`,
              fieldErrors[`quantity_${ticketType.id}`]?.[0] ?? "",
            ]),
          ),
        },
      } satisfies CreateOrderActionState,
    };
  }

  const selectedItems = session.ticketTypes
    .map((ticketType) => ({
      ticketTypeId: ticketType.id,
      quantity: Number(parsed.data[`quantity_${ticketType.id}`] ?? 0),
    }))
    .filter((item) => item.quantity > 0);

  if (selectedItems.length === 0) {
    return {
      ok: false as const,
      state: {
        success: false,
        message: "Debes seleccionar al menos una entrada.",
        errors: {
          quantities: "Debes seleccionar al menos una entrada.",
        },
      } satisfies CreateOrderActionState,
    };
  }

  let orderCode = "";
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      orderCode = generateOrderCode();

      await prisma.$transaction(async (tx) => {
        const sessionInsideTx = await tx.eventSession.findUnique({
          where: { id: sessionId },
          select: {
            id: true,
            status: true,
            event: {
              select: {
                status: true,
              },
            },
          },
        });

        if (
          !sessionInsideTx ||
          sessionInsideTx.status !== "SCHEDULED" ||
          sessionInsideTx.event.status !== "PUBLISHED"
        ) {
          throw new CheckoutValidationError(
            "La función dejó de estar disponible.",
          );
        }

        const orderItemsData: {
          ticketTypeId: number;
          quantity: number;
          unitPrice: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }[] = [];
        let totalAmount = new Prisma.Decimal(0);

        for (const item of selectedItems) {
          const ticketType = await tx.ticketType.findFirst({
            where: {
              id: item.ticketTypeId,
              sessionId,
              isActive: true,
            },
            select: {
              id: true,
              stockTotal: true,
              stockSold: true,
              price: true,
              maxPerPurchase: true,
            },
          });

          if (!ticketType) {
            throw new CheckoutValidationError(
              "Una de las entradas ya no está disponible.",
            );
          }

          if (
            ticketType.maxPerPurchase != null &&
            item.quantity > ticketType.maxPerPurchase
          ) {
            throw new CheckoutValidationError(
              `Se superó el máximo por compra para un tipo de entrada.`,
              `quantity_${ticketType.id}`,
            );
          }

          const available = ticketType.stockTotal - ticketType.stockSold;
          if (item.quantity > available) {
            throw new CheckoutValidationError(
              "No hay stock suficiente para una de las entradas seleccionadas.",
              `quantity_${ticketType.id}`,
            );
          }

          const updated = await tx.ticketType.updateMany({
            where: {
              id: ticketType.id,
              stockSold: ticketType.stockSold,
            },
            data: {
              stockSold: {
                increment: item.quantity,
              },
            },
          });

          if (updated.count !== 1) {
            throw new CheckoutValidationError(
              "El stock cambió mientras procesábamos tu compra. Intenta nuevamente.",
            );
          }

          const quantityDecimal = new Prisma.Decimal(item.quantity);
          const subtotal = ticketType.price.mul(quantityDecimal);
          totalAmount = totalAmount.add(subtotal);

          orderItemsData.push({
            ticketTypeId: ticketType.id,
            quantity: item.quantity,
            unitPrice: ticketType.price,
            subtotal,
          });
        }

        const createdOrder = await tx.order.create({
          data: {
            orderCode,
            sessionId,
            buyerName: String(parsed.data.buyerName),
            buyerEmail: String(parsed.data.buyerEmail).toLowerCase(),
            buyerUserId: currentBuyer?.id,
            totalAmount,
            status: "CONFIRMED",
          },
          select: {
            id: true,
          },
        });

        await tx.orderItem.createMany({
          data: orderItemsData.map((orderItem) => ({
            orderId: createdOrder.id,
            ticketTypeId: orderItem.ticketTypeId,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
            subtotal: orderItem.subtotal,
          })),
        });
      });

      break;
    } catch (error) {
      if (error instanceof CheckoutValidationError) {
        return {
          ok: false as const,
          state: {
            success: false,
            message: error.message,
            errors: error.field ? { [error.field]: error.message } : undefined,
          } satisfies CreateOrderActionState,
        };
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < maxAttempts - 1
      ) {
        continue;
      }

      throw error;
    }
  }

  if (!orderCode) {
    throw new Error("No se pudo generar código de orden");
  }

  return {
    ok: true as const,
    orderCode,
    eventId: session.eventId,
    eventSlug: session.event.slug,
    sessionId: session.id,
  };
}

export async function createOrderCheckoutAction(
  sessionId: number,
  formData: FormData,
): Promise<CreateOrderActionState> {
  let result: Awaited<ReturnType<typeof createConfirmedOrderTransaction>>;

  try {
    result = await createConfirmedOrderTransaction(sessionId, formData);
  } catch (error) {
    console.error("Error al generar orden:", error);

    return {
      success: false,
      message: "Ocurrió un error al procesar la compra.",
    };
  }

  if (!result.ok) {
    return result.state;
  }

  revalidatePath("/");
  revalidatePath(`/eventos/${result.eventSlug}`);
  revalidatePath(
    `/eventos/${result.eventSlug}/funciones/${result.sessionId}/checkout`,
  );
  revalidatePath(
    `/admin/eventos/${result.eventId}/funciones/${result.sessionId}/entradas`,
  );
  revalidatePath(
    `/admin/eventos/${result.eventId}/funciones/${result.sessionId}/ordenes`,
  );
  redirect(`/orden/${result.orderCode}`);
}

export async function cancelOrderAction(
  eventId: number,
  sessionId: number,
  orderId: number,
) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          sessionId,
        },
        select: {
          id: true,
          status: true,
          items: {
            select: {
              id: true,
              ticketTypeId: true,
              quantity: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("La orden no existe");
      }

      if (order.status === "CANCELLED") {
        return;
      }

      for (const item of order.items) {
        const updated = await tx.ticketType.updateMany({
          where: {
            id: item.ticketTypeId,
            stockSold: {
              gte: item.quantity,
            },
          },
          data: {
            stockSold: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("No se pudo devolver stock de la orden");
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          refundReason: "Cancelación manual desde admin",
          refundedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error("Error al cancelar orden:", error);
    redirect(
      `/admin/eventos/${eventId}/funciones/${sessionId}/ordenes?error=cancel`,
    );
  }

  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/ordenes`);
  revalidatePath(`/admin/eventos/${eventId}/funciones/${sessionId}/entradas`);
  redirect(
    `/admin/eventos/${eventId}/funciones/${sessionId}/ordenes?success=cancelled`,
  );
}

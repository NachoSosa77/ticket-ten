"use server";

import { buyerLoginFormSchema } from "@/features/auth/forms/buyerLoginForm.schema";
import { buyerRegisterFormSchema } from "@/features/auth/forms/buyerRegisterForm.schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createBuyerSession, destroyBuyerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type BuyerAuthActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function registerBuyerAction(
  _prevState: BuyerAuthActionState,
  formData: FormData,
): Promise<BuyerAuthActionState> {
  const rawData = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const nextPath = String(formData.get("next") ?? "/mi-cuenta");

  const parsed = buyerRegisterFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        name: fieldErrors.name?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? "",
      },
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const existingUser = await prisma.buyerUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Ya existe una cuenta con ese email.",
        errors: {
          email: "Ese email ya está registrado.",
        },
      };
    }

    const buyerUser = await prisma.buyerUser.create({
      data: {
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash: hashPassword(parsed.data.password),
      },
      select: {
        id: true,
      },
    });

    await prisma.order.updateMany({
      where: {
        buyerUserId: null,
        buyerEmail: normalizedEmail,
      },
      data: {
        buyerUserId: buyerUser.id,
      },
    });
  } catch (error) {
    console.error("Error al registrar comprador:", error);

    return {
      success: false,
      message: "Ocurrió un error al crear la cuenta.",
    };
  }

  const buyer = await prisma.buyerUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!buyer) {
    return {
      success: false,
      message: "No se pudo iniciar sesión con la cuenta creada.",
    };
  }

  await createBuyerSession(buyer.id, nextPath);

  return {
    success: true,
  };
}

export async function loginBuyerAction(
  _prevState: BuyerAuthActionState,
  formData: FormData,
): Promise<BuyerAuthActionState> {
  const rawData = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const nextPath = String(formData.get("next") ?? "/mi-cuenta");

  const parsed = buyerLoginFormSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Hay errores en el formulario.",
      errors: {
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      },
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const buyerUser = await prisma.buyerUser.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (
      !buyerUser ||
      !buyerUser.isActive ||
      !verifyPassword(parsed.data.password, buyerUser.passwordHash)
    ) {
      return {
        success: false,
        message: "Credenciales inválidas.",
        errors: {
          email: "Revisa email y contraseña.",
          password: "Revisa email y contraseña.",
        },
      };
    }

    await prisma.order.updateMany({
      where: {
        buyerUserId: null,
        buyerEmail: normalizedEmail,
      },
      data: {
        buyerUserId: buyerUser.id,
      },
    });

    await createBuyerSession(buyerUser.id, nextPath);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al iniciar sesión de comprador:", error);

    return {
      success: false,
      message: "Ocurrió un error al iniciar sesión.",
    };
  }
}

export async function logoutBuyerAction(formData: FormData) {
  await destroyBuyerSession();

  const nextPath = String(formData.get("next") ?? "/");
  if (nextPath.startsWith("/")) {
    redirect(nextPath);
  }

  redirect("/");
}

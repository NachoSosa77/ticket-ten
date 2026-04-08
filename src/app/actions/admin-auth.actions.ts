"use server";

import { adminLoginFormSchema } from "@/features/auth/forms/adminLoginForm.schema";
import { adminRegisterFormSchema } from "@/features/auth/forms/adminRegisterForm.schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type AdminAuthActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function loginAdminAction(
  _prevState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const rawData = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const nextPath = String(formData.get("next") ?? "/admin");

  const parsed = adminLoginFormSchema.safeParse(rawData);

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
  let authenticatedAdminId: number | null = null;

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (
      !adminUser ||
      !adminUser.isActive ||
      !verifyPassword(parsed.data.password, adminUser.passwordHash)
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

    authenticatedAdminId = adminUser.id;
  } catch (error) {
    console.error("Error al iniciar sesión de admin:", error);

    return {
      success: false,
      message: "Ocurrió un error al iniciar sesión.",
    };
  }

  await createAdminSession(authenticatedAdminId, nextPath);

  return {
    success: true,
  };
}

export async function logoutAdminAction(formData: FormData) {
  await destroyAdminSession();

  const nextPath = String(formData.get("next") ?? "/auth/admin/ingresar");
  if (nextPath.startsWith("/")) {
    redirect(nextPath);
  }

  redirect("/auth/admin/ingresar");
}

export async function registerAdminAction(
  _prevState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const rawData = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const nextPath = String(formData.get("next") ?? "/admin");

  const parsed = adminRegisterFormSchema.safeParse(rawData);

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
  let createdAdminId: number | null = null;

  try {
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Ya existe una cuenta admin con ese email.",
        errors: {
          email: "Ese email ya está registrado.",
        },
      };
    }

    const adminUser = await prisma.adminUser.create({
      data: {
        name: parsed.data.name,
        email: normalizedEmail,
        passwordHash: hashPassword(parsed.data.password),
      },
      select: {
        id: true,
      },
    });

    createdAdminId = adminUser.id;
  } catch (error) {
    console.error("Error al registrar administrador:", error);

    return {
      success: false,
      message: "Ocurrió un error al crear la cuenta admin.",
    };
  }

  await createAdminSession(createdAdminId, nextPath);

  return {
    success: true,
  };
}

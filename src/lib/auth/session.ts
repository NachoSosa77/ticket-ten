import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";

const BUYER_SESSION_COOKIE = "buyer_session";
const BUYER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sanitizeNextPath(pathname?: string | null) {
  if (!pathname || !pathname.startsWith("/")) {
    return "/mi-cuenta";
  }

  return pathname;
}

function sanitizeAdminNextPath(pathname?: string | null) {
  if (!pathname || !pathname.startsWith("/")) {
    return "/admin";
  }

  return pathname;
}

export type BuyerAuthUser = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
};

export type AdminAuthUser = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
};

export async function createBuyerSession(
  buyerUserId: number,
  nextPath?: string | null,
) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + BUYER_SESSION_TTL_MS);

  await prisma.buyerSession.create({
    data: {
      buyerUserId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(BUYER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect(sanitizeNextPath(nextPath));
}

export async function destroyBuyerSession() {
  const cookieStore = await cookies();
  const current = cookieStore.get(BUYER_SESSION_COOKIE)?.value;

  if (current) {
    await prisma.buyerSession.deleteMany({
      where: {
        tokenHash: hashToken(current),
      },
    });
  }

  cookieStore.delete(BUYER_SESSION_COOKIE);
}

export async function getCurrentBuyerUser(): Promise<BuyerAuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(BUYER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.buyerSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    select: {
      id: true,
      expiresAt: true,
      buyerUser: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.buyerUser.isActive
  ) {
    if (session?.id) {
      await prisma.buyerSession.delete({ where: { id: session.id } });
    }

    cookieStore.delete(BUYER_SESSION_COOKIE);
    return null;
  }

  return session.buyerUser;
}

export async function requireBuyerUser(nextPath?: string) {
  const buyerUser = await getCurrentBuyerUser();

  if (!buyerUser) {
    const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth/ingresar${qs}`);
  }

  return buyerUser;
}

export async function createAdminSession(
  adminUserId: number,
  nextPath?: string | null,
) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect(sanitizeAdminNextPath(nextPath));
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const current = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (current) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: hashToken(current),
      },
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdminUser(): Promise<AdminAuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    select: {
      id: true,
      expiresAt: true,
      adminUser: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.adminUser.isActive
  ) {
    if (session?.id) {
      await prisma.adminSession.delete({ where: { id: session.id } });
    }

    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return null;
  }

  return session.adminUser;
}

export async function requireAdminUser(nextPath?: string) {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth/admin/ingresar${qs}`);
  }

  return adminUser;
}

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from "@prisma/client";

export const ADMIN_ROLES = ["Super Admin", "Content Editor", "Publisher", "User Manager", "Viewer"] as const;
export type AdminRole = typeof ADMIN_ROLES[number];
const SESSION_DAYS = 8;
const prisma = new PrismaClient();

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
const verifyPassword = (password: string, encoded: string) => {
  const [, salt, expected] = encoded.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const target = Buffer.from(expected, "hex");
  return target.length === actual.length && timingSafeEqual(target, actual);
};
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const readCookie = (request: FastifyRequest, name: string) => request.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1);
const cookie = (token: string, maxAge: number) => `company_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

export async function ensureAdminBootstrap() {
  const count = await prisma.adminUser.count();
  if (count > 0) return;
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@movera.local").trim().toLowerCase();
  const name = (process.env.ADMIN_BOOTSTRAP_NAME || "admin").trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
  if (!password) return;
  const now = new Date().toISOString();
  await prisma.adminUser.create({ data: { id: randomUUID(), email, name, passwordHash: hashPassword(password), role: "Super Admin", active: true, createdAt: now, updatedAt: now } });
}

export async function authenticate(request: FastifyRequest) {
  const raw = readCookie(request, "company_admin_session");
  if (!raw) return null;
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: hashToken(raw) }, include: { user: true } });
  if (!session || new Date(session.expiresAt) <= new Date() || !session.user.active) return null;
  return session.user;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply, roles?: AdminRole[]) {
  const user = await authenticate(request);
  if (!user) { await reply.code(401).send({ ok: false, error: { code: "ADMIN_UNAUTHENTICATED" } }); return null; }
  if (roles && !roles.includes(user.role as AdminRole)) { await reply.code(403).send({ ok: false, error: { code: "ADMIN_FORBIDDEN" } }); return null; }
  return user;
}

export async function login(email: string, password: string, reply: FastifyReply) {
  const identitySettings = await prisma.adminIdentitySettings.findUnique({ where: { id: "default" } });
  if (identitySettings && !identitySettings.localEnabled) return null;
  const user = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) return null;
  const raw = randomBytes(32).toString("base64url");
  const now = new Date();
  await prisma.adminSession.create({ data: { id: randomUUID(), tokenHash: hashToken(raw), userId: user.id, expiresAt: new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString(), createdAt: now.toISOString() } });
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: now.toISOString() } });
  reply.header("set-cookie", cookie(raw, SESSION_DAYS * 86400));
  return user;
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const raw = readCookie(request, "company_admin_session");
  if (raw) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(raw) } });
  reply.header("set-cookie", cookie("", 0));
}

export async function audit(userId: string, action: string, entity: string, entityId?: string, metadata?: unknown) {
  await prisma.adminAuditEvent.create({ data: { id: randomUUID(), userId, action, entity, entityId, metadata: metadata ? JSON.stringify(metadata) : undefined, createdAt: new Date().toISOString() } });
}

export const adminPublicUser = (user: { id: string; email: string; name: string; role: string; active: boolean; forcePasswordReset: boolean; lastLoginAt: string | null; createdAt: string }) => ({ id: user.id, email: user.email, name: user.name, role: user.role, active: user.active, forcePasswordReset: user.forcePasswordReset, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt });
export { hashPassword, prisma };

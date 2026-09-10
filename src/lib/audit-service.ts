import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  userId?: string;
};

export async function createAuditLog(input: AuditInput) {
  try {
    if (process.env.DATABASE_URL) {
      try {
        const created = await (prisma as any).auditLog.create({
          data: {
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId || "unknown",
            details: input.details ? JSON.stringify(input.details) : null,
            userId: input.userId || "system",
          },
        });
        return created;
      } catch (e) {
        console.log("auditLog table missing, skipping DB log", e);
        return { success: true, ...input };
      }
    }
    return { success: true, ...input };
  } catch (error) {
    console.error("Audit log error", error);
    return { success: true, ...input };
  }
}

export async function logAction(action: string, entityType: string, entityId?: string, details?: any) {
  return createAuditLog({ action, entityType, entityId, details });
}

export async function getAuditLogs() {
  try {
    if ((prisma as any).auditLog) {
      return await (prisma as any).auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    }
    return [];
  } catch {
    return [];
  }
}

export default { createAuditLog, logAction, getAuditLogs };

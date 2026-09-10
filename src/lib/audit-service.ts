import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditEventInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuditLogFilters = {
  q?: string;
  entityType?: string;
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export function getRequestMetadata(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return { ipAddress, userAgent };
}

export type AuditLogRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  details?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
};

const auditMemory: AuditLogRecord[] = [];

function buildAuditDetails(input: AuditEventInput) {
  return {
    actorName: input.actorName ?? null,
    entityId: input.entityId ?? null,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    metadata: input.metadata ?? {},
  } as Prisma.InputJsonValue;
}

function withDefaults(input: AuditEventInput): AuditLogRecord {
  const now = new Date();
  return {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    actorId: input.actorId ?? null,
    actorName: input.actorName ?? null,
    details: buildAuditDetails(input),
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: now,
  };
}

export async function recordAuditEvent(input: AuditEventInput): Promise<AuditLogRecord> {
  const entry = withDefaults(input);

  if (process.env.DATABASE_URL) {
    try {
      const created = await prisma.auditLog.create({
        data: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          actorId: input.actorId ?? null,
          details: buildAuditDetails(input),
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });

      return {
        ...entry,
        id: created.id,
        createdAt: created.createdAt,
        details: (created.details as Prisma.InputJsonValue | null) ?? null,
      };
    } catch (error) {
      console.warn("Falling back to in-memory audit logging because Prisma audit write failed:", error);
    }
  }

  auditMemory.unshift(entry);
  return entry;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const page = Math.max(1, Number(filters.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize ?? 20)));

  const query = (filters.q ?? "").trim().toLowerCase();
  const entityType = filters.entityType?.trim();
  const action = filters.action?.trim();

  let rows: AuditLogRecord[];

  if (process.env.DATABASE_URL) {
    try {
      const where: Prisma.AuditLogWhereInput = {
        ...(entityType ? { entityType } : {}),
        ...(action ? { action } : {}),
        ...(filters.actorId ? { actorId: filters.actorId } : {}),
        ...(filters.from || filters.to ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
          },
        } : {}),
      };

      const items = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      rows = items.map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        actorId: item.actorId,
        actorName: (item.details as Record<string, unknown> | null)?.actorName as string | null ?? null,
        details: (item.details as Prisma.InputJsonValue | null) ?? null,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        createdAt: item.createdAt,
      }));
    } catch (error) {
      console.warn("Falling back to in-memory audit query because Prisma audit read failed:", error);
      rows = auditMemory;
    }
  } else {
    rows = auditMemory;
  }

  const filtered = rows.filter((entry) => {
    if (query) {
      const haystack = [
        entry.action,
        entry.entityType,
        entry.entityId ?? "",
        entry.actorName ?? "",
        entry.actorId ?? "",
        JSON.stringify(entry.details ?? {}),
      ].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.from || filters.to) {
      const time = entry.createdAt.getTime();
      const from = filters.from ? new Date(filters.from).getTime() : Number.NEGATIVE_INFINITY;
      const to = filters.to ? new Date(filters.to).getTime() : Number.POSITIVE_INFINITY;
      if (time < from || time > to) return false;
    }

    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { data: paginated, meta: { page: safePage, pageSize, total, totalPages } };
}

export async function recordAuditEventFromRequest(request: Request, input: Omit<AuditEventInput, "ipAddress" | "userAgent">) {
  const metadata = getRequestMetadata(request);
  return recordAuditEvent({
    ...input,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });
}

export async function getAuditLogViewerData() {
  const result = await getAuditLogs({ page: 1, pageSize: 20 });
  return result;
}

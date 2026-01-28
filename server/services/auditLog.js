import prisma from '../db/prisma.js';
import { AUDIT_LOG_ENABLED } from '../config/env.js';

const safeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return undefined;
  return metadata;
};

export const logAudit = async ({ req, userId, action, entity, entityId, metadata }) => {
  if (!AUDIT_LOG_ENABLED) return;
  try {
    const baseMeta = req
      ? {
          method: req.method,
          path: req.originalUrl,
        }
      : undefined;
    const extraMeta = safeMetadata(metadata);
    const mergedMeta = baseMeta && extraMeta ? { ...baseMeta, ...extraMeta } : baseMeta || extraMeta;

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: mergedMeta,
        ip: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err?.message || err);
  }
};

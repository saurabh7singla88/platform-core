import { Request, Response, NextFunction } from 'express';

/**
 * Phase 1 placeholder: extracts tenantId from x-tenant-id header.
 * Phase 3 will replace this with JWT validation.
 */
export function extractTenant(req: Request, res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-tenant-id'] as string | undefined;
  if (!tenantId) {
    res.status(401).json({ error: 'Missing x-tenant-id header' });
    return;
  }
  (req as Request & { tenantId: string }).tenantId = tenantId;
  next();
}

export function getTenantId(req: Request): string {
  return (req as Request & { tenantId: string }).tenantId;
}

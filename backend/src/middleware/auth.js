import { getSessionFromRequest, hasPermission } from '../auth/auth-service.js';

export async function attachSession(req, _res, next) {
  try {
    req.session = await getSessionFromRequest(req);
    req.user = req.session?.user || null;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req, res, next) {
  if (!req.session) return res.status(401).json({ ok: false, error: 'authentication required' });
  return next();
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.session) return res.status(401).json({ ok: false, error: 'authentication required' });
    if (!hasPermission(req.session, permission)) {
      return res.status(403).json({ ok: false, error: `missing permission: ${permission}` });
    }
    return next();
  };
}

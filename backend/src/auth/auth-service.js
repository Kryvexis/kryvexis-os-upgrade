import crypto from 'crypto';
import { query, dbConfig } from '../lib/db.js';

const BRANCH_ALIASES = {
  'BR-JHB': 'JHB',
  'BR-CPT': 'CPT',
  'BR-DBN': 'DBN',
  'BR-DUR': 'DBN',
  JHB: 'JHB',
  CPT: 'CPT',
  DBN: 'DBN'
};

const BRANCH_NAMES = {
  JHB: 'Johannesburg',
  CPT: 'Cape Town',
  DBN: 'Durban'
};

function normalizeBranchId(branchId) {
  const normalized = String(branchId || '').trim().toUpperCase();
  return BRANCH_ALIASES[normalized] || null;
}

function getBranchName(branchId) {
  return BRANCH_NAMES[normalizeBranchId(branchId) || 'JHB'] || 'Johannesburg';
}

const fallbackUsers = [
  { id: 'DEV-ADMIN', fullName: 'Antonie Meyer', email: 'kryvexissolutions@gmail.com', roleKey: 'admin', branchId: 'JHB', branchName: 'Johannesburg', isActive: true },
  { id: 'DEV-MANAGER', fullName: 'Nadine Smit', email: 'jhb.manager@kryvexis.local', roleKey: 'manager', branchId: 'JHB', branchName: 'Johannesburg', isActive: true },
  { id: 'DEV-SALES', fullName: 'Alex Morgan', email: 'alex@kryvexis.local', roleKey: 'sales', branchId: 'CPT', branchName: 'Cape Town', isActive: true }
];

const fallbackPermissionCatalog = {
  admin: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','quotes.write','quotes.approve','quotes.convert','invoices.read','invoices.write','payments.read','payments.allocate','payments.resolve','notifications.read','notifications.manage','reports.read','automation.manage','roles.read','settings.read','settings.write','users.read','users.manage'],
  executive: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','invoices.read','payments.read','notifications.read','reports.read'],
  manager: ['dashboard.view','customers.read','products.read','suppliers.read','quotes.read','quotes.approve','quotes.convert','invoices.read','payments.read','payments.allocate','notifications.read','reports.read'],
  sales: ['dashboard.view','customers.read','quotes.read','quotes.write','quotes.convert','invoices.read','notifications.read'],
  finance: ['dashboard.view','customers.read','invoices.read','invoices.write','payments.read','payments.allocate','payments.resolve','notifications.read','reports.read'],
  warehouse: ['dashboard.view','products.read','notifications.read'],
  procurement: ['dashboard.view','products.read','suppliers.read','notifications.read'],
  operations: ['dashboard.view','notifications.read','reports.read']
};

const memorySessions = new Map();
const memoryInvitations = [];
let appUsersHasIsActiveCache = null;

function sanitizeToken(token) {
  return String(token || '').replace(/^Bearer\s+/i, '').trim();
}

function expiryDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function appUsersHasIsActive() {
  if (!dbConfig.enableSql) return true;
  if (appUsersHasIsActiveCache !== null) return appUsersHasIsActiveCache;
  const result = await query(`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = current_schema()
        and table_name = 'app_users'
        and column_name = 'is_active'
    ) as exists
  `);
  appUsersHasIsActiveCache = Boolean(result.rows[0]?.exists);
  return appUsersHasIsActiveCache;
}

async function appUsersSelectFields(alias = 'u') {
  const hasIsActive = await appUsersHasIsActive();
  return hasIsActive
    ? `${alias}.id, ${alias}.full_name, ${alias}.email, ${alias}.role_key, ${alias}.branch_id, b.name as branch_name, ${alias}.is_active`
    : `${alias}.id, ${alias}.full_name, ${alias}.email, ${alias}.role_key, ${alias}.branch_id, b.name as branch_name, true as is_active`;
}

export async function listUsers() {
  if (!dbConfig.enableSql) return fallbackUsers;
  const fields = await appUsersSelectFields('u');
  const result = await query(`
    select ${fields}
    from app_users u
    left join branches b on b.id = u.branch_id
    order by u.full_name asc
  `);
  return result.rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    roleKey: row.role_key,
    branchId: normalizeBranchId(row.branch_id) || row.branch_id,
    branchName: row.branch_name,
    isActive: row.is_active
  }));
}

export async function listRolePermissions() {
  if (!dbConfig.enableSql) {
    return Object.entries(fallbackPermissionCatalog).map(([roleKey, permissions]) => ({ roleKey, permissions }));
  }
  const result = await query(`select role_key, permission_key from permissions order by role_key, permission_key`);
  const grouped = new Map();
  for (const row of result.rows) {
    const list = grouped.get(row.role_key) || [];
    list.push(row.permission_key);
    grouped.set(row.role_key, list);
  }
  return Array.from(grouped.entries()).map(([roleKey, permissions]) => ({ roleKey, permissions }));
}

async function loadUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  if (!dbConfig.enableSql) {
    const user = fallbackUsers.find((entry) => entry.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }
  const fields = await appUsersSelectFields('u');
  const result = await query(`
    select ${fields}
    from app_users u
    left join branches b on b.id = u.branch_id
    where lower(u.email) = $1
    limit 1
  `, [normalized]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    roleKey: row.role_key,
    branchId: normalizeBranchId(row.branch_id) || row.branch_id,
    branchName: row.branch_name,
    isActive: row.is_active
  };
}

async function loadPermissionsForRole(roleKey) {
  if (!dbConfig.enableSql) return fallbackPermissionCatalog[roleKey] || [];
  const result = await query(`select permission_key from permissions where role_key = $1 order by permission_key`, [roleKey]);
  return result.rows.map((row) => row.permission_key);
}

export async function registerUser({ email, fullName, roleKey = 'manager', branchId = null }) {
  const normalized = String(email || '').trim().toLowerCase();
  const name = String(fullName || '').trim();
  const normalizedBranchId = normalizeBranchId(branchId);
  if (!normalized || !name) throw new Error('fullName and email are required');
  const existing = await loadUserByEmail(normalized);
  if (existing) throw new Error('A user with that email already exists');
  if (!dbConfig.enableSql) {
    const user = { id: `DEV-${Date.now()}`, fullName: name, email: normalized, roleKey, branchId: normalizedBranchId || 'JHB', branchName: getBranchName(normalizedBranchId), isActive: true };
    fallbackUsers.push(user);
    return user;
  }
  const hasIsActive = await appUsersHasIsActive();
  const result = hasIsActive
    ? await query(`
        insert into app_users (role_key, full_name, email, branch_id, is_active)
        values ($1, $2, $3, $4, true)
        returning id, full_name, email, role_key, branch_id, is_active
      `, [roleKey, name, normalized, normalizedBranchId])
    : await query(`
        insert into app_users (role_key, full_name, email, branch_id)
        values ($1, $2, $3, $4)
        returning id, full_name, email, role_key, branch_id, true as is_active
      `, [roleKey, name, normalized, normalizedBranchId]);
  return {
    id: result.rows[0].id,
    fullName: result.rows[0].full_name,
    email: result.rows[0].email,
    roleKey: result.rows[0].role_key,
    branchId: normalizeBranchId(result.rows[0].branch_id) || result.rows[0].branch_id,
    branchName: getBranchName(result.rows[0].branch_id),
    isActive: result.rows[0].is_active
  };
}

export async function createSessionForEmail(email, meta = {}) {
  const user = await loadUserByEmail(email);
  if (!user || !user.isActive) return null;
  const permissions = await loadPermissionsForRole(user.roleKey);
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = expiryDate(7);
  if (!dbConfig.enableSql) {
    memorySessions.set(token, { token, user, permissions, expiresAt });
  } else {
    await query(`
      insert into auth_sessions (id, user_id, token_hash, branch_id, expires_at, user_agent, created_by)
      values (gen_random_uuid(), $1, $2, $3, $4::timestamptz, $5, $6)
    `, [user.id, crypto.createHash('sha256').update(token).digest('hex'), normalizeBranchId(user.branchId), expiresAt, meta.userAgent || null, meta.createdBy || user.email]);
  }
  return { token, expiresAt, user, permissions };
}

export async function getSessionFromRequest(req) {
  const token = sanitizeToken(req.headers.authorization || req.headers['x-session-token']);
  if (!token) return null;
  if (!dbConfig.enableSql) {
    const session = memorySessions.get(token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      memorySessions.delete(token);
      return null;
    }
    return session;
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const hasIsActive = await appUsersHasIsActive();
  const activeField = hasIsActive ? 'u.is_active' : 'true as is_active';
  const result = await query(`
    select s.id, s.expires_at, s.branch_id as session_branch_id,
           u.id as user_id, u.full_name, u.email, u.role_key, u.branch_id, ${activeField},
           b.name as branch_name
    from auth_sessions s
    join app_users u on u.id = s.user_id
    left join branches b on b.id = coalesce(s.branch_id, u.branch_id)
    where s.token_hash = $1 and s.revoked_at is null and s.expires_at > now()
    limit 1
  `, [tokenHash]);
  const row = result.rows[0];
  if (!row || !row.is_active) return null;
  const permissions = await loadPermissionsForRole(row.role_key);
  return {
    token,
    expiresAt: row.expires_at,
    permissions,
    user: {
      id: row.user_id,
      fullName: row.full_name,
      email: row.email,
      roleKey: row.role_key,
      branchId: normalizeBranchId(row.session_branch_id || row.branch_id) || row.session_branch_id || row.branch_id,
      branchName: row.branch_name,
      isActive: row.is_active
    }
  };
}

export async function revokeSession(token) {
  const clean = sanitizeToken(token);
  if (!clean) return;
  if (!dbConfig.enableSql) {
    memorySessions.delete(clean);
    return;
  }
  const tokenHash = crypto.createHash('sha256').update(clean).digest('hex');
  await query(`update auth_sessions set revoked_at = now() where token_hash = $1 and revoked_at is null`, [tokenHash]);
}

export async function switchSessionBranch(token, branchId) {
  const clean = sanitizeToken(token);
  if (!clean) return null;
  const normalizedBranchId = normalizeBranchId(branchId);
  if (!dbConfig.enableSql) {
    const session = memorySessions.get(clean);
    if (!session) return null;
    session.user.branchId = normalizedBranchId || session.user.branchId;
    session.user.branchName = getBranchName(normalizedBranchId || session.user.branchId);
    return session;
  }
  const tokenHash = crypto.createHash('sha256').update(clean).digest('hex');
  await query(`update auth_sessions set branch_id = $2 where token_hash = $1 and revoked_at is null`, [tokenHash, normalizedBranchId]);
  return true;
}

export async function listInvitations() {
  if (!dbConfig.enableSql) return memoryInvitations;
  const result = await query(`
    select id, email, role_key, branch_id, invite_token, expires_at, accepted_at, created_at
    from user_invitations
    order by created_at desc
  `);
  return result.rows;
}

export async function createInvitation({ email, roleKey, branchId, createdBy }) {
  const inviteToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = expiryDate(14);
  const normalizedBranchId = normalizeBranchId(branchId);
  if (!dbConfig.enableSql) {
    const invitation = { id: `INVITE-${memoryInvitations.length + 1}`, email, role_key: roleKey, branch_id: normalizedBranchId, invite_token: inviteToken, expires_at: expiresAt, accepted_at: null, created_at: new Date().toISOString(), created_by: createdBy };
    memoryInvitations.unshift(invitation);
    return invitation;
  }
  const result = await query(`
    insert into user_invitations (email, role_key, branch_id, invite_token, expires_at, created_by)
    values ($1, $2, $3, $4, $5::timestamptz, $6)
    returning id, email, role_key, branch_id, invite_token, expires_at, accepted_at, created_at
  `, [email, roleKey, normalizedBranchId, inviteToken, expiresAt, createdBy || 'system']);
  return result.rows[0];
}

export function hasPermission(session, permission) {
  return Boolean(session?.permissions?.includes(permission));
}

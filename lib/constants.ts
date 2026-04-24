// User roles enum matching Prisma schema
export enum UserRole {
    ADMIN = 'ADMIN',
    PEMELIHARAAN = 'PEMELIHARAAN',
    OPERATOR = 'OPERATOR',
}

// LOTO Status
export enum LotoStatus {
    REQUEST = 'REQUEST',
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSE = 'CLOSE',
    CANCELLED = 'CANCELLED',
}

// LOTO Type
export enum LotoType {
    TAGGING = 'TAGGING',
    RELEASE = 'RELEASE',
}

// Approval Status
export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// Role display names (for UI)
export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.PEMELIHARAAN]: 'Pemeliharaan',
    [UserRole.OPERATOR]: 'Operator',
}

// Status colors (for badges)
export const STATUS_COLORS: Record<LotoStatus, string> = {
    [LotoStatus.REQUEST]: 'bg-yellow-100 text-yellow-800',
    [LotoStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [LotoStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [LotoStatus.CLOSE]: 'bg-blue-100 text-blue-800',
    [LotoStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

// API Routes
export const API_ROUTES = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        SESSION: '/api/auth/session',
    },
    USERS: '/api/users',
    LOTO: {
        BASE: '/api/loto',
        PENDING_OP: '/api/loto/pending-op',
    },
    APPROVALS: '/api/approvals',
    EXPORT: '/api/export',
    UPLOAD: '/api/upload',
} as const

// JWT Secret (should be in .env)
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production'
export const JWT_EXPIRES_IN = '7d'

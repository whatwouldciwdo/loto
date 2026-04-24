import { z } from 'zod'

// Login validation
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// User validation
export const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['ADMIN', 'SP_HAR', 'SPS_HAR', 'OP_LOKAL', 'OP_CCR', 'PELAKSANA_HAR']),
    department: z.string().optional(),
})

export type UserInput = z.infer<typeof userSchema>

// LOTO Request validation
export const lotoRequestSchema = z.object({
    type: z.enum(['TAGGING', 'RELEASE']),
    operatorId: z.string().uuid().optional(),
    formData: z.record(z.any()), // Flexible JSON data
})

export type LotoRequestInput = z.infer<typeof lotoRequestSchema>

// Approval validation
export const approvalSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    notes: z.string().optional(),
})

export type ApprovalInput = z.infer<typeof approvalSchema>

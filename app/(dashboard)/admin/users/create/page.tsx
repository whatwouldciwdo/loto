"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

const ROLES = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'PEMELIHARAAN', label: 'Pemeliharaan' },
    { value: 'OPERATOR', label: 'Operator' },
]

export default function CreateUserPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        role: 'OPERATOR',
        department: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            showToast('success', 'Berhasil', 'User berhasil dibuat!')
            router.push('/admin/users')
        } catch (err: any) {
            showToast('error', 'Gagal', err.message || 'Failed to create user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-dark mb-2">Create New User</h1>
                <p className="text-gray-600">Add a new user to the system</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="bg-gray-50">
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <Label htmlFor="username">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="e.g., john.doe"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="e.g., john.doe@company.com"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="name">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., John Doe"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="role">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neon"
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="e.g., HSE, Operations"
                                className="mt-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button
                        type="submit"
                        variant="neon"
                        size="lg"
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}

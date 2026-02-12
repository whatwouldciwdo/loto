"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ROLES = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'PEMELIHARAAN', label: 'Pemeliharaan' },
    { value: 'OPERATOR', label: 'Operator' },
]

export default function EditUserPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'OPERATOR',
        department: '',
        password: '',
    })

    useEffect(() => {
        fetchUser()
    }, [params.id])

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/admin/users/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch user')
            const data = await response.json()

            setFormData({
                email: data.data.email,
                name: data.data.name,
                role: data.data.role,
                department: data.data.department || '',
                password: '',
            })
        } catch (err) {
            console.error(err)
            alert('Failed to load user')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const updateData: any = {
                email: formData.email,
                name: formData.name,
                role: formData.role,
                department: formData.department || null,
            }

            // Only include password if changed
            if (formData.password) {
                updateData.password = formData.password
            }

            const response = await fetch(`/api/admin/users/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            alert('User updated successfully!')
            router.push('/admin/users')
        } catch (err: any) {
            alert(err.message || 'Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading user...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-dark mb-2">Edit User</h1>
                <p className="text-gray-600">Update user information</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="bg-gray-50">
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
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
                                className="mt-2"
                            />
                        </div>

                        <div className="border-t pt-4">
                            <Label htmlFor="password">
                                New Password (leave blank to keep current)
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter new password if changing"
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
                        disabled={saving}
                        className="flex-1"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}

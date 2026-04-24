"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

interface User {
    id: string
    username: string
    email: string
    name: string
    role: string
    department: string | null
    isActive: boolean
    createdAt: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            setUsers(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = (userId: string, username: string) => {
        showConfirm({
            type: 'danger',
            title: 'Hapus User',
            message: `Hapus user "${username}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'DELETE',
                    })
                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to delete user')
                    }
                    showToast('success', 'Berhasil', `User "${username}" telah dihapus`)
                    fetchUsers()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    const handleToggleActive = (userId: string, username: string, currentStatus: boolean) => {
        const action = currentStatus ? 'Nonaktifkan' : 'Aktifkan'
        showConfirm({
            type: currentStatus ? 'warning' : 'info',
            title: `${action} User`,
            message: `${action} user "${username}"?`,
            confirmText: action,
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: !currentStatus }),
                    })
                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to update user')
                    }
                    showToast('success', 'Berhasil', `User "${username}" telah di${currentStatus ? 'nonaktifkan' : 'aktifkan'}`)
                    fetchUsers()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-purple-100 text-purple-800',
        PEMELIHARAAN: 'bg-blue-100 text-blue-800',
        OPERATOR: 'bg-green-100 text-green-800',
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading users...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark mb-2">User Management</h1>
                    <p className="text-gray-600">Manage system users and roles</p>
                </div>
                <Button variant="neon" onClick={() => router.push('/admin/users/create')}>
                    + Create User
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-dark">{users.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-3xl font-bold text-green-600">
                            {users.filter(u => u.isActive).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Inactive Users</p>
                        <p className="text-3xl font-bold text-red-600">
                            {users.filter(u => !u.isActive).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Admins</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {users.filter(u => u.role === 'ADMIN').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <Input
                        type="text"
                        placeholder="Search by username, name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No users found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Username</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-semibold">{user.username}</td>
                                            <td className="py-3 px-4">{user.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <Badge className={roleColors[user.role]}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{user.department || '-'}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={user.isActive ? 'default' : 'cancelled'}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user.id, user.username, user.isActive)}
                                                    >
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    {user.username !== 'admin' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

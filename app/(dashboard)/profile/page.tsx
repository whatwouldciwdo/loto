"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { User, Lock, Shield, Mail, Building2, KeyRound, Eye, EyeOff } from 'lucide-react'

interface UserSession {
    userId: string
    username: string
    role: string
    email?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [session, setSession] = useState<UserSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [changing, setChanging] = useState(false)
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        fetchSession()
    }, [])

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/auth/session')
            if (!res.ok) throw new Error('Not authenticated')
            const data = await res.json()
            setSession(data.user)
        } catch {
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (form.newPassword !== form.confirmPassword) {
            showToast('error', 'Error', 'Password baru dan konfirmasi tidak sama')
            return
        }

        if (form.newPassword.length < 6) {
            showToast('error', 'Error', 'Password baru minimal 6 karakter')
            return
        }

        setChanging(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            showToast('success', 'Berhasil', 'Password berhasil diubah!')
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err: any) {
            showToast('error', 'Gagal', err.message || 'Failed to change password')
        } finally {
            setChanging(false)
        }
    }

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500',
        PEMELIHARAAN: 'bg-blue-500/20 text-blue-300 border-blue-500',
        OPERATOR: 'bg-green-500/20 text-green-300 border-green-500',
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark mb-2">Profile</h1>
                <p className="text-gray-600">Kelola profil dan keamanan akun Anda</p>
            </div>

            {/* Profile Info Card */}
            <Card className="mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-dark to-gray-800 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neon rounded-full flex items-center justify-center text-dark font-bold text-2xl shadow-lg ring-4 ring-neon/30">
                            {session?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{session?.username}</h2>
                            <Badge className={`mt-1 ${roleColors[session?.role || ''] || 'bg-gray-500/20 text-gray-300 border-gray-500'}`}>
                                <Shield className="w-3 h-3 mr-1" />
                                {session?.role}
                            </Badge>
                        </div>
                    </div>
                </div>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Username</p>
                                <p className="font-semibold text-dark">{session?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Role</p>
                                <p className="font-semibold text-dark">{session?.role}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-dark" />
                        Ubah Password
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-500" />
                                Password Saat Ini
                            </Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                    required
                                    placeholder="Masukkan password saat ini"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-gray-500" />
                                Password Baru
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPw ? 'text' : 'password'}
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="Minimal 6 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-500" />
                                Konfirmasi Password Baru
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPw ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="neon"
                            className="w-full"
                            disabled={changing}
                        >
                            {changing ? 'Mengubah...' : 'Ubah Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

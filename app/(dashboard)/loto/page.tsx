"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { API_ROUTES } from '@/lib/constants'
import { ClipboardList, Search, Plus, Filter, TrendingUp, Clock, CheckCircle2, FileText, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

interface LotoRequest {
    id: string
    requestNumber: string
    status: string
    formData: any
    createdBy: {
        name: string
    }
    createdAt: string
}

export default function LotoListPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [lotos, setLotos] = useState<LotoRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [userRole, setUserRole] = useState('')

    useEffect(() => {
        fetchLotos()
        fetchSession()
    }, [])

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/auth/session')
            if (res.ok) {
                const data = await res.json()
                setUserRole(data.user?.role || '')
            }
        } catch { }
    }

    const fetchLotos = async () => {
        try {
            const response = await fetch(API_ROUTES.LOTO.BASE)
            if (!response.ok) throw new Error('Failed to fetch LOTO list')
            const data = await response.json()
            setLotos(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (lotoId: string, requestNumber: string) => {
        showConfirm({
            type: 'danger',
            title: 'Hapus LOTO Request',
            message: `Apakah Anda yakin ingin menghapus ${requestNumber}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_ROUTES.LOTO.BASE}/${lotoId}`, { method: 'DELETE' })
                    if (!res.ok) {
                        const data = await res.json()
                        throw new Error(data.error || 'Failed to delete')
                    }
                    showToast('success', 'Berhasil', `${requestNumber} telah dihapus`)
                    fetchLotos()
                } catch (err: any) {
                    showToast('error', 'Gagal menghapus', err.message || 'Terjadi kesalahan')
                }
            },
        })
    }

    const canDelete = userRole === 'ADMIN' || userRole === 'OPERATOR'

    const statusColors: Record<string, string> = {
        REQUEST: 'bg-yellow-100 text-yellow-800',
        DRAFT: 'bg-gray-100 text-gray-800',
        ACTIVE: 'bg-green-100 text-green-800',
        CLOSE: 'bg-blue-100 text-blue-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const filteredLotos = lotos.filter((loto) =>
        loto.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loto.formData.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loto.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading LOTO requests...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-dark to-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                        <ClipboardList className="w-7 h-7 text-neon" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark">LOTO Requests</h1>
                        <p className="text-gray-600">All lockout/tagout requests</p>
                    </div>
                </div>
                <Button variant="neon" onClick={() => router.push('/loto/request')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search by request number, equipment, or creator..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-dark">{lotos.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Active</p>
                            <TrendingUp className="w-5 h-5 text-neon" />
                        </div>
                        <p className="text-3xl font-bold text-neon">
                            {lotos.filter(l => l.status === 'ACTIVE').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Request</p>
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">
                            {lotos.filter(l => l.status === 'REQUEST' || l.status === 'DRAFT').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Completed</p>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {lotos.filter(l => l.status === 'CLOSE').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Requests ({filteredLotos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredLotos.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No LOTO requests found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-100">
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Request #</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Equipment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Keterangan</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Created By</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLotos.map((loto) => (
                                        <tr key={loto.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/loto/${loto.id}`}
                                                    className="text-dark font-semibold hover:underline"
                                                >
                                                    {loto.requestNumber}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium">{loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{loto.formData.operatorForm?.unit || loto.formData.unit || 'CLG'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-700 max-w-md">
                                                    {loto.formData.operatorForm?.keterangan || loto.formData.description || '-'}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={statusColors[loto.status]}>
                                                    {loto.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {loto.createdBy.name}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(loto.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/loto/${loto.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    {canDelete && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(loto.id, loto.requestNumber)}
                                                            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

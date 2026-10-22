"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Wrench, Plus, Edit2, Trash2, Search, Filter, Layers, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Asset {
    id: string
    assetNumber: string
    equipmentName: string
    equipmentType: string | null
    location: string | null
    kodeAlas: string | null
    unit: string
    systemOwner: string | null
    description: string | null
    manufacturer: string | null
    model: string | null
    serialNumber: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function AdminAssetsPage() {
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()

    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalAssets, setTotalAssets] = useState(0)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [formData, setFormData] = useState({
        assetNumber: '',
        equipmentName: '',
        equipmentType: '',
        location: '',
        kodeAlas: '',
        unit: 'CLG',
        systemOwner: '',
        description: '',
        isActive: true,
    })
    const [saving, setSaving] = useState(false)

    const fetchAssets = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                q: searchTerm,
                status: selectedStatus,
                page: page.toString(),
                limit: '50',
            })
            const response = await fetch(`/api/admin/assets?${params}`)
            if (!response.ok) throw new Error('Gagal mengambil data asset')
            const result = await response.json()
            setAssets(result.data || [])
            if (result.pagination) {
                setTotalPages(result.pagination.totalPages || 1)
                setTotalAssets(result.pagination.total || 0)
            }
        } catch (err: any) {
            showToast('error', 'Gagal', err.message)
        } finally {
            setLoading(false)
        }
    }, [searchTerm, selectedStatus, page, showToast])

    useEffect(() => {
        fetchAssets()
    }, [fetchAssets])

    const openCreateModal = () => {
        setEditingAsset(null)
        setFormData({
            assetNumber: '',
            equipmentName: '',
            equipmentType: '',
            location: '',
            kodeAlas: '',
            unit: 'CLG',
            systemOwner: '',
            description: '',
            isActive: true,
        })
        setIsModalOpen(true)
    }

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset)
        setFormData({
            assetNumber: asset.assetNumber,
            equipmentName: asset.equipmentName,
            equipmentType: asset.equipmentType || '',
            location: asset.location || '',
            kodeAlas: asset.kodeAlas || '',
            unit: asset.unit || 'CLG',
            systemOwner: asset.systemOwner || '',
            description: asset.description || '',
            isActive: asset.isActive,
        })
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.assetNumber.trim() || !formData.equipmentName.trim() || !formData.unit.trim()) {
            showToast('error', 'Validasi', 'Nomor Asset, Nama Equipment, dan Unit wajib diisi!')
            return
        }

        setSaving(true)
        try {
            const url = editingAsset
                ? `/api/admin/assets/${editingAsset.id}`
                : '/api/admin/assets'
            const method = editingAsset ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Gagal menyimpan asset')

            showToast(
                'success',
                'Berhasil',
                editingAsset ? 'Data asset berhasil diperbarui' : 'Asset baru berhasil ditambahkan'
            )
            setIsModalOpen(false)
            fetchAssets()
        } catch (err: any) {
            showToast('error', 'Gagal', err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAsset = (asset: Asset) => {
        showConfirm({
            type: 'danger',
            title: 'Hapus Asset',
            message: `Hapus asset "${asset.equipmentName}" (${asset.assetNumber})? Jika asset memiliki riwayat LOTO, asset akan dinonaktifkan otomatis.`,
            confirmText: 'Hapus',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/assets/${asset.id}`, {
                        method: 'DELETE',
                    })
                    const result = await response.json()
                    if (!response.ok) throw new Error(result.error || 'Gagal menghapus asset')
                    showToast('success', 'Berhasil', result.message || 'Asset berhasil dihapus')
                    fetchAssets()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    const handleToggleActive = (asset: Asset) => {
        const action = asset.isActive ? 'Nonaktifkan' : 'Aktifkan'
        showConfirm({
            type: asset.isActive ? 'warning' : 'info',
            title: `${action} Asset`,
            message: `${action} asset "${asset.equipmentName}"?`,
            confirmText: action,
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/assets/${asset.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: !asset.isActive }),
                    })
                    const result = await response.json()
                    if (!response.ok) throw new Error(result.error || 'Gagal update status asset')
                    showToast('success', 'Berhasil', `Asset berhasil di${asset.isActive ? 'nonaktifkan' : 'aktifkan'}`)
                    fetchAssets()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
                        <Wrench className="w-8 h-8 text-neon" />
                        Manajemen Data Asset & Peralatan
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tambah, ubah, atau nonaktifkan data asset peralatan industri untuk isolasi LOTO.
                    </p>
                </div>
                <Button variant="neon" onClick={openCreateModal} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Asset Baru
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Asset Terdaftar</p>
                        <p className="text-2xl font-bold text-dark mt-1">{totalAssets}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Asset Aktif</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">
                            {assets.filter(a => a.isActive).length} (di halaman ini)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Unit Utama</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">CLG (Cilegon)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama asset, nomor asset, kode alas, atau lokasi..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
                                <Button
                                    key={st}
                                    variant={selectedStatus === st ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setSelectedStatus(st)
                                        setPage(1)
                                    }}
                                    className="text-xs"
                                >
                                    {st === 'ALL' ? 'Semua Status' : st === 'ACTIVE' ? 'Aktif Saja' : 'Nonaktif Saja'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assets Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Daftar Peralatan / Asset ({totalAssets})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Memuat data asset...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-12">
                            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Tidak ada asset ditemukan</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Coba kata kunci lain atau klik &quot;Tambah Asset Baru&quot;.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50/50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Nomor Asset</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama Equipment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Kode Alas / Lokasi</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Unit</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => (
                                        <tr key={asset.id} className="border-b hover:bg-gray-50/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-dark">
                                                {asset.assetNumber}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                {asset.equipmentName}
                                                {asset.equipmentType && (
                                                    <span className="text-xs text-gray-400 ml-2">({asset.equipmentType})</span>
                                                )}
                                                {asset.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-1">{asset.description}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">
                                                {asset.kodeAlas ? (
                                                    <Badge variant="outline" className="font-mono text-[11px] mr-1">
                                                        {asset.kodeAlas}
                                                    </Badge>
                                                ) : null}
                                                {asset.location || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-semibold">
                                                {asset.unit}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={asset.isActive ? 'default' : 'cancelled'}>
                                                    {asset.isActive ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(asset)}
                                                        className="h-8 px-2.5"
                                                        title="Edit Asset"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(asset)}
                                                        className="h-8 px-2 text-xs"
                                                    >
                                                        {asset.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteAsset(asset)}
                                                        className="h-8 px-2"
                                                        title="Hapus Asset"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between py-4 border-t px-2 mt-2">
                                <p className="text-xs text-gray-500">
                                    Halaman {page} dari {totalPages} ({totalAssets} total asset)
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="h-8 text-xs"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-8 text-xs"
                                    >
                                        Selanjutnya <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Dialog for Add / Edit Asset */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6 border-b bg-gray-50 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-dark">
                                {editingAsset ? 'Edit Data Asset' : 'Tambah Asset Peralatan Baru'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Pastikan nomor asset sesuai dengan kode SAP / Maximo pembangkit.
                            </p>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="assetNumber">Nomor Asset *</Label>
                                    <Input
                                        id="assetNumber"
                                        placeholder="Contoh: 10423987"
                                        value={formData.assetNumber}
                                        onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                                        required
                                        className="mt-1 font-mono font-bold"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="unit">Unit Pembangkit *</Label>
                                    <Input
                                        id="unit"
                                        placeholder="Contoh: CLG"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="equipmentName">Nama Equipment / Deskripsi Peralatan *</Label>
                                <Input
                                    id="equipmentName"
                                    placeholder="Contoh: BOILER FEED PUMP 1A (BFP 1A)"
                                    value={formData.equipmentName}
                                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="kodeAlas">Kode Alas / Tagging Lokasi</Label>
                                    <Input
                                        id="kodeAlas"
                                        placeholder="Contoh: 10HAD10AP001"
                                        value={formData.kodeAlas}
                                        onChange={(e) => setFormData({ ...formData, kodeAlas: e.target.value })}
                                        className="mt-1 font-mono"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="equipmentType">Tipe / Kategori Equipment</Label>
                                    <Input
                                        id="equipmentType"
                                        placeholder="Contoh: PUMP, MOTOR, VALVE, TRANSFORMER"
                                        value={formData.equipmentType}
                                        onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Lokasi Spesifik / Area</Label>
                                    <Input
                                        id="location"
                                        placeholder="Contoh: Turbine Hall LT 1"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="systemOwner">System Owner / Penanggung Jawab</Label>
                                    <Input
                                        id="systemOwner"
                                        placeholder="Contoh: HAR-MECH / SYSTEM TURBINE"
                                        value={formData.systemOwner}
                                        onChange={(e) => setFormData({ ...formData, systemOwner: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Keterangan / Deskripsi Tambahan</Label>
                                <Input
                                    id="description"
                                    placeholder="Spesifikasi atau catatan teknis tambahan..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="assetActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-neon focus:ring-neon border-gray-300"
                                />
                                <Label htmlFor="assetActive" className="cursor-pointer">
                                    Asset Aktif (dapat dipilih pada form pembuatan LOTO)
                                </Label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={saving}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="neon"
                                    disabled={saving}
                                >
                                    {saving ? 'Menyimpan...' : editingAsset ? 'Simpan Perubahan' : 'Tambah Asset'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Phone, Users, ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react'

interface Contact {
    id: string
    name: string
    phone: string
    group: string
    department: string | null
    notes: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function AdminContactsPage() {
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGroup, setSelectedGroup] = useState<string>('ALL')

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        group: 'OPERASI',
        department: '',
        notes: '',
        isActive: true,
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/admin/contacts')
            if (!response.ok) throw new Error('Failed to fetch contacts')
            const data = await response.json()
            setContacts(data.data || [])
        } catch (err: any) {
            showToast('error', 'Gagal', err.message || 'Gagal memuat kontak')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingContact(null)
        setFormData({
            name: '',
            phone: '',
            group: 'OPERASI',
            department: '',
            notes: '',
            isActive: true,
        })
        setIsModalOpen(true)
    }

    const openEditModal = (contact: Contact) => {
        setEditingContact(contact)
        setFormData({
            name: contact.name,
            phone: contact.phone,
            group: contact.group,
            department: contact.department || '',
            notes: contact.notes || '',
            isActive: contact.isActive,
        })
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.phone.trim()) {
            showToast('error', 'Validasi', 'Nama dan Nomor WhatsApp wajib diisi!')
            return
        }

        setSaving(true)
        try {
            const url = editingContact
                ? `/api/admin/contacts/${editingContact.id}`
                : '/api/admin/contacts'
            const method = editingContact ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Gagal menyimpan kontak')

            showToast(
                'success',
                'Berhasil',
                editingContact ? 'Kontak berhasil diperbarui' : 'Kontak baru berhasil ditambahkan'
            )
            setIsModalOpen(false)
            fetchContacts()
        } catch (err: any) {
            showToast('error', 'Gagal', err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteContact = (contact: Contact) => {
        showConfirm({
            type: 'danger',
            title: 'Hapus Kontak',
            message: `Hapus kontak "${contact.name}" (${contact.phone})?`,
            confirmText: 'Hapus',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/contacts/${contact.id}`, {
                        method: 'DELETE',
                    })
                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to delete contact')
                    }
                    showToast('success', 'Berhasil', `Kontak "${contact.name}" telah dihapus`)
                    fetchContacts()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    const handleToggleActive = (contact: Contact) => {
        const action = contact.isActive ? 'Nonaktifkan' : 'Aktifkan'
        showConfirm({
            type: contact.isActive ? 'warning' : 'info',
            title: `${action} Kontak`,
            message: `${action} kontak "${contact.name}"?`,
            confirmText: action,
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/admin/contacts/${contact.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: !contact.isActive }),
                    })
                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to update contact')
                    }
                    showToast('success', 'Berhasil', `Kontak "${contact.name}" telah di${contact.isActive ? 'nonaktifkan' : 'aktifkan'}`)
                    fetchContacts()
                } catch (err: any) {
                    showToast('error', 'Gagal', err.message)
                }
            },
        })
    }

    const filteredContacts = contacts.filter((c) => {
        const matchesGroup = selectedGroup === 'ALL' || c.group === selectedGroup
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesGroup && matchesSearch
    })

    const groupBadges: Record<string, string> = {
        K3: 'bg-red-100 text-red-800 border-red-300',
        OPERASI: 'bg-green-100 text-green-800 border-green-300',
        PEMELIHARAAN: 'bg-blue-100 text-blue-800 border-blue-300',
        LAINNYA: 'bg-purple-100 text-purple-800 border-purple-300',
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading kontak WhatsApp...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
                        <Phone className="w-8 h-8 text-neon" />
                        Manajemen Kontak WhatsApp
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Sesuaikan nomor kontak Tim Pemeliharaan, Tim Operasi, dan Kru K3 untuk notifikasi otomatis.
                    </p>
                </div>
                <Button variant="neon" onClick={openCreateModal} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Kontak
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Kontak</p>
                        <p className="text-2xl font-bold text-dark mt-1">{contacts.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Tim Operasi</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                            {contacts.filter(c => c.group === 'OPERASI').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Pemeliharaan</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                            {contacts.filter(c => c.group === 'PEMELIHARAAN').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-red-700 font-medium uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Kru K3
                        </p>
                        <p className="text-2xl font-bold text-red-700 mt-1">
                            {contacts.filter(c => c.group === 'K3').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-4">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Status Aktif</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">
                            {contacts.filter(c => c.isActive).length}
                        </p>
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
                                placeholder="Cari nama personil, seksi, atau nomor WhatsApp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {['ALL', 'OPERASI', 'PEMELIHARAAN', 'K3', 'LAINNYA'].map((grp) => (
                                <Button
                                    key={grp}
                                    variant={selectedGroup === grp ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedGroup(grp)}
                                    className="text-xs"
                                >
                                    {grp === 'ALL' ? 'Semua Grup' : grp}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contacts Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Daftar Kontak ({filteredContacts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-12">
                            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Tidak ada kontak ditemukan</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Klik tombol &quot;Tambah Kontak&quot; untuk menambahkan personil baru.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50/50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama / Seksi</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Nomor WhatsApp</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Grup Tim</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Department / Unit</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.map((contact) => (
                                        <tr key={contact.id} className="border-b hover:bg-gray-50/80 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-dark">
                                                {contact.name}
                                                {contact.notes && (
                                                    <p className="text-xs text-gray-400 font-normal">{contact.notes}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-gray-800">
                                                <a
                                                    href={`https://wa.me/${contact.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-green-600 font-medium flex items-center gap-1.5"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    +{contact.phone}
                                                </a>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={`${groupBadges[contact.group] || 'bg-gray-100 text-gray-800'}`}>
                                                    {contact.group}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {contact.department || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={contact.isActive ? 'default' : 'cancelled'}>
                                                    {contact.isActive ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(contact)}
                                                        className="h-8 px-2.5"
                                                        title="Edit kontak"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(contact)}
                                                        className="h-8 px-2.5 text-xs"
                                                    >
                                                        {contact.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteContact(contact)}
                                                        className="h-8 px-2 text-xs"
                                                        title="Hapus kontak"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
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

            {/* Modal Dialog for Add / Edit Contact */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-dark">
                                {editingContact ? 'Edit Kontak Personil' : 'Tambah Kontak Baru'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Pastikan nomor WhatsApp menggunakan format internasional (contoh: 0812... atau 62812...).
                            </p>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="name">Nama Personil / Seksi *</Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: OPS A (IHWANSYAH WIBOWO) atau K3 KOORDINATOR"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Nomor WhatsApp *</Label>
                                <Input
                                    id="phone"
                                    placeholder="Contoh: 08123456789 atau 628123456789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    className="mt-1"
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Otomatis dinormalisasi ke format internasional (628...).
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="group">Grup Tim *</Label>
                                    <select
                                        id="group"
                                        value={formData.group}
                                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                        className="mt-1 w-full h-10 px-3 py-2 bg-white border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    >
                                        <option value="OPERASI">OPERASI</option>
                                        <option value="PEMELIHARAAN">PEMELIHARAAN</option>
                                        <option value="K3">K3 (Keselamatan Kerja)</option>
                                        <option value="LAINNYA">LAINNYA</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="department">Seksi / Department</Label>
                                    <Input
                                        id="department"
                                        placeholder="Contoh: OPS A, HAR-MECH, K3"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Input
                                    id="notes"
                                    placeholder="Contoh: Shift 1, Supervisor K3, dll."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-neon focus:ring-neon border-gray-300"
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">
                                    Kontak Aktif (menerima pesan WhatsApp)
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
                                    {saving ? 'Menyimpan...' : editingContact ? 'Simpan Perubahan' : 'Tambah Kontak'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

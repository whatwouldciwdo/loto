"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { API_ROUTES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Unlock, Camera, X, Upload, ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import AssetSearchCombobox from '@/components/loto/asset-search'

// Options inherited from operator form
const PERALATAN_OPTIONS = [
    { value: 'VALVE', label: 'Valve' },
    { value: 'BREAKER', label: 'Breaker' },
]

const EKSEKUSI_OPTIONS = {
    VALVE: [
        { value: 'OPEN', label: 'Open' },
        { value: 'CLOSE', label: 'Close' },
    ],
    BREAKER: [
        { value: 'ROLE_IN', label: 'Role In' },
        { value: 'ROLE_OUT', label: 'Role Out' },
    ],
}

// OPS Team Leaders
const TEAM_LEADERS = [
    'OPS A (IHWANSYAH WIBOWO)',
    'OPS B (UNTUNG RIYADI)',
    'OPS C (SULISTIYONO)',
    'OPS D (YAYAN SURYANA)',
]

// Seksi HAR options
const SEKSI_HAR_OPTIONS = [
    'HAR-MECH (JUWAN OKTAVIANSA)',
    'HAR-I&C (YUDI NUGRAHA)',
    'HAR-ELEC (GUNAWAN)',
    'HAR-BOP (RIZKY ALIF)',
    'SARANA (IRVAN SANDI)',
    'HAR-PREDIKTIF (PEBRIANTO GINTING)',
]

export default function ReleasePage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [loading, setLoading] = useState(false)
    const [lotoRequest, setLotoRequest] = useState<any>(null)
    const [selectedAsset, setSelectedAsset] = useState<any>(null)
    const [evidencePhotos, setEvidencePhotos] = useState<{ url: string; filename: string; originalName: string }[]>([])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        // Read-only fields (inherited)
        descriptionPekerjaan: '',
        assetId: '',
        peralatan: '',
        eksekutor: '', // Check if this should be the original executor or new release executor
        keterangan: '',
        seksiHAR: '',

        // Editable fields
        eksekusi: '',
        eksekutorRelease: '', // New field
        keteranganRelease: '', // New field
    })

    // Fetch LOTO request data
    useEffect(() => {
        fetchLotoRequest()
    }, [params.id])

    const fetchLotoRequest = async () => {
        try {
            const response = await fetch(`${API_ROUTES.LOTO.BASE}/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch LOTO request')
            const data = await response.json()
            const loto = data.data
            setLotoRequest(loto)

            // Pre-fill form from operatorForm data
            if (loto.formData?.operatorForm) {
                const opForm = loto.formData.operatorForm
                setFormData(prev => ({
                    ...prev,
                    descriptionPekerjaan: opForm.descriptionPekerjaan || opForm.deskripsiPekerjaan || '',
                    assetId: opForm.assetId || '',
                    peralatan: opForm.peralatan || '',
                    eksekusi: opForm.eksekusi || '', // Editable, pre-filled
                    eksekutor: opForm.eksekutor || '',
                    keterangan: opForm.keterangan || '',
                    seksiHAR: opForm.seksiHAR || '',
                }))

                // Pre-fill asset
                if (opForm.assetId && loto.asset) {
                    setSelectedAsset(loto.asset)
                } else if (opForm.assetId) {
                    // Fallback if asset relation not loaded but id exists
                    // For read-only display, we might need to fetch asset details or rely on what's in formData if stored
                    // Assuming asset relation is loaded
                }
            }
        } catch (err: any) {
            showToast('error', 'Error', err.message || 'Failed to load LOTO request')
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        try {
            const formDataUpload = new FormData()
            for (let i = 0; i < files.length; i++) {
                if (!files[i].type.startsWith('image/')) {
                    showToast('error', 'Invalid File', `${files[i].name} bukan file gambar`)
                    continue
                }
                if (files[i].size > 5 * 1024 * 1024) {
                    showToast('error', 'File Terlalu Besar', `${files[i].name} melebihi 5MB`)
                    continue
                }
                formDataUpload.append('files', files[i])
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            })

            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()

            setEvidencePhotos(prev => [...prev, ...data.files])
            showToast('success', 'Upload Berhasil', `${data.files.length} foto berhasil diupload`)
        } catch (err: any) {
            showToast('error', 'Upload Gagal', err.message || 'Gagal mengupload foto')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removePhoto = (index: number) => {
        setEvidencePhotos(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.eksekusi || !formData.eksekutorRelease) {
            showToast('error', 'Validation Error', 'Please fill in all required fields')
            return
        }

        showConfirm({
            type: 'warning',
            title: 'Submit Release Form',
            message: 'Submit Release Form? This will close the LOTO request.',
            confirmText: 'Submit Release',
            onConfirm: async () => {
                setLoading(true)
                try {
                    const response = await fetch(`${API_ROUTES.LOTO.BASE}/${params.id}/release`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            formData: {
                                ...formData,
                                evidencePhotos: evidencePhotos,
                            }
                        }),
                    })

                    const data = await response.json()
                    if (!response.ok) throw new Error(data.error)

                    showToast('success', 'Success', 'LOTO Release Submitted Successfully')
                    router.push(`/loto/${params.id}`)
                } catch (err: any) {
                    showToast('error', 'Submission Failed', err.message || 'Failed to submit release form')
                } finally {
                    setLoading(false)
                }
            },
        })
    }

    if (!lotoRequest) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        CAT.06
                    </Badge>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Form Release LOTO</h1>
                    <p className="text-gray-500">Normalisasi equipment dan penutupan LOTO request</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg">Detail Release</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                        <div className="space-y-2">
                            <Label>No LOTO</Label>
                            <Input value={lotoRequest.requestNumber} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label>Description Pekerjaan</Label>
                            <Textarea
                                value={formData.descriptionPekerjaan}
                                disabled
                                className="bg-gray-100 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Nama Asset / Equipment</Label>
                            <div className="p-3 bg-gray-100 border rounded-md text-sm text-gray-500">
                                {selectedAsset ? `${selectedAsset.description || selectedAsset.equipmentDescription} (${selectedAsset.equipmentNumber || selectedAsset.assetNumber})` : 'No asset selected'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Peralatan</Label>
                            <Input value={PERALATAN_OPTIONS.find(o => o.value === formData.peralatan)?.label || formData.peralatan} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eksekusi">Eksekusi <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.eksekusi}
                                onValueChange={(value) => setFormData({ ...formData, eksekusi: value })}
                            >
                                <SelectTrigger className={!formData.peralatan ? 'bg-gray-100' : ''}>
                                    <SelectValue placeholder="Pilih posisi normalisasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.peralatan && EKSEKUSI_OPTIONS[formData.peralatan as keyof typeof EKSEKUSI_OPTIONS]?.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Sesuaikan posisi peralatan untuk normalisasi (Release)</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Eksekutor (Operator Awal)</Label>
                            <Input value={formData.eksekutor} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label>Seksi HAR</Label>
                            <Input value={formData.seksiHAR} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label>Keterangan Awal</Label>
                            <Textarea
                                value={formData.keterangan}
                                disabled
                                className="bg-gray-100 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eksekutorRelease">Eksekutor Release (OPS) <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.eksekutorRelease}
                                onValueChange={(value) => setFormData({ ...formData, eksekutorRelease: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih team leader release" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEAM_LEADERS.map((leader) => (
                                        <SelectItem key={leader} value={leader}>
                                            {leader}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keteranganRelease">Keterangan Release</Label>
                            <Textarea
                                id="keteranganRelease"
                                value={formData.keteranganRelease}
                                onChange={(e) => setFormData({ ...formData, keteranganRelease: e.target.value })}
                                placeholder="Catatan tambahan untuk release (opsional)..."
                                className="h-24"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Dokumentasi Foto Evidence
                            </Label>
                            <p className="text-xs text-gray-500">Lampirkan foto bukti kondisi equipment setelah release (maks 5MB per foto)</p>

                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-neon hover:bg-neon/5 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-gray-500">Mengupload foto...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="text-sm text-gray-600 font-medium">Klik untuk upload foto</p>
                                        <p className="text-xs text-gray-400">JPG, PNG, HEIC · Maks 5MB</p>
                                    </div>
                                )}
                            </div>

                            {evidencePhotos.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {evidencePhotos.map((photo, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border shadow-sm">
                                            <img
                                                src={photo.url}
                                                alt={photo.originalName}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p className="text-[10px] text-gray-500 p-1 truncate bg-white">{photo.originalName}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Unlock className="w-5 h-5 mr-2" />
                                Submit Release
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

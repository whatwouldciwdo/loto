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
import AssetSearchCombobox from '@/components/loto/asset-search'
import { Badge } from '@/components/ui/badge'
import { FileCheck, Save } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// TBA: Will be announced later
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

export default function OperatorFormPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [lotoRequest, setLotoRequest] = useState<any>(null)
    const [selectedAsset, setSelectedAsset] = useState<any>(null)

    const [formData, setFormData] = useState({
        descriptionPekerjaan: '',
        assetId: '',
        peralatan: '',
        eksekusi: '',
        eksekutor: '',
        keterangan: '',
        seksiHAR: '',
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

            // Pre-fill form if operatorForm data exists
            const saved = loto.formData?.operatorForm
            if (saved) {
                setFormData({
                    descriptionPekerjaan: saved.descriptionPekerjaan || saved.deskripsiPekerjaan || '',
                    assetId: saved.assetId || '',
                    peralatan: saved.peralatan || '',
                    eksekusi: saved.eksekusi || '',
                    eksekutor: saved.eksekutor || '',
                    keterangan: saved.keterangan || '',
                    seksiHAR: saved.seksiHAR || '',
                })

                // Restore selected asset
                if (saved.assetId) {
                    setSelectedAsset({
                        id: saved.assetId,
                        assetNumber: saved.assetNumber || '',
                        equipmentName: saved.equipmentName || '',
                        unit: saved.unit || '',
                    })
                }
            } else {
                // Pre-fill description from LOTO request if no operator form data exists
                setFormData(prev => ({
                    ...prev,
                    descriptionPekerjaan: loto.formData?.description || ''
                }))
            }
        } catch (err: any) {
            showToast('error', 'Error', err.message || 'Failed to load LOTO request')
        }
    }

    const isInitialLoad = useRef(true)

    // Reset eksekusi when peralatan changes (but not on initial load)
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }
        if (formData.peralatan) {
            setFormData(prev => ({ ...prev, eksekusi: '' }))
        }
    }, [formData.peralatan])

    const handleSubmit = async (submitType: 'draft' | 'execute') => {
        // Validation - only require asset for execute
        if (submitType === 'execute' && !selectedAsset) {
            showToast('error', 'Validation Error', 'Please select an asset before executing')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_ROUTES.LOTO.BASE}/${params.id}/operator-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formData: {
                        ...formData,
                        ...(selectedAsset ? {
                            assetId: selectedAsset.id,
                            assetNumber: selectedAsset.assetNumber,
                            equipmentName: selectedAsset.equipmentName,
                            unit: selectedAsset.unit,
                        } : {}),
                    },
                    submitType,
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            const message = submitType === 'draft'
                ? 'Draft saved successfully!'
                : 'Operator form executed successfully!'

            showToast('success', 'Success', message)

            // After execute, redirect to print tag
            if (submitType === 'execute') {
                router.push(`/loto/${params.id}/print-tag`)
            } else {
                router.push(`/loto/${params.id}`)
            }
        } catch (err: any) {
            showToast('error', 'Submission failed', err.message || 'Failed to submit form')
        } finally {
            setLoading(false)
        }
    }

    // Get available eksekusi options based on peralatan
    const getEksekusiOptions = () => {
        if (formData.peralatan === 'VALVE') {
            return EKSEKUSI_OPTIONS.VALVE
        } else if (formData.peralatan === 'BREAKER') {
            return EKSEKUSI_OPTIONS.BREAKER
        }
        return []
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileCheck className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="dark" className="text-sm">CAT.03</Badge>
                </div>
                <h1 className="text-4xl font-bold text-dark mb-2">
                    Form Penindak Lanjut Operator
                </h1>
                <p className="text-gray-600 text-lg">
                    Isi detail eksekusi tagging untuk LOTO request
                </p>
            </div>

            <div className="max-w-5xl">
                <Card className="mb-6 border-2 border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
                        <CardTitle className="text-2xl">Detail Eksekusi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div>
                            <Label className="text-base font-semibold mb-2 block">
                                No LOTO
                            </Label>
                            <Input
                                value={lotoRequest?.requestNumber || 'Loading...'}
                                disabled
                                className="bg-gray-100 font-mono text-lg"
                            />
                        </div>

                        <div>
                            <Label htmlFor="descriptionPekerjaan" className="text-base font-semibold mb-2 block">
                                Description Pekerjaan <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="descriptionPekerjaan"
                                value={formData.descriptionPekerjaan}
                                onChange={(e) => setFormData({ ...formData, descriptionPekerjaan: e.target.value })}
                                placeholder="Jelaskan detail pekerjaan yang akan dilakukan..."
                                required
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label className="text-base font-semibold mb-3 block">
                                Nama Asset / Equipment <span className="text-red-500">*</span>
                            </Label>
                            <AssetSearchCombobox
                                unit="CLG"
                                onSelect={setSelectedAsset}
                                selectedAsset={selectedAsset}
                            />
                            <p className="text-xs text-gray-500 mt-2">Cari dan pilih asset dari database</p>

                            {selectedAsset && (
                                <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600">Asset Terpilih</p>
                                    </div>
                                    <h4 className="text-lg font-bold text-dark mb-2">{selectedAsset.equipmentName}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Asset Number:</p>
                                            <p className="text-dark font-semibold">{selectedAsset.assetNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Unit:</p>
                                            <p className="text-dark font-semibold">{selectedAsset.unit}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="peralatan" className="text-base font-semibold mb-2 block">
                                Peralatan <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.peralatan}
                                onValueChange={(value) => setFormData({ ...formData, peralatan: value })}
                                required
                            >
                                <SelectTrigger id="peralatan">
                                    <SelectValue placeholder="Pilih jenis peralatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PERALATAN_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="eksekusi" className="text-base font-semibold mb-2 block">
                                Eksekusi <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.eksekusi}
                                onValueChange={(value) => setFormData({ ...formData, eksekusi: value })}
                                disabled={!formData.peralatan}
                                required
                            >
                                <SelectTrigger id="eksekusi">
                                    <SelectValue placeholder={
                                        formData.peralatan
                                            ? "Pilih tipe eksekusi"
                                            : "Pilih peralatan terlebih dahulu"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {getEksekusiOptions().map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.peralatan === 'VALVE' && 'Valve: Open / Close'}
                                {formData.peralatan === 'BREAKER' && 'Breaker: Role In / Role Out'}
                                {!formData.peralatan && 'Pilih peralatan untuk melihat opsi eksekusi'}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="eksekutor" className="text-base font-semibold mb-2 block">
                                Eksekutor (Team Leader) <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.eksekutor}
                                onValueChange={(value) => setFormData({ ...formData, eksekutor: value })}
                                required
                            >
                                <SelectTrigger id="eksekutor">
                                    <SelectValue placeholder="Pilih team leader" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEAM_LEADERS.map((leader) => (
                                        <SelectItem key={leader} value={leader}>
                                            {leader}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Nama team leader akan diumumkan (TBA)</p>
                        </div>

                        <div>
                            <Label htmlFor="keterangan" className="text-base font-semibold mb-2 block">
                                Keterangan
                            </Label>
                            <Textarea
                                id="keterangan"
                                value={formData.keterangan}
                                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                placeholder="Catatan tambahan (opsional)..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="seksiHAR" className="text-base font-semibold mb-2 block">
                                Seksi HAR <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.seksiHAR}
                                onValueChange={(value) => setFormData({ ...formData, seksiHAR: value })}
                                required
                            >
                                <SelectTrigger id="seksiHAR">
                                    <SelectValue placeholder="Pilih seksi HAR" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SEKSI_HAR_OPTIONS.map((seksi) => (
                                        <SelectItem key={seksi} value={seksi}>
                                            {seksi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Nama seksi HAR akan diumumkan (TBA)</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => handleSubmit('draft')}
                        disabled={loading}
                        className="flex-1 border-2"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Menyimpan...' : 'Save Draft'}
                    </Button>
                    <Button
                        type="button"
                        size="lg"
                        onClick={() => handleSubmit('execute')}
                        disabled={loading || !selectedAsset}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                        <FileCheck className="w-5 h-5 mr-2" />
                        {loading ? 'Memproses...' : 'Eksekusi'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

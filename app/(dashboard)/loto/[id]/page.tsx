"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { API_ROUTES } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
    CheckCircle2, Circle, GitBranch, FileText, Calendar, Clock,
    User, ClipboardList, Wrench, Zap, Pencil, Printer, FileEdit,
    Lock, Unlock, XCircle, Settings, Camera
} from 'lucide-react'

interface LotoRequest {
    id: string
    requestNumber: string
    status: string
    type: string
    formData: any
    createdBy: {
        name: string
        username: string
    }
    operator?: {
        name: string
        username: string
    }
    createdAt: string
    updatedAt: string
}

export default function LotoDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { showToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [loto, setLoto] = useState<LotoRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchLotoDetail()
    }, [params.id])

    const fetchLotoDetail = async () => {
        try {
            const response = await fetch(`${API_ROUTES.LOTO.BASE}/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch LOTO detail')
            const data = await response.json()
            setLoto(data.data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        )
    }

    if (error || !loto) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error || 'LOTO request not found'}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        REQUEST: 'bg-yellow-100 text-yellow-800',
        DRAFT: 'bg-gray-100 text-gray-800',
        ACTIVE: 'bg-green-100 text-green-800',
        CLOSE: 'bg-blue-100 text-blue-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark mb-2">{loto.requestNumber}</h1>
                        <p className="text-gray-600">
                            Created by: <span className="font-semibold">{loto.createdBy.name}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            {new Date(loto.createdAt).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <Badge className={`${statusColors[loto.status]} border-2 text-lg px-4 py-2`}>
                        {loto.status.replace(/_/g, ' ')}
                    </Badge>
                </div>
                <Button variant="outline" onClick={() => router.push('/loto')}>
                    ← Back to List
                </Button>
            </div>

            {/* Workflow Progress - Horizontal */}
            <Card className="mb-6">
                <CardHeader className="bg-gradient-to-r from-dark to-gray-800">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <GitBranch className="w-5 h-5 text-neon" />
                        Workflow Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex items-start justify-between relative">
                        {/* Progress Line Background */}
                        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 rounded-full" />
                        {/* Progress Line Active */}
                        <div
                            className="absolute top-5 left-[10%] h-1 rounded-full transition-all duration-700"
                            style={{
                                width: (loto.status === 'REQUEST' || loto.status === 'DRAFT') ? '0%' :
                                    loto.status === 'ACTIVE' ? '40%' :
                                        loto.status === 'CLOSE' ? '80%' : '0%',
                                background: 'linear-gradient(90deg, #a3e635, #22c55e)'
                            }}
                        />

                        {/* Step 1: Created */}
                        <div className="flex flex-col items-center z-10 flex-1">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-4 ring-green-100">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-semibold text-sm mt-3 text-center">Request Created</p>
                            <p className="text-xs text-gray-500 mt-1 text-center">By {loto.createdBy.name}</p>
                        </div>

                        {/* Step 2: Operator Execution */}
                        <div className="flex flex-col items-center z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-4 ${(loto.status === 'REQUEST' || loto.status === 'DRAFT') ? 'bg-gray-300 ring-gray-100 text-gray-500' :
                                loto.status === 'ACTIVE' ? 'bg-neon ring-yellow-100 text-dark animate-pulse' :
                                    loto.status === 'CLOSE' ? 'bg-green-500 ring-green-100 text-white' :
                                        'bg-gray-300 ring-gray-100 text-gray-500'
                                }`}>
                                {loto.status === 'ACTIVE' || loto.status === 'CLOSE' ?
                                    <CheckCircle2 className="w-5 h-5" /> :
                                    <Circle className="w-5 h-5" />
                                }
                            </div>
                            <p className="font-semibold text-sm mt-3 text-center">Operator Execution</p>
                            <p className={`text-xs mt-1 text-center ${(loto.status === 'REQUEST' || loto.status === 'DRAFT') ? 'text-gray-400' :
                                loto.status === 'ACTIVE' ? 'text-orange-600 font-medium' :
                                    'text-green-600'
                                }`}>
                                {loto.status === 'REQUEST' ? 'Waiting' :
                                    loto.status === 'DRAFT' ? 'Draft Saved' :
                                        loto.status === 'ACTIVE' ? 'Equipment Tagged' :
                                            loto.status === 'CLOSE' ? 'Completed' : 'Not started'}
                            </p>
                            {loto.operator && <p className="text-xs text-gray-400 mt-0.5">{loto.operator.name}</p>}
                        </div>

                        {/* Step 3: Release */}
                        <div className="flex flex-col items-center z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-4 ${loto.status === 'CLOSE' ? 'bg-blue-500 ring-blue-100 text-white' :
                                loto.status === 'ACTIVE' ? 'bg-gray-300 ring-gray-100 text-gray-500 animate-pulse' :
                                    'bg-gray-300 ring-gray-100 text-gray-500'
                                }`}>
                                {loto.status === 'CLOSE' ?
                                    <CheckCircle2 className="w-5 h-5" /> :
                                    <Circle className="w-5 h-5" />
                                }
                            </div>
                            <p className="font-semibold text-sm mt-3 text-center">Release</p>
                            <p className={`text-xs mt-1 text-center ${loto.status === 'ACTIVE' ? 'text-gray-400' :
                                loto.status === 'CLOSE' ? 'text-blue-600 font-medium' :
                                    'text-gray-400'
                                }`}>
                                {loto.status === 'ACTIVE' ? 'Ready for release' :
                                    loto.status === 'CLOSE' ? 'Released & Closed' : 'Not started'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="mb-6">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-dark" />
                        Request Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Summary Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Request No.</p>
                            <p className="font-bold text-dark mt-1">{loto.requestNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                            <Badge className={`${statusColors[loto.status]} mt-1`}>
                                {loto.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                            <p className="font-semibold text-dark mt-1">{loto.type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Created By</p>
                            <p className="font-semibold text-dark mt-1">{loto.createdBy.name}</p>
                        </div>
                    </div>

                    {/* Date Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="text-sm font-medium">{new Date(loto.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="text-sm font-medium">{new Date(loto.updatedAt).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        {loto.operator && (
                            <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Operator</p>
                                    <p className="text-sm font-medium">{loto.operator.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Data */}
                    <div className="border-t pt-5">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Work Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <p className="text-xs text-gray-500">Workorder Number</p>
                                <p className="font-semibold text-dark mt-0.5">{loto.formData.workorderNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Work Type</p>
                                <p className="font-semibold text-dark mt-0.5">{loto.formData.workType || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Seksi</p>
                                <p className="font-semibold text-dark mt-0.5">{loto.formData.seksi || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="font-semibold text-dark mt-0.5">{loto.formData.description || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Operator Form Data */}
                    {loto.formData.operatorForm && (
                        <div className="border-t mt-6 pt-5">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                Operator Execution Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Equipment</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.equipmentName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Peralatan</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.peralatan || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Eksekusi</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.eksekusi || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Eksekutor</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.eksekutor || '-'}</p>
                                </div>
                                {loto.formData.operatorForm.keterangan && (
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500">Keterangan</p>
                                        <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.keterangan}</p>
                                    </div>
                                )}
                                {loto.formData.operatorForm.unit && (
                                    <div>
                                        <p className="text-xs text-gray-500">Unit</p>
                                        <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.unit}</p>
                                    </div>
                                )}
                                {loto.formData.operatorForm.assetNumber && (
                                    <div>
                                        <p className="text-xs text-gray-500">Asset Number</p>
                                        <p className="font-semibold text-dark mt-0.5">{loto.formData.operatorForm.assetNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Release Details */}
                    {loto.formData.releaseForm && (
                        <div className="border-t mt-6 pt-5">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
                                <Unlock className="w-4 h-4" />
                                Release Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">Eksekusi Release</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.releaseForm.eksekusi || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Eksekutor Release</p>
                                    <p className="font-semibold text-dark mt-0.5">{loto.formData.releaseForm.eksekutorRelease || '-'}</p>
                                </div>
                                {loto.formData.releaseForm.keteranganRelease && (
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500">Keterangan Release</p>
                                        <p className="font-semibold text-dark mt-0.5">{loto.formData.releaseForm.keteranganRelease}</p>
                                    </div>
                                )}
                            </div>

                            {/* Evidence Photos */}
                            {loto.formData.releaseForm.evidencePhotos && loto.formData.releaseForm.evidencePhotos.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        Dokumentasi Evidence ({loto.formData.releaseForm.evidencePhotos.length} foto)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {loto.formData.releaseForm.evidencePhotos.map((photo: any, index: number) => (
                                            <a
                                                key={index}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.originalName || `Evidence ${index + 1}`}
                                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                <p className="text-[10px] text-gray-500 p-1.5 truncate bg-white border-t">
                                                    {photo.originalName || `Evidence ${index + 1}`}
                                                </p>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
                <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-dark" />
                        Actions
                    </CardTitle>
                    <CardDescription>Available actions based on current status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {(loto.status === 'REQUEST' || loto.status === 'DRAFT') && (
                        <div className="space-y-3">
                            {loto.formData?.operatorForm ? (
                                <>
                                    <p className="text-gray-700 mb-4">Operator form sudah diisi. Lanjutkan eksekusi atau edit.</p>
                                    <div className="flex gap-3 flex-wrap">
                                        <Button
                                            variant="default"
                                            size="lg"
                                            onClick={() => {
                                                showConfirm({
                                                    type: 'warning',
                                                    title: 'Eksekusi LOTO',
                                                    message: 'Eksekusi LOTO ini? Status akan berubah menjadi ACTIVE.',
                                                    confirmText: 'Eksekusi',
                                                    onConfirm: async () => {
                                                        try {
                                                            const res = await fetch(`/api/loto/${params.id}/operator-form`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    formData: loto.formData.operatorForm,
                                                                    submitType: 'execute',
                                                                }),
                                                            })
                                                            const data = await res.json()
                                                            if (!res.ok) throw new Error(data.error)
                                                            router.push(`/loto/${params.id}/print-tag`)
                                                        } catch (err: any) {
                                                            alert(err.message || 'Failed to execute')
                                                        }
                                                    },
                                                })
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            ⚡ Eksekusi
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push(`/loto/${params.id}/operator-form`)}
                                        >
                                            <Pencil className="w-4 h-4 mr-1" /> Edit Operator Form
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(`/loto/${params.id}/print-tag`, '_blank')}
                                        >
                                            <Printer className="w-4 h-4 mr-1" /> Print Tag
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-700 mb-4">Fill the operator execution form to proceed</p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="default"
                                            size="lg"
                                            onClick={() => router.push(`/loto/${params.id}/operator-form`)}
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            <FileEdit className="w-4 h-4 mr-1" /> Fill Operator Form
                                        </Button>

                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {loto.status === 'ACTIVE' && (
                        <div>
                            <p className="text-green-700 font-semibold mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5" /> Equipment is currently tagged
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={() => window.open(`/loto/${params.id}/print-tag`, '_blank')}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Printer className="w-4 h-4 mr-1" /> Print Tag
                                </Button>
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={() => router.push(`/loto/${params.id}/release`)}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    <Unlock className="w-4 h-4 mr-1" /> Submit Release Form
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/loto/${params.id}/operator-form`)}
                                >
                                    <Pencil className="w-4 h-4 mr-1" /> Edit Execution Form
                                </Button>
                            </div>
                        </div>
                    )}

                    {loto.status === 'CLOSE' && (
                        <div>
                            <p className="text-blue-700 font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> LOTO Request Completed and Closed
                            </p>
                            <p className="text-sm text-gray-600 mt-2">All work completed successfully. No further actions needed.</p>
                        </div>
                    )}

                    {loto.status === 'CANCELLED' && (
                        <div>
                            <p className="text-red-700 font-semibold flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> Request Cancelled
                            </p>
                            <p className="text-sm text-gray-600 mt-2">This request has been cancelled.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

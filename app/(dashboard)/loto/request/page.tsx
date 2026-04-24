"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_ROUTES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileEdit, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// TBA: Will be announced later - placeholders for now
const WORK_TYPES = [
    'Proactive Maintenance',
    'Run To Failure',
    'Supporting',
    'Corrective Maintenance',
    'Preventive Maintenance',
    'Predictive Maintenance',
    'Emergency Maintenance',
    'Overhaul',
    'Condition Directed',
]

const SEKSI_LIST = [
    // Maintenance HAR (Specific teams with names)
    'HAR-MECH (JUWAN OKTAVIANSA)',
    'HAR-I&C (YUDI NUGRAHA)',
    'HAR-ELEC (GUNAWAN)',
    'HAR-BOP (RIZKY ALIF)',
    'SARANA (IRVAN SANDI)',
    'HAR-PREDIKTIF (PEBRIANTO GINTING)',
]

// Generate LOTO number: LOTO-YYYYMMDD-XXXX
function generateLotoNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
    return `LOTO-${year}${month}${day}-${random}`
}

export default function LotoRequestPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lotoNumber, setLotoNumber] = useState('')

    // Generate LOTO number on mount
    useEffect(() => {
        setLotoNumber(generateLotoNumber())
    }, [])

    const [formData, setFormData] = useState({
        workorderNumber: '',
        description: '',
        workType: '',
        seksi: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(API_ROUTES.LOTO.BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'TAGGING',
                    formData,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to create LOTO request')
                showToast('error', 'Failed to create request', data.error)
                return
            }

            showToast('success', 'LOTO Request Created!', `Request #${data.data.requestNumber}`)
            router.push(`/loto/${data.data.id}`)
        } catch (err: any) {
            setError('An error occurred. Please try again.')
            showToast('error', 'System error', 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-8 animate-fade-in-down">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-neon to-neon-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-7 h-7 text-dark" />
                    </div>
                    <Badge variant="dark" className="text-sm">CAT.02</Badge>
                </div>
                <h1 className="text-4xl font-bold text-dark mb-2">
                    Request LOTO
                </h1>
                <p className="text-gray-600 text-lg">
                    Create a new Lockout/Tagout request for equipment isolation
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <Card className="mb-6 border-2 border-gray-200 animate-fade-in-up">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-neon w-10 h-10 rounded-lg flex items-center justify-center">
                                <FileEdit className="w-5 h-5 text-dark" />
                            </div>
                            <CardTitle className="text-2xl">Form Request LOTO</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div>
                            <Label className="text-base font-semibold mb-2 block">
                                No LOTO
                            </Label>
                            <Input
                                value={lotoNumber}
                                disabled
                                className="bg-gray-100 font-mono text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated LOTO number</p>
                        </div>

                        <div>
                            <Label htmlFor="workorderNumber" className="text-base font-semibold mb-2 block">
                                Workorder Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="workorderNumber"
                                value={formData.workorderNumber}
                                onChange={(e) => setFormData({ ...formData, workorderNumber: e.target.value })}
                                placeholder="Enter workorder number"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the maintenance work to be performed..."
                                required
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="workType" className="text-base font-semibold mb-2 block">
                                Work Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.workType}
                                onValueChange={(value) => setFormData({ ...formData, workType: value })}
                                required
                            >
                                <SelectTrigger id="workType">
                                    <SelectValue placeholder="Select work type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {WORK_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Select the type of maintenance work</p>
                        </div>

                        <div>
                            <Label htmlFor="seksi" className="text-base font-semibold mb-2 block">
                                Seksi <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.seksi}
                                onValueChange={(value) => setFormData({ ...formData, seksi: value })}
                                required
                            >
                                <SelectTrigger id="seksi">
                                    <SelectValue placeholder="Select seksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SEKSI_LIST.map((seksi) => (
                                        <SelectItem key={seksi} value={seksi}>
                                            {seksi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Select the responsible section</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 animate-fade-in-up animate-delay-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-neon hover:bg-neon-600 text-dark font-semibold"
                    >
                        {loading ? 'Memproses...' : 'Submit Request'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

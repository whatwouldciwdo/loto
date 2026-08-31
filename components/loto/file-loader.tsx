"use client"

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    X,
    Layers,
    Send,
    ExternalLink,
    Edit3,
    CheckSquare,
    Square
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'

export interface LoaderParsedData {
    workorderNumber: string
    description: string
    workType: string
    seksi: string
    assetNumber: string
    assetDescription: string
    matchedAsset?: any | null
    selected?: boolean
}

interface FileLoaderProps {
    onLoadData: (data: LoaderParsedData, matchedAsset: any | null) => void
    workTypes: string[]
    seksiList: string[]
}

const WORK_TYPE_MAP: Record<string, string> = {
    'CM': 'Corrective Maintenance',
    'CORRECTIVE': 'Corrective Maintenance',
    'PM': 'Preventive Maintenance',
    'PREVENTIVE': 'Preventive Maintenance',
    'PDM': 'Predictive Maintenance',
    'PREDICTIVE': 'Predictive Maintenance',
    'EM': 'Emergency Maintenance',
    'EMERGENCY': 'Emergency Maintenance',
    'PAM': 'Proactive Maintenance',
    'PROACTIVE': 'Proactive Maintenance',
    'RTF': 'Run To Failure',
    'OH': 'Overhaul',
    'OVERHAUL': 'Overhaul',
    'CD': 'Condition Directed',
    'SUP': 'Supporting',
    'SUPPORTING': 'Supporting',
}

export default function FileLoader({ onLoadData, workTypes, seksiList }: FileLoaderProps) {
    const { showToast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [parsedRows, setParsedRows] = useState<LoaderParsedData[]>([])
    const [selectedRowIndex, setSelectedRowIndex] = useState(0)
    const [viewMode, setViewMode] = useState<'batch' | 'single'>('batch')

    // Batch creation state
    const [isSubmittingBatch, setIsSubmittingBatch] = useState(false)
    const [batchResults, setBatchResults] = useState<{
        createdCount: number
        items: Array<{ id: string; requestNumber: string; workorderNumber: string; seksi: string; description?: string }>
    } | null>(null)

    const decodeHtmlEntities = (str: string): string => {
        if (!str) return ''
        return str
            .replace(/&#040;/g, '(')
            .replace(/&#041;/g, ')')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]+>/g, '')
            .trim()
    }

    const mapWorkType = (val: string): string => {
        if (!val) return 'Corrective Maintenance'
        const upper = val.toUpperCase().trim()
        if (WORK_TYPE_MAP[upper]) return WORK_TYPE_MAP[upper]
        const found = workTypes.find(wt => wt.toUpperCase() === upper || wt.toUpperCase().includes(upper))
        return found || val || 'Corrective Maintenance'
    }

    const mapSeksi = (val: string): string => {
        if (!val) return ''
        const upper = val.toUpperCase().trim()

        if (upper.includes('ELEC') || upper.includes('LISTRIK')) {
            return seksiList.find(s => s.includes('HAR-ELEC')) || ''
        }
        if (upper.includes('MECH') || upper.includes('MEKANIK')) {
            return seksiList.find(s => s.includes('HAR-MECH')) || ''
        }
        if (upper.includes('I&C') || upper.includes('INC') || upper.includes('INSTRUMENT')) {
            return seksiList.find(s => s.includes('HAR-I&C')) || ''
        }
        if (upper.includes('BOP')) {
            return seksiList.find(s => s.includes('HAR-BOP')) || ''
        }
        if (upper.includes('SARANA') || upper.includes('UMUM')) {
            return seksiList.find(s => s.includes('SARANA')) || ''
        }
        if (upper.includes('PRED') || upper.includes('PREDIKTIF') || upper.includes('RCBM')) {
            return seksiList.find(s => s.includes('HAR-PREDIKTIF')) || ''
        }

        const exact = seksiList.find(s => s.toUpperCase().startsWith(upper) || s.toUpperCase().includes(upper))
        return exact || val
    }

    const findAssetInDb = async (assetNumber: string, assetDesc: string) => {
        try {
            const query = assetNumber || assetDesc
            if (!query) return null

            const res = await fetch(`/api/assets/search?q=${encodeURIComponent(query)}&unit=CLG`)
            if (!res.ok) return null
            const json = await res.json()
            const list = json.data || []
            if (list.length === 0) return null

            const exact = list.find((a: any) =>
                a.assetNumber?.toUpperCase() === assetNumber?.toUpperCase()
            )
            return exact || list[0]
        } catch (err) {
            console.error('Error finding asset in DB:', err)
            return null
        }
    }

    const parseHtmlSpreadsheet = (htmlText: string): LoaderParsedData[] => {
        const tableMatch = htmlText.match(/<table[\s\S]*?<\/table>/i)
        if (!tableMatch) return []

        const trRegex = /<tr[\s\S]*?<\/tr>/gi
        const rows = tableMatch[0].match(trRegex) || []
        if (rows.length < 2) return []

        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi

        const headerRow = rows[0] || ''
        const headers: string[] = []
        let match
        while ((match = cellRegex.exec(headerRow)) !== null) {
            headers.push(decodeHtmlEntities(match[1] || ''))
        }

        const woIdx = headers.findIndex(h => {
            const up = (h || '').toUpperCase().trim()
            return up === 'WORK ORDER' || up === 'WO ID' || up === 'NO WO' || up === 'WO' || up === 'WORKORDER'
        })

        const descIndices = headers.map((h, i) => (h || '').toUpperCase().trim() === 'DESCRIPTION' ? i : -1).filter(i => i !== -1)
        const woDescIdx = descIndices.length > 0 ? descIndices[0] : headers.findIndex(h => (h || '').toUpperCase().includes('DESC') && !(h || '').toUpperCase().includes('ASSET'))

        const workTypeIdx = headers.findIndex(h => {
            const up = (h || '').toUpperCase().trim()
            return up === 'WORK TYPE' || up === 'WORK_TYPE' || up === 'TIPE' || up === 'JENIS PEKERJAAN'
        })

        const assetIdx = headers.findIndex(h => {
            const up = (h || '').toUpperCase().trim()
            return up === 'ASSET' || up === 'ASSET ID' || up === 'NO ASSET' || up === 'KODE ASSET'
        })

        const assetDescIdx = descIndices.length > 1 ? descIndices[1] : headers.findIndex(h => {
            const up = (h || '').toUpperCase().trim()
            return up.includes('ASSET DESC') || up.includes('EQUIPMENT')
        })

        const seksiIdx = headers.findIndex(h => {
            const up = (h || '').toUpperCase().trim()
            return up === 'SEKSI' || up === 'SECTION' || up === 'BIDANG' || up === 'DEPARTEMEN'
        })

        const result: LoaderParsedData[] = []
        for (let r = 1; r < rows.length; r++) {
            const currentRow = rows[r] || ''
            const cells: string[] = []
            const rowCellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
            while ((match = rowCellRegex.exec(currentRow)) !== null) {
                cells.push(decodeHtmlEntities(match[1] || ''))
            }

            if (cells.length > 0) {
                const wo = woIdx !== -1 ? cells[woIdx] || '' : ''
                const desc = woDescIdx !== -1 ? cells[woDescIdx] || '' : ''
                const wt = workTypeIdx !== -1 ? cells[workTypeIdx] || '' : ''
                const asset = assetIdx !== -1 ? cells[assetIdx] || '' : ''
                const assetDesc = assetDescIdx !== -1 ? cells[assetDescIdx] || '' : ''
                const seksi = seksiIdx !== -1 ? cells[seksiIdx] || '' : ''

                if (wo || desc || asset) {
                    result.push({
                        workorderNumber: wo,
                        description: desc,
                        workType: mapWorkType(wt),
                        seksi: mapSeksi(seksi),
                        assetNumber: asset,
                        assetDescription: assetDesc,
                        selected: true,
                    })
                }
            }
        }

        return result
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        const validExtensions = ['.xlsx', '.xls', '.csv']
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

        if (!validExtensions.includes(ext)) {
            showToast('error', 'Format Tidak Didukung', 'Harap upload file dengan format .xlsx, .xls, atau .csv')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setLoading(true)
        setFileName(file.name)
        setBatchResults(null)

        try {
            let parsed: LoaderParsedData[] = []

            const textSample = await file.text()
            const lowerText = textSample.toLowerCase()
            if (lowerText.includes('<html') || lowerText.includes('<table') || lowerText.includes('<tr')) {
                parsed = parseHtmlSpreadsheet(textSample)
            }
            
            // If not HTML or HTML parse returned empty, try standard Binary XLSX / CSV
            if (parsed.length === 0) {
                const dataBuffer = await file.arrayBuffer()
                const workbook = XLSX.read(dataBuffer, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[firstSheetName]
                const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

                parsed = rawRows.map((r) => {
                    const keys = Object.keys(r)
                    const findKey = (candidates: string[]) => {
                        return keys.find(k => {
                            const clean = k.trim().toUpperCase()
                            return candidates.some(c => clean === c || clean.includes(c))
                        })
                    }

                    const woKey = findKey(['WO ID', 'WO_ID', 'WORKORDER', 'WORK ORDER', 'NO WO', 'WO NUMBER', 'WO'])
                    const descKey = keys.find(k => {
                        const clean = k.trim().toUpperCase()
                        return (clean === 'DESCRIPTION' || clean === 'DESKRIPSI' || clean === 'WORK DESCRIPTION') &&
                            !clean.includes('ASSET') && !clean.includes('KODE')
                    })
                    const workTypeKey = findKey(['WORK TYPE', 'WORK_TYPE', 'WORKTYPE', 'JENIS PEKERJAAN', 'TIPE PEKERJAAN', 'TIPE'])
                    const assetKey = keys.find(k => {
                        const clean = k.trim().toUpperCase()
                        return (clean === 'ASSET' || clean === 'ASSET ID' || clean === 'NO ASSET' || clean === 'KODE ASSET') &&
                            !clean.includes('DESCRIPTION') && !clean.includes('DESC')
                    })
                    const assetDescKey = findKey(['ASSET DESCRIPTION', 'ASSET_DESCRIPTION', 'ASSET DESC', 'EQUIPMENT NAME', 'EQUIPMENT', 'NAMA ASSET'])
                    const seksiKey = findKey(['SEKSI', 'SECTION', 'BIDANG', 'DEPARTEMEN', 'DISIPLIN'])

                    const rawWo = woKey ? decodeHtmlEntities(String(r[woKey])) : ''
                    const rawDesc = descKey ? decodeHtmlEntities(String(r[descKey])) : ''
                    const rawWorkType = workTypeKey ? decodeHtmlEntities(String(r[workTypeKey])) : ''
                    const rawAsset = assetKey ? decodeHtmlEntities(String(r[assetKey])) : ''
                    const rawAssetDesc = assetDescKey ? decodeHtmlEntities(String(r[assetDescKey])) : ''
                    const rawSeksi = seksiKey ? decodeHtmlEntities(String(r[seksiKey])) : ''

                    return {
                        workorderNumber: rawWo,
                        description: rawDesc,
                        workType: mapWorkType(rawWorkType),
                        seksi: mapSeksi(rawSeksi),
                        assetNumber: rawAsset,
                        assetDescription: rawAssetDesc,
                        selected: true,
                    }
                }).filter(item => item.workorderNumber || item.description || item.assetNumber)
            }

            if (parsed.length === 0) {
                showToast('error', 'Data Tidak Sesuai', 'Format kolom file tidak cocok dengan template loader (WO ID / Work Order, DESCRIPTION, ASSET, dll.)')
                setLoading(false)
                return
            }

            // In background match assets with DB
            const enriched: LoaderParsedData[] = await Promise.all(
                parsed.map(async (row) => {
                    let matched = null
                    if (row.assetNumber || row.assetDescription) {
                        matched = await findAssetInDb(row.assetNumber, row.assetDescription)
                    }
                    return {
                        ...row,
                        matchedAsset: matched,
                    }
                })
            )

            setParsedRows(enriched)
            setSelectedRowIndex(0)

            // Auto-load first row into single form as default preview
            if (enriched.length > 0) {
                onLoadData(enriched[0], enriched[0].matchedAsset)
            }

            showToast('success', 'File Berhasil Dimuat!', `${enriched.length} data WO ditemukan.`)
        } catch (err: any) {
            console.error('Error parsing loader file:', err)
            showToast('error', 'Gagal Membaca File', err.message || 'Terjadi kesalahan saat membaca file')
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSelectRow = (index: number) => {
        setSelectedRowIndex(index)
        const row = parsedRows[index]
        if (row) {
            onLoadData(row, row.matchedAsset)
            showToast('info', 'Data Baris Dimuat', `Memuat data WO ${row.workorderNumber || `#${index + 1}`} ke form`)
        }
    }

    const toggleRowSelect = (index: number) => {
        setParsedRows(prev => {
            const next = [...prev]
            next[index] = { ...next[index], selected: !next[index].selected }
            return next
        })
    }

    const toggleSelectAll = () => {
        const allSelected = parsedRows.every(r => r.selected)
        setParsedRows(prev => prev.map(r => ({ ...r, selected: !allSelected })))
    }

    const handleUpdateRowField = (index: number, field: keyof LoaderParsedData, val: any) => {
        setParsedRows(prev => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: val }
            return next
        })
    }

    const handleBatchSubmit = async () => {
        const selectedItems = parsedRows.filter(r => r.selected)
        if (selectedItems.length === 0) {
            showToast('error', 'Tidak Ada Data Terpilih', 'Silakan centang minimal 1 baris WO yang ingin dibuat')
            return
        }

        setIsSubmittingBatch(true)

        try {
            const payload = {
                items: selectedItems.map(item => ({
                    type: 'TAGGING',
                    formData: {
                        workorderNumber: item.workorderNumber,
                        description: item.description,
                        workType: item.workType,
                        seksi: item.seksi,
                        assetId: item.matchedAsset?.id || '',
                        assetNumber: item.matchedAsset?.assetNumber || item.assetNumber,
                        equipmentName: item.matchedAsset?.equipmentName || item.assetDescription || item.assetNumber,
                        unit: item.matchedAsset?.unit || 'CLG',
                        location: item.matchedAsset?.location || '',
                        kodeAlas: item.matchedAsset?.kodeAlas || '',
                        systemOwner: item.matchedAsset?.systemOwner || '',
                    },
                })),
            }

            const response = await fetch('/api/loto/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                showToast('error', 'Batch Create Gagal', data.error || 'Gagal memproses batch LOTO')
                return
            }

            setBatchResults({
                createdCount: data.createdCount,
                items: data.createdItems || [],
            })

            showToast('success', 'Batch Selesai! 🎉', `Berhasil membuat ${data.createdCount} tiket LOTO & mengirim WhatsApp ke masing-masing seksi.`)
        } catch (err: any) {
            console.error('Batch submit error:', err)
            showToast('error', 'System Error', err.message || 'Terjadi kesalahan sistem saat membuat batch LOTO')
        } finally {
            setIsSubmittingBatch(false)
        }
    }

    const handleClear = () => {
        setFileName(null)
        setParsedRows([])
        setSelectedRowIndex(0)
        setBatchResults(null)
    }

    const selectedCount = parsedRows.filter(r => r.selected).length

    return (
        <Card className="border-2 border-dashed border-neon-600/50 bg-gradient-to-br from-green-50/40 via-white to-gray-50 mb-6 shadow-md transition-all">
            <CardContent className="p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center text-dark shadow-md shrink-0">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-dark text-base">Upload Loader (.XLSX / .XLS Maximo / .CSV)</h3>
                                <Badge variant="outline" className="bg-neon/30 text-dark border-neon text-xs font-semibold">
                                    Multi-WO Batch
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Upload file Excel atau hasil export Maximo untuk membuat tiket LOTO secara batch atau satu per satu
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="loader-file-input"
                        />

                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || isSubmittingBatch}
                            className="bg-neon hover:bg-neon-600 text-dark font-semibold text-sm shadow-sm gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Membaca Data...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    {fileName ? 'Ganti File' : 'Upload File Loader'}
                                </>
                            )}
                        </Button>

                        {fileName && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                title="Hapus file"
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Batch Success Summary Banner */}
                {batchResults && (
                    <div className="mt-5 p-4 bg-green-50 border border-green-300 rounded-xl animate-fade-in shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <div>
                                    <h4 className="font-bold text-green-900 text-sm">
                                        Batch Import Berhasil! ({batchResults.createdCount} Tiket LOTO Terbuat)
                                    </h4>
                                    <p className="text-xs text-green-700">
                                        Notifikasi WhatsApp telah dikirimkan ke PIC seksi masing-masing WO.
                                    </p>
                                </div>
                            </div>
                            <Link href="/loto">
                                <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white font-medium text-xs gap-1.5 shadow-sm">
                                    Lihat Daftar LOTO <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>

                        <div className="max-h-40 overflow-y-auto border border-green-200 rounded-lg bg-white divide-y divide-gray-100 text-xs">
                            {batchResults.items.map((item, idx) => (
                                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-green-50/50">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-100 text-green-800 font-mono">
                                            {item.requestNumber}
                                        </Badge>
                                        <span className="font-semibold text-gray-800">WO: {item.workorderNumber}</span>
                                        <span className="text-gray-500 truncate max-w-xs">{item.description}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-gray-100 text-gray-700 font-normal">
                                            {item.seksi}
                                        </Badge>
                                        <Link href={`/loto/${item.id}`} target="_blank">
                                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-green-700 hover:bg-green-100">
                                                Detail
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Parsed Data Container */}
                {fileName && parsedRows.length > 0 && !batchResults && (
                    <div className="mt-5 pt-4 border-t border-gray-200 animate-fade-in">
                        {/* Header bar with controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-dark text-sm">File Aktif:</span>
                                <span className="font-mono bg-white px-2.5 py-1 border rounded-md text-xs font-bold text-dark">
                                    {fileName}
                                </span>
                                <Badge variant="dark" className="text-xs">
                                    {parsedRows.length} Total WO
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="bg-gray-200/80 p-0.5 rounded-lg flex text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('batch')}
                                        className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                                            viewMode === 'batch'
                                                ? 'bg-white text-dark shadow-sm'
                                                : 'text-gray-600 hover:text-dark'
                                        }`}
                                    >
                                        <Layers className="w-3.5 h-3.5" /> Batch Table Mode
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('single')}
                                        className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                                            viewMode === 'single'
                                                ? 'bg-white text-dark shadow-sm'
                                                : 'text-gray-600 hover:text-dark'
                                        }`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Single Form Mode
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MODE 1: BATCH PREVIEW TABLE (Create All in 1 Click) */}
                        {viewMode === 'batch' && (
                            <div className="space-y-3">
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                                                <tr>
                                                    <th className="p-3 w-10 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={toggleSelectAll}
                                                            className="text-gray-700 hover:text-dark"
                                                            title="Pilih / Batal Semua"
                                                        >
                                                            {parsedRows.every(r => r.selected) ? (
                                                                <CheckSquare className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <Square className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="p-3 w-12 font-bold text-center">No</th>
                                                    <th className="p-3 font-bold w-32">Work Order</th>
                                                    <th className="p-3 font-bold min-w-[220px]">Deskripsi Pekerjaan</th>
                                                    <th className="p-3 font-bold w-44">Tipe Pekerjaan</th>
                                                    <th className="p-3 font-bold w-52 text-blue-900 bg-blue-50/50">
                                                        Seksi Tujuan (Per WO)
                                                    </th>
                                                    <th className="p-3 font-bold min-w-[200px]">Asset / Equipment</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {parsedRows.map((row, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={`transition-colors ${
                                                            row.selected ? 'bg-white hover:bg-green-50/40' : 'bg-gray-50/70 text-gray-400'
                                                        }`}
                                                    >
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!row.selected}
                                                                onChange={() => toggleRowSelect(idx)}
                                                                className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-gray-500">
                                                            #{idx + 1}
                                                        </td>
                                                        <td className="p-3 font-mono font-bold text-dark">
                                                            {row.workorderNumber || '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={row.description}
                                                                onChange={(e) => handleUpdateRowField(idx, 'description', e.target.value)}
                                                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-gray-300 focus:border-neon-600 focus:bg-white rounded text-xs text-gray-800"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Select
                                                                value={row.workType}
                                                                onValueChange={(val) => handleUpdateRowField(idx, 'workType', val)}
                                                            >
                                                                <SelectTrigger className="h-7 text-xs bg-white border-gray-200">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {workTypes.map(wt => (
                                                                        <SelectItem key={wt} value={wt} className="text-xs">
                                                                            {wt}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="p-3 bg-blue-50/30">
                                                            <Select
                                                                value={row.seksi}
                                                                onValueChange={(val) => handleUpdateRowField(idx, 'seksi', val)}
                                                            >
                                                                <SelectTrigger className="h-7 text-xs bg-white border-blue-200 font-medium text-blue-900">
                                                                    <SelectValue placeholder="Pilih Seksi" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {seksiList.map(s => (
                                                                        <SelectItem key={s} value={s} className="text-xs">
                                                                            {s}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="p-3">
                                                            {row.matchedAsset ? (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-gray-800 flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                        {row.matchedAsset.assetNumber}
                                                                    </span>
                                                                    <span className="text-[11px] text-gray-500 truncate max-w-xs">
                                                                        {row.matchedAsset.equipmentName}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-medium text-gray-700">
                                                                        {row.assetNumber || '-'}
                                                                    </span>
                                                                    <span className="text-[11px] text-gray-400 truncate max-w-xs">
                                                                        {row.assetDescription || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Action Bar for Batch Create */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    <div className="text-xs text-gray-600">
                                        <span className="font-bold text-dark">{selectedCount}</span> dari {parsedRows.length} nomor WO siap diproses menjadi LOTO
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleBatchSubmit}
                                        disabled={isSubmittingBatch || selectedCount === 0}
                                        className="bg-dark hover:bg-gray-800 text-white font-bold text-sm px-6 shadow-md gap-2 w-full sm:w-auto"
                                    >
                                        {isSubmittingBatch ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin text-neon" />
                                                Memproses {selectedCount} Tiket LOTO...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 text-neon" />
                                                Buat Semua LOTO Terpilih ({selectedCount} WO)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* MODE 2: SINGLE FORM REVIEW (Switch WO rows to main form below) */}
                        {viewMode === 'single' && (
                            <div className="p-3 bg-white border rounded-xl shadow-sm">
                                <p className="text-xs text-gray-600 mb-2 font-medium">
                                    Pilih nomor baris WO untuk dimuat ke form utama di bawah:
                                </p>
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                                    {parsedRows.map((row, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectRow(idx)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                                selectedRowIndex === idx
                                                    ? 'bg-dark text-white shadow-sm ring-2 ring-neon'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span>#{idx + 1}</span>
                                            <span className="font-mono">{row.workorderNumber || 'No-WO'}</span>
                                            {row.seksi && (
                                                <span className="text-[10px] opacity-75">({row.seksi.split(' ')[0]})</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

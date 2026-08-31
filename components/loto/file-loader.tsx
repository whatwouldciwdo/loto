"use client"

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export interface LoaderParsedData {
    workorderNumber?: string
    description?: string
    workType?: string
    seksi?: string
    assetNumber?: string
    assetDescription?: string
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

    const mapWorkType = (val: string): string => {
        if (!val) return ''
        const upper = val.toUpperCase().trim()
        if (WORK_TYPE_MAP[upper]) return WORK_TYPE_MAP[upper]
        const found = workTypes.find(wt => wt.toUpperCase() === upper || wt.toUpperCase().includes(upper))
        return found || val
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

            // Try exact match on assetNumber first
            const exact = list.find((a: any) =>
                a.assetNumber?.toUpperCase() === assetNumber?.toUpperCase()
            )
            return exact || list[0]
        } catch (err) {
            console.error('Error finding asset in DB:', err)
            return null
        }
    }

    const processRow = async (row: LoaderParsedData) => {
        let matchedAsset: any = null
        if (row.assetNumber || row.assetDescription) {
            matchedAsset = await findAssetInDb(row.assetNumber || '', row.assetDescription || '')
        }
        onLoadData(row, matchedAsset)
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

        try {
            const dataBuffer = await file.arrayBuffer()
            const workbook = XLSX.read(dataBuffer, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[firstSheetName]
            const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

            if (rawRows.length === 0) {
                showToast('error', 'File Kosong', 'Tidak ditemukan data di dalam file yang diupload')
                setLoading(false)
                return
            }

            const parsed: LoaderParsedData[] = rawRows.map((r) => {
                const keys = Object.keys(r)

                const findKey = (candidates: string[]) => {
                    return keys.find(k => {
                        const clean = k.trim().toUpperCase()
                        return candidates.some(c => clean === c || clean.includes(c))
                    })
                }

                // Keys detection
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

                const rawWo = woKey ? String(r[woKey]).trim() : ''
                const rawDesc = descKey ? String(r[descKey]).trim() : ''
                const rawWorkType = workTypeKey ? String(r[workTypeKey]).trim() : ''
                const rawAsset = assetKey ? String(r[assetKey]).trim() : ''
                const rawAssetDesc = assetDescKey ? String(r[assetDescKey]).trim() : ''
                const rawSeksi = seksiKey ? String(r[seksiKey]).trim() : ''

                return {
                    workorderNumber: rawWo,
                    description: rawDesc,
                    workType: mapWorkType(rawWorkType),
                    seksi: mapSeksi(rawSeksi),
                    assetNumber: rawAsset,
                    assetDescription: rawAssetDesc,
                }
            }).filter(item => item.workorderNumber || item.description || item.assetNumber)

            if (parsed.length === 0) {
                showToast('error', 'Data Tidak Sesuai', 'Format kolom file tidak cocok dengan template loader (WO ID, DESCRIPTION, ASSET, dll.)')
                setLoading(false)
                return
            }

            setParsedRows(parsed)
            setSelectedRowIndex(0)

            // Auto-load first row
            await processRow(parsed[0])

            showToast('success', 'File Berhasil Dimuat!', `${parsed.length} data ditemukan. Form telah terisi otomatis.`)
        } catch (err: any) {
            console.error('Error parsing loader file:', err)
            showToast('error', 'Gagal Membaca File', err.message || 'Terjadi kesalahan saat membaca file')
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSelectRow = async (index: number) => {
        setSelectedRowIndex(index)
        setLoading(true)
        try {
            await processRow(parsedRows[index])
            showToast('info', 'Data Baris Dimuat', `Memuat data baris ke-${index + 1}`)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setFileName(null)
        setParsedRows([])
        setSelectedRowIndex(0)
    }

    return (
        <Card className="border-2 border-dashed border-neon-600/50 bg-gradient-to-br from-green-50/50 via-white to-gray-50 mb-6 shadow-sm">
            <CardContent className="p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neon flex items-center justify-center text-dark shadow-md shrink-0">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-dark text-base">Auto-fill dari File Loader</h3>
                                <Badge variant="outline" className="bg-neon/30 text-dark border-neon text-xs font-semibold">
                                    .XLSX / .CSV
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Upload file Excel atau CSV (seperti *Contoh Loader EVI*) untuk mengisi form secara instan
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
                            disabled={loading}
                            className="bg-neon hover:bg-neon-600 text-dark font-semibold text-sm shadow-sm gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Memproses...
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

                {fileName && parsedRows.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="font-medium">File aktif:</span>
                                <span className="font-mono bg-white px-2 py-0.5 border rounded text-gray-800">{fileName}</span>
                                <span className="text-gray-500">({parsedRows.length} baris data)</span>
                            </div>

                            {parsedRows.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Pilih baris:</span>
                                    <div className="flex gap-1 overflow-x-auto max-w-xs py-1">
                                        {parsedRows.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectRow(idx)}
                                                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                                    selectedRowIndex === idx
                                                        ? 'bg-dark text-white'
                                                        : 'bg-white border text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                #{idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

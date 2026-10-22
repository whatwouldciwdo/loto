"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { API_ROUTES } from '@/lib/constants'
import { ClipboardList, Search, Plus, Filter, TrendingUp, Clock, CheckCircle2, FileText, Trash2, Download, FileSpreadsheet, File as FileIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    // Date Filter State
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

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
        REQUEST: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
        ACTIVE: 'bg-green-100 text-green-800 border-green-300',
        CLOSE: 'bg-blue-100 text-blue-800 border-blue-300',
        CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    }

    // Filter Logic
    const filteredLotos = lotos.filter((loto) => {
        const matchesSearch =
            loto.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loto.formData.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loto.formData.operatorForm?.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loto.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())

        let matchesDate = true
        if (startDate && endDate) {
            const lotoDate = new Date(loto.createdAt)
            const start = new Date(startDate)
            const end = new Date(endDate)
            // Set end date to end of day
            end.setHours(23, 59, 59, 999)
            matchesDate = lotoDate >= start && lotoDate <= end
        }

        return matchesSearch && matchesDate
    })

    // Export to Excel with ExcelJS
    const handleExportExcel = async () => {
        try {
            const ExcelJSModule = await import('exceljs') as any
            const ExcelJS = ExcelJSModule.default || ExcelJSModule

            const FileSaverModule = await import('file-saver') as any
            const saveAs = FileSaverModule.saveAs || FileSaverModule.default?.saveAs || FileSaverModule.default

            const Workbook = ExcelJS.Workbook || ExcelJS.default?.Workbook

            const workbook = new Workbook()
            const worksheet = workbook.addWorksheet('LOTO Log')

            worksheet.columns = [
                { key: 'no', width: 5 },
                { key: 'req', width: 20 },
                { key: 'wo', width: 15 },
                { key: 'equip', width: 30 },
                { key: 'desc', width: 40 },
                { key: 'status', width: 15 },
                { key: 'creator', width: 20 },
                { key: 'date', width: 15 },
            ]

            const response = await fetch('/plnip.png')
            const buffer = await response.arrayBuffer()
            const logoId = workbook.addImage({
                buffer: buffer,
                extension: 'png',
            })

            worksheet.addImage(logoId, {
                tl: { col: 0, row: 0 },
                ext: { width: 140, height: 50 }
            })

            worksheet.mergeCells('C1:H2')
            const titleCell = worksheet.getCell('C1')
            titleCell.value = 'LOG LOTO'
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
            titleCell.font = { name: 'Arial', size: 16, bold: true }

            const formatDate = (dateStr: string) => {
                if (!dateStr) return ''
                return new Date(dateStr).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            }
            const periodText = startDate && endDate
                ? `PERIODE: ${formatDate(startDate)} - ${formatDate(endDate)}`
                : `PERIODE: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`

            worksheet.mergeCells('C3:H3')
            const periodCell = worksheet.getCell('C3')
            periodCell.value = periodText
            periodCell.alignment = { vertical: 'middle', horizontal: 'center' }
            periodCell.font = { name: 'Arial', size: 10 }

            worksheet.addRow([])

            const headerRow = worksheet.addRow([
                'No', 'Request Number', 'Work Order', 'Equipment',
                'Description', 'Status', 'Created By', 'Date'
            ])

            headerRow.eachCell((cell: any) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '000000' }
                }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            })
            headerRow.height = 25

            filteredLotos.forEach((loto, index) => {
                worksheet.addRow([
                    index + 1,
                    loto.requestNumber,
                    loto.formData.workorderNumber || '-',
                    loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A',
                    loto.formData.operatorForm?.keterangan || loto.formData.description || '-',
                    loto.status,
                    loto.createdBy.name,
                    new Date(loto.createdAt).toLocaleDateString('id-ID'),
                ])
            })

            worksheet.eachRow({ includeEmpty: false }, (row: any, rowNumber: number) => {
                if (rowNumber > 5) {
                    row.eachCell({ includeEmpty: true }, (cell: any) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
                        cell.font = { name: 'Arial', size: 9 }
                    })
                }
            })

            const buf = await workbook.xlsx.writeBuffer()
            saveAs(new Blob([buf]), `LOTO_Log_${new Date().toISOString().split('T')[0]}.xlsx`)

        } catch (error) {
            console.error('Export Error:', error)
            showToast('error', 'Export Failed', 'Gagal mengexport Excel')
        }
    }

    // Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF()
        const img = new Image()
        img.src = '/plnip.png'

        const generatePdfContent = (imgLoaded: boolean) => {
            if (imgLoaded) {
                const imgProps = doc.getImageProperties(img)
                const pdfHeight = 20
                const pdfWidth = (imgProps.width * pdfHeight) / imgProps.height
                doc.addImage(img, 'PNG', 14, 10, pdfWidth, pdfHeight)
            }

            doc.setFontSize(14)
            doc.setTextColor(50)

            const formatDate = (dateStr: string) => {
                if (!dateStr) return ''
                return new Date(dateStr).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            }

            const headerText = startDate && endDate
                ? `PERIODE: ${formatDate(startDate)} - ${formatDate(endDate)}`
                : `PERIODE: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`

            doc.text("LOG LOTO", 105, 15, { align: 'center' })
            doc.setFontSize(10)
            doc.text(headerText, 105, 22, { align: 'center' })

            doc.setDrawColor(150)
            doc.line(14, 28, 196, 28)

            const tableColumn = ["No", "Req #", "WO #", "Equipment", "Status", "Creator", "Date"]
            const tableRows: any[] = []

            filteredLotos.forEach((loto, index) => {
                const lotoData = [
                    index + 1,
                    loto.requestNumber,
                    loto.formData.workorderNumber || '-',
                    loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A',
                    loto.status,
                    loto.createdBy.name,
                    new Date(loto.createdAt).toLocaleDateString('id-ID'),
                ]
                tableRows.push(lotoData)
            })

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [0, 153, 204] },
            })

            doc.save(`LOTO_Log_${new Date().toISOString().split('T')[0]}.pdf`)
        }

        img.onload = () => generatePdfContent(true)
        img.onerror = () => generatePdfContent(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium text-sm">Memuat daftar tiket LOTO...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-down">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-dark to-gray-800 w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-neon/20">
                        <ClipboardList className="w-5 h-5 md:w-7 md:h-7 text-neon" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-extrabold text-dark tracking-tight">Daftar Tiket LOTO</h1>
                        <p className="text-xs md:text-sm text-gray-600">Seluruh permohonan lockout & tagout isolasi energi</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 text-xs md:text-sm font-semibold">
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                                Export Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                                <FileIcon className="w-4 h-4 mr-2 text-red-600" />
                                Export PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="neon" onClick={() => router.push('/loto/request')} className="whitespace-nowrap text-xs md:text-sm font-bold shadow-md">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Buat Request Baru
                    </Button>
                </div>
            </div>

            {/* Search and Date Filter Card */}
            <Card className="mb-6 animate-fade-in-up border-gray-200 shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Cari nomor request, peralatan, work order, atau pembuat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 text-sm"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-10 text-xs md:text-sm"
                                title="Tanggal Mulai"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-10 text-xs md:text-sm"
                                title="Tanggal Akhir"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stat Badges with Hover Elevation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <Card className="animate-scale-in hover-lift border-gray-200 bg-white shadow-sm">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Permintaan</p>
                            <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-dark">{lotos.length}</p>
                    </CardContent>
                </Card>
                <Card className="animate-scale-in animate-delay-100 hover-lift bg-emerald-50/70 border-emerald-200 shadow-sm">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Aktif Diisolasi</p>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-emerald-700">
                            {lotos.filter(l => l.status === 'ACTIVE').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="animate-scale-in animate-delay-200 hover-lift bg-amber-50/70 border-amber-200 shadow-sm">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Menunggu Form</p>
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-amber-700">
                            {lotos.filter(l => l.status === 'REQUEST' || l.status === 'DRAFT').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="animate-scale-in animate-delay-300 hover-lift bg-blue-50/70 border-blue-200 shadow-sm">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Selesai / Release</p>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-blue-700">
                            {lotos.filter(l => l.status === 'CLOSE').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Requests Table */}
            <Card className="animate-fade-in-up animate-delay-200 border-gray-200 shadow-sm">
                <CardHeader className="py-4 px-6 border-b bg-gray-50/60">
                    <CardTitle className="text-base font-bold text-dark">
                        Daftar Tiket ({filteredLotos.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredLotos.length === 0 ? (
                        <p className="text-center text-gray-500 py-12 text-sm">
                            Tidak ada permohonan LOTO yang sesuai dengan pencarian atau filter tanggal.
                        </p>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50/70 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            <th className="text-left py-3.5 px-4">Request #</th>
                                            <th className="text-left py-3.5 px-4">Work Order</th>
                                            <th className="text-left py-3.5 px-4">Equipment</th>
                                            <th className="text-left py-3.5 px-4">Keterangan</th>
                                            <th className="text-left py-3.5 px-4">Status</th>
                                            <th className="text-left py-3.5 px-4">Dibuat Oleh</th>
                                            <th className="text-left py-3.5 px-4">Tanggal</th>
                                            <th className="text-right py-3.5 px-4">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLotos.map((loto) => (
                                            <tr key={loto.id} className="hover:bg-neon/10 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold text-dark">
                                                    <Link
                                                        href={`/loto/${loto.id}`}
                                                        className="hover:text-neon-700 hover:underline"
                                                    >
                                                        {loto.requestNumber}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-xs font-mono text-gray-700">
                                                    {loto.formData.workorderNumber || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-gray-900 text-xs">{loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A'}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{loto.formData.operatorForm?.unit || loto.formData.unit || 'CLG'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-xs text-gray-600 max-w-xs line-clamp-1">
                                                        {loto.formData.operatorForm?.keterangan || loto.formData.description || '-'}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${statusColors[loto.status] || 'bg-gray-100 text-gray-800'} text-[11px] font-bold`}>
                                                        {loto.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-xs font-medium text-gray-800">
                                                    {loto.createdBy.name}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                                                    {new Date(loto.createdAt).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/loto/${loto.id}`)}
                                                            className="h-8 px-2.5 text-xs font-medium"
                                                        >
                                                            Lihat
                                                        </Button>
                                                        {canDelete && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(loto.id, loto.requestNumber)}
                                                                className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                title="Hapus Tiket"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {filteredLotos.map((loto) => (
                                    <div
                                        key={loto.id}
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                        onClick={() => router.push(`/loto/${loto.id}`)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-bold text-dark text-sm font-mono">{loto.requestNumber}</p>
                                            <Badge className={statusColors[loto.status] + ' text-xs'}>
                                                {loto.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <div className="mb-1.5 flex items-center justify-between text-xs">
                                            <span className="text-gray-400">WO: <span className="font-mono text-gray-700 font-semibold">{loto.formData.workorderNumber || '-'}</span></span>
                                            <span className="text-gray-400">{new Date(loto.createdAt).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 mb-1">
                                            {loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 line-clamp-1">
                                            {loto.formData.operatorForm?.keterangan || loto.formData.description || '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

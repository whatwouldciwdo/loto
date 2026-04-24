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
        REQUEST: 'bg-yellow-100 text-yellow-800',
        DRAFT: 'bg-gray-100 text-gray-800',
        ACTIVE: 'bg-green-100 text-green-800',
        CLOSE: 'bg-blue-100 text-blue-800',
        CANCELLED: 'bg-red-100 text-red-800',
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
            // Dynamically import libraries to avoid SSR issues
            const ExcelJSModule = await import('exceljs') as any
            const ExcelJS = ExcelJSModule.default || ExcelJSModule

            const FileSaverModule = await import('file-saver') as any
            const saveAs = FileSaverModule.saveAs || FileSaverModule.default?.saveAs || FileSaverModule.default

            // Helper to get Workbook constructor
            const Workbook = ExcelJS.Workbook || ExcelJS.default?.Workbook

            const workbook = new Workbook()
            const worksheet = workbook.addWorksheet('LOTO Log')

            // --- 1. SETUP COLUMNS ---
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

            // --- 2. ADD LOGO (Top Left) ---
            // Fetch the image
            const response = await fetch('/plnip.png')
            const buffer = await response.arrayBuffer()
            const logoId = workbook.addImage({
                buffer: buffer,
                extension: 'png',
            })

            // Add image to worksheet (A1:B3 range approx)
            worksheet.addImage(logoId, {
                tl: { col: 0, row: 0 },
                ext: { width: 140, height: 50 } // Adjust size as needed
            })

            // --- 3. HEADER TEXT ---
            // Title "LOG LOTO" (Centered across columns C-H)
            worksheet.mergeCells('C1:H2')
            const titleCell = worksheet.getCell('C1')
            titleCell.value = 'LOG LOTO'
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
            titleCell.font = { name: 'Arial', size: 16, bold: true }

            // Period Text (Centered across columns C-H, below title)
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

            // Add some spacing row
            worksheet.addRow([])

            // --- 4. TABLE HEADERS ---
            const headerRow = worksheet.addRow([
                'No', 'Request Number', 'Work Order', 'Equipment',
                'Description', 'Status', 'Created By', 'Date'
            ])

            // Style header row
            headerRow.eachCell((cell: any) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '000000' } // Dark background
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

            // --- 5. DATA ROWS ---
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

            // Format data cells
            worksheet.eachRow({ includeEmpty: false }, (row: any, rowNumber: number) => {
                if (rowNumber > 5) { // Data starts after header row (row 5)
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

            // --- 6. GENERATE & SAVE ---
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

        // Add Header Image
        const img = new Image()
        img.src = '/plnip.png'

        const generatePdfContent = (imgLoaded: boolean) => {
            // Logo (Top Left)
            if (imgLoaded) {
                // Calculate aspect ratio to fit within 35x12 box while maintaining proportions
                const imgProps = doc.getImageProperties(img)
                const pdfHeight = 20
                const pdfWidth = (imgProps.width * pdfHeight) / imgProps.height

                doc.addImage(img, 'PNG', 14, 10, pdfWidth, pdfHeight)
            }

            // Header Text (Centered/Right)
            doc.setFontSize(14)
            doc.setTextColor(50) // Darker text

            // Format dates for display
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

            // Line separator
            doc.setDrawColor(150)
            doc.line(14, 28, 196, 28)

            // Table
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
                headStyles: { fillColor: [0, 153, 204] }, // PLN Blue-ish
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
                    <p className="text-gray-600">Loading LOTO requests...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in-down">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-dark to-gray-800 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                        <ClipboardList className="w-5 h-5 md:w-7 md:h-7 text-neon" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-dark">LOTO Requests</h1>
                        <p className="text-sm text-gray-600">All lockout/tagout requests</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Export Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                                <FileIcon className="w-4 h-4 mr-2" />
                                Export PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="neon" onClick={() => router.push('/loto/request')} className="whitespace-nowrap">
                        <Plus className="w-4 h-4 mr-2" />
                        New Request
                    </Button>
                </div>
            </div>

            <Card className="mb-6 animate-fade-in-up">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search by request number, equipment, or creator..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <Card className="animate-scale-in">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-dark">{lotos.length}</p>
                    </CardContent>
                </Card>
                <Card className="animate-scale-in animate-delay-100">
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
                <Card className="animate-scale-in animate-delay-200">
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
                <Card className="animate-scale-in animate-delay-300">
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

            <Card className="animate-fade-in-up animate-delay-200">
                <CardHeader>
                    <CardTitle>Requests ({filteredLotos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredLotos.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No LOTO requests found
                        </p>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-100">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Request #</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Work Order</th>
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
                                                <td className="py-3 px-4 text-sm font-mono">
                                                    {loto.formData.workorderNumber || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium">{loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{loto.formData.operatorForm?.unit || loto.formData.unit || 'CLG'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700 max-w-md line-clamp-2">
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

                            <div className="md:hidden space-y-3">
                                {filteredLotos.map((loto) => (
                                    <div
                                        key={loto.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        onClick={() => router.push(`/loto/${loto.id}`)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-dark text-sm">{loto.requestNumber}</p>
                                            <Badge className={statusColors[loto.status] + ' text-xs'}>
                                                {loto.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500">Work Order</p>
                                            <p className="font-mono text-sm">{loto.formData.workorderNumber || '-'}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mb-1">
                                            {loto.formData.operatorForm?.equipmentName || loto.formData.equipmentName || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                            {loto.formData.operatorForm?.keterangan || loto.formData.description || '-'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{loto.createdBy.name}</span>
                                            <span>{new Date(loto.createdAt).toLocaleDateString('id-ID')}</span>
                                        </div>
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

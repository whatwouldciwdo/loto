"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PrintTag from '@/components/print-tag'
import { API_ROUTES } from '@/lib/constants'

interface LotoData {
    requestNumber: string
    formData: any
}

export default function PrintTagPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loto, setLoto] = useState<LotoData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLotoDetail()
    }, [params.id])

    const fetchLotoDetail = async () => {
        try {
            const response = await fetch(`${API_ROUTES.LOTO.BASE}/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setLoto(data.data)
        } catch (err) {
            console.error('Failed to fetch LOTO:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#666' }}>Loading tag...</p>
            </div>
        )
    }

    if (!loto) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#DC2626' }}>LOTO request not found</p>
            </div>
        )
    }

    const workDescription =
        loto.formData?.operatorForm?.descriptionPekerjaan ||
        loto.formData?.operatorForm?.deskripsiPekerjaan ||
        loto.formData?.description ||
        '-'

    return (
        <>
            <div className="no-print" style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button variant="outline" onClick={() => router.back()}>
                        ← Back
                    </Button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Print LOTO Tag</h1>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{loto.requestNumber}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>Ukuran: 7.5cm × 11cm</p>
                    <Button
                        onClick={handlePrint}
                        style={{
                            backgroundColor: '#DC2626',
                            color: 'white',
                            padding: '10px 24px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                        size="lg"
                    >
                        🖨️ Print Tag
                    </Button>
                </div>
            </div>

            <PrintTag
                lotoNumber={loto.requestNumber}
                workDescription={workDescription}
            />

            <style jsx global>{`
                @media print {
                    .no-print,
                    nav, header, aside, footer,
                    .sidebar,
                    [class*="sidebar"],
                    [class*="Sidebar"] {
                        display: none !important;
                    }
                    main {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    )
}

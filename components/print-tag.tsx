"use client"

interface PrintTagProps {
    lotoNumber: string
    workDescription: string
}

export default function PrintTag({ lotoNumber, workDescription }: PrintTagProps) {
    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: 7.5cm 11cm;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .loto-tag, .loto-tag * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    .loto-tag {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 7.5cm !important;
                        height: 11cm !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    .print-tag-wrapper {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="print-tag-wrapper" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f3f4f6',
                padding: '20px',
            }}>
                <div className="loto-tag" style={{
                    width: '7.5cm',
                    height: '11cm',
                    backgroundColor: '#CC0000',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 8px 4px 8px',
                        gap: '6px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: '#FCD34D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/Logo_PLN.png"
                                alt="PLN"
                                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                            />
                        </div>

                        <div style={{
                            flex: 1,
                            backgroundColor: 'white',
                            border: '1.5px solid #999',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            textAlign: 'center',
                        }}>
                            <div style={{
                                fontSize: '7px',
                                fontWeight: 'bold',
                                color: '#555',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                marginBottom: '1px',
                            }}>NOMOR LOTO</div>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: '900',
                                color: '#000',
                                letterSpacing: '0.5px',
                            }}>{lotoNumber}</div>
                        </div>

                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            backgroundColor: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M2 12h20" />
                            </svg>
                        </div>
                    </div>

                    <div style={{
                        margin: '0 8px 6px 8px',
                        backgroundColor: 'white',
                        border: '1.5px solid #999',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '7px',
                            fontWeight: 'bold',
                            color: '#333',
                            letterSpacing: '0.8px',
                        }}>PT PLN INDONESIA POWER CILEGON</div>
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        gap: '4px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}>
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#FBBF24" stroke="#92400E" strokeWidth="0.5" />
                                <line x1="12" y1="9" x2="12" y2="13" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="16" r="1" fill="#92400E" />
                            </svg>
                            <span style={{
                                fontSize: '32px',
                                fontWeight: '900',
                                color: 'white',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                letterSpacing: '3px',
                            }}>BAHAYA</span>
                        </div>

                        <div style={{
                            width: '72px',
                            height: '72px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '4px 0',
                        }}>
                            <img
                                src="/warning.jpg"
                                alt="Warning"
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>

                        <div style={{
                            fontSize: '20px',
                            fontWeight: '900',
                            color: 'white',
                            textAlign: 'center',
                            lineHeight: '1.2',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                            letterSpacing: '1.5px',
                        }}>
                            DILARANG<br />DIOPERASIKAN
                        </div>
                    </div>

                    <div style={{
                        margin: '4px 8px',
                        backgroundColor: 'white',
                        border: '1.5px solid #999',
                        borderRadius: '4px',
                        padding: '5px 8px',
                        textAlign: 'center',
                        minHeight: '32px',
                    }}>
                        <div style={{
                            fontSize: '6px',
                            fontWeight: 'bold',
                            color: '#888',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: '2px',
                        }}>DESKRIPSI PEKERJAAN</div>
                        <div style={{
                            fontSize: '8px',
                            fontWeight: '700',
                            color: '#333',
                            lineHeight: '1.3',
                            wordBreak: 'break-word',
                            maxHeight: '30px',
                            overflow: 'hidden',
                        }}>{workDescription || '-'}</div>
                    </div>

                    <div style={{
                        backgroundColor: '#FCD34D',
                        padding: '8px 12px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: '900',
                            color: '#CC0000',
                            lineHeight: '1.4',
                            letterSpacing: '0.3px',
                        }}>
                            TANDA INI HANYA BOLEH<br />
                            DILEPAS<br />
                            OLEH K3 / OPERATOR
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

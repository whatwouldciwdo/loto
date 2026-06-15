
import { getPhoneNumber } from '@/lib/whatsapp-config'

interface MessageData {
    to: string
    message: string
}

export class WhatsappService {
    private static API_URL = process.env.WHATSAPP_API_URL
    private static API_KEY = process.env.WHATSAPP_API_KEY

    /**
     * Kirim pesan WhatsApp via Wuzapi
     * Format nomor: internasional tanpa + (contoh: 628123456789)
     */
    static async send(to: string, message: string): Promise<any> {
        if (!to || !message) {
            console.warn('WhatsappService: Missing recipient or message')
            return
        }

        if (!this.API_KEY) {
            console.warn('WhatsappService: WHATSAPP_API_KEY not configured')
            return
        }

        try {
            const phone = to.replace(/^\+/, '')

            const { URL } = await import('url')
            const apiUrl = new URL(`${this.API_URL}/chat/send/text`)
            const isHttps = apiUrl.protocol === 'https:'

            const postData = JSON.stringify({
                Phone: phone,
                Body: message,
            })

            const options: any = {
                hostname: apiUrl.hostname,
                port: apiUrl.port || (isHttps ? 443 : 80),
                path: apiUrl.pathname,
                method: 'POST',
                headers: {
                    'Token': this.API_KEY,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }

            if (isHttps) {
                options.rejectUnauthorized = false
            }

            return new Promise((resolve, reject) => {
                const httpModule = isHttps
                    ? import('https').then(m => m.default)
                    : import('http').then(m => m.default)

                httpModule.then(http => {
                    const req = http.request(options, (res) => {
                        let data = ''

                        res.on('data', (chunk) => {
                            data += chunk
                        })

                        res.on('end', () => {
                            try {
                                const result = JSON.parse(data)
                                resolve(result)
                            } catch {
                                resolve({ raw: data })
                            }
                        })
                    })

                    req.on('error', (error) => {
                        console.error('WhatsappService Error:', error)
                        reject(error)
                    })

                    req.write(postData)
                    req.end()
                })
            })

        } catch (error) {
            console.error('WhatsappService Error:', error)
            throw error
        }
    }

    /**
     * Notifikasi LOTO Request baru dibuat
     */
    static async notifyNewRequest(
        requestNumber: string,
        description: string,
        workType: string,
        seksiTujuan: string,
        creatorName: string,
        creatorPhone?: string | null
    ) {
        if (creatorPhone) {
            const creatorMsg = `*LOTO REQUEST BERHASIL DIBUAT* ✅
        
No. Request: ${requestNumber}
Tipe Pekerjaan: ${workType}
Deskripsi: ${description}
Tujuan: ${seksiTujuan}

Request Anda telah berhasil dibuat dan dikirim ke seksi terkait.
`
            await this.send(creatorPhone, creatorMsg)
        }

        const phone = getPhoneNumber(seksiTujuan)
        if (!phone) return

        const message = `*NEW LOTO REQUEST*
        
No. Request: ${requestNumber}
Tipe Pekerjaan: ${workType}
Deskripsi: ${description}
Dibuat Oleh: ${creatorName}
Tujuan: ${seksiTujuan}

Mohon segera diproses.
`
        await this.send(phone, message)
    }

    /**
     * Notifikasi eksekusi LOTO (CAT.03)
     */
    static async notifyExecution(data: {
        requestNumber: string,
        workOrder: string,
        status: string,
        type: string,
        seksi: string,
        description: string,
        equipment: string,
        peralatan: string,
        eksekusi: string,
        eksekutor: string,
        assetNumber: string,
        creatorPhone?: string | null
    }) {
        const msg = `*LOTO EXECUTION REPORT*

No. Request: ${data.requestNumber}
Work Order: ${data.workOrder}
Status: ${data.status}
Type: ${data.type}
Seksi: ${data.seksi}
Asset: ${data.equipment} (${data.assetNumber})
Peralatan: ${data.peralatan}
Posisi: ${data.eksekusi}
Eksekutor: ${data.eksekutor}

Ket: ${data.description}
`
        if (data.creatorPhone) {
            await this.send(data.creatorPhone, msg)
        }

        const eksekutorPhone = getPhoneNumber(data.eksekutor)
        if (eksekutorPhone) {
            await this.send(eksekutorPhone, msg)
        }

        const seksiPhone = getPhoneNumber(data.seksi)
        if (seksiPhone) {
            await this.send(seksiPhone, msg)
        }
    }

    /**
     * Notifikasi release LOTO (CAT.06)
     */
    static async notifyRelease(data: {
        requestNumber: string,
        workOrder: string,
        status: string,
        description: string,
        equipment: string,
        eksekutorRelease: string,
        keteranganRelease: string,
        creatorPhone?: string | null,
        seksiHar: string
    }) {
        const msg = `*LOTO RELEASE REPORT*

No. Request: ${data.requestNumber}
Work Order: ${data.workOrder}
Status: ${data.status} (CLOSED)
Asset: ${data.equipment}
Eksekutor Release: ${data.eksekutorRelease}
Ket. Release: ${data.keteranganRelease}

LOTO telah dicabut dan normalisasi selesai.
`
        if (data.creatorPhone) {
            await this.send(data.creatorPhone, msg)
        }

        const eksekutorPhone = getPhoneNumber(data.eksekutorRelease)
        if (eksekutorPhone) {
            await this.send(eksekutorPhone, msg)
        }

        const seksiPhone = getPhoneNumber(data.seksiHar)
        if (seksiPhone) {
            await this.send(seksiPhone, msg)
        }
    }
}

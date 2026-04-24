
import { getPhoneNumber } from '@/lib/whatsapp-config'

interface MessageData {
    to: string
    message: string
}

export class WhatsappService {
    private static API_URL = process.env.WHATSAPP_API_URL || 'https://wuzapi-tceo8mb6myiz.sgp-wisanggeni.sumopod.my.id'
    private static API_KEY = process.env.WHATSAPP_API_KEY || 'Jp0hfP9l2RwRzMSVY1I1f7wIr7?3b4m0'

    /**
     * Send WhatsApp message via Wuzapi
     * Wuzapi expects phone numbers in international format without + (e.g., 628123456789)
     */
    static async send(to: string, message: string): Promise<any> {
        if (!to || !message) {
            console.warn('WhatsappService: Missing recipient or message')
            return
        }

        // Ensure token is configured
        if (!this.API_KEY) {
            console.warn('WhatsappService: WHATSAPP_API_KEY not configured')
            return
        }

        try {
            // Format phone number: remove '+' and ensure it starts with country code   
            const phone = to.replace(/^\+/, '')

            // Determine if using HTTP or HTTPS
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

            // Only add SSL config for HTTPS
            if (isHttps) {
                options.rejectUnauthorized = false
            }

            return new Promise((resolve, reject) => {
                // Use http or https module based on protocol
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
                                console.log('WhatsappService Result:', result)
                                resolve(result)
                            } catch (err) {
                                console.log('WhatsappService Response (raw):', data)
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
     * Send notification for New LOTO Request
     */
    static async notifyNewRequest(
        requestNumber: string,
        description: string,
        workType: string,
        seksiTujuan: string,
        creatorName: string,
        creatorPhone?: string | null
    ) {
        console.log('[WhatsappService] notifyNewRequest called')
        console.log('[WhatsappService] Seksi Tujuan:', seksiTujuan)
        console.log('[WhatsappService] Creator Phone:', creatorPhone)

        // 1. Notify Creator (confirmation)
        if (creatorPhone) {
            const creatorMsg = `*LOTO REQUEST BERHASIL DIBUAT* ✅
        
No. Request: ${requestNumber}
Tipe Pekerjaan: ${workType}
Deskripsi: ${description}
Tujuan: ${seksiTujuan}

Request Anda telah berhasil dibuat dan dikirim ke seksi terkait.
`
            console.log('[WhatsappService] Sending confirmation to creator:', creatorPhone)
            await this.send(creatorPhone, creatorMsg)
        }

        // 2. Notify Seksi Tujuan
        const phone = getPhoneNumber(seksiTujuan)
        console.log('[WhatsappService] Phone number found for seksi:', phone)

        if (!phone) {
            console.log(`[WhatsappService] ❌ No phone number found for seksi: ${seksiTujuan}`)
            return
        }

        const message = `*NEW LOTO REQUEST*
        
No. Request: ${requestNumber}
Tipe Pekerjaan: ${workType}
Deskripsi: ${description}
Dibuat Oleh: ${creatorName}
Tujuan: ${seksiTujuan}

Mohon segera diproses.
`
        console.log('[WhatsappService] Sending message to seksi:', phone)
        await this.send(phone, message)
    }

    /**
     * Send notification for Operator Execution
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
        console.log('[WhatsappService] notifyExecution payload:', JSON.stringify(data, null, 2))
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
        // 1. Notify Creator
        if (data.creatorPhone) {
            await this.send(data.creatorPhone, msg)
        }

        // 2. Notify Eksekutor (Team Leader)
        const eksekutorPhone = getPhoneNumber(data.eksekutor)
        if (eksekutorPhone) {
            await this.send(eksekutorPhone, msg)
        }

        // 3. Notify Seksi Har
        const seksiPhone = getPhoneNumber(data.seksi)
        if (seksiPhone) {
            await this.send(seksiPhone, msg)
        }
    }

    /**
     * Send notification for LOTO Release
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
        console.log('[WhatsappService] notifyRelease payload:', JSON.stringify(data, null, 2))
        const msg = `*LOTO RELEASE REPORT*

No. Request: ${data.requestNumber}
Work Order: ${data.workOrder}
Status: ${data.status} (CLOSED)
Asset: ${data.equipment}
Eksekutor Release: ${data.eksekutorRelease}
Ket. Release: ${data.keteranganRelease}

LOTO telah dicabut dan normalisasi selesai.
`
        // 1. Notify Creator
        if (data.creatorPhone) {
            await this.send(data.creatorPhone, msg)
        }

        // 2. Notify Eksekutor Release (Team Leader)
        const eksekutorPhone = getPhoneNumber(data.eksekutorRelease)
        if (eksekutorPhone) {
            await this.send(eksekutorPhone, msg)
        }

        // 3. Notify Seksi Har
        const seksiPhone = getPhoneNumber(data.seksiHar)
        if (seksiPhone) {
            await this.send(seksiPhone, msg)
        }
    }
}

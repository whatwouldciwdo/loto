import { getPhoneNumber, normalizePhoneNumber } from '@/lib/whatsapp-config'

/**
 * WhatsApp integration via WAHA (WhatsApp HTTP API)
 * Dashboard: http://10.8.140.67:3010/dashboard/
 *
 * WAHA send-text contract:
 *   POST {WAHA_API_URL}/api/sendText
 *   Headers: { 'X-Api-Key': <key>, 'Content-Type': 'application/json' }
 *   Body:    { session, chatId: '628xxxxxxxxxx@c.us', text }
 */
export class WhatsappService {
    private static getApiUrl() {
        return (process.env.WHATSAPP_API_URL || 'http://10.8.140.67:3010').replace(/\/+$/, '')
    }

    private static getApiKey() {
        return process.env.WHATSAPP_API_KEY || ''
    }

    private static getSession() {
        return process.env.WHATSAPP_SESSION || 'LOTO'
    }

    /**
     * Convert an international phone number (e.g. 628123456789) to a WAHA chatId.
     */
    private static toChatId(phone: string): string {
        const digits = normalizePhoneNumber(phone)
        return `${digits}@c.us`
    }

    /**
     * Send a WhatsApp message via WAHA.
     * Phone numbers must be in international format without '+' (e.g., 628123456789).
     */
    static async send(to: string, message: string): Promise<any> {
        if (!to || !message) {
            console.warn('[WhatsappService] Missing recipient or message')
            return
        }

        const chatId = this.toChatId(to)
        const endpoint = `${this.getApiUrl()}/api/sendText`
        const apiKey = this.getApiKey()
        const session = this.getSession()

        const payload = {
            session,
            chatId,
            text: message,
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        if (apiKey) {
            headers['X-Api-Key'] = apiKey
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            })

            const raw = await res.text()
            let result: any
            try {
                result = JSON.parse(raw)
            } catch {
                result = { raw }
            }

            if (!res.ok) {
                console.error(`[WhatsappService] WAHA responded ${res.status}:`, result)
            }

            return result
        } catch (error) {
            console.error('[WhatsappService] Error:', error)
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
        // 1. Notify Creator (confirmation)
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

        // 2. Notify Seksi Tujuan
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

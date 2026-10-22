import { getPhoneNumberAsync, getK3PhoneNumbers, normalizePhoneNumber } from '@/lib/whatsapp-config'

interface QueueItem {
    to: string
    message: string
    resolve: (val: any) => void
    reject: (err: any) => void
    attempt: number
}

/**
 * WhatsApp integration via WAHA (WhatsApp HTTP API) with:
 *  - Asynchronous FIFO Queue
 *  - Rate limiting & anti-ban humanized delays (3-6s random jitter)
 *  - Batch message consolidation (aggregates multiple WOs per Seksi to prevent spam burst)
 *  - Dynamic contacts from DB with K3 broadcast support
 */
export class WhatsappService {
    private static queue: QueueItem[] = []
    private static isProcessing = false

    private static getApiUrl() {
        return (process.env.WHATSAPP_API_URL || 'http://10.8.140.67:3010').replace(/\/+$/, '')
    }

    private static getApiKey() {
        return process.env.WHATSAPP_API_KEY || ''
    }

    private static getSession() {
        return process.env.WHATSAPP_SESSION || 'LOTO'
    }

    private static getMinDelay(): number {
        return parseInt(process.env.WHATSAPP_DELAY_MIN_MS || '3500', 10)
    }

    private static getMaxDelay(): number {
        return parseInt(process.env.WHATSAPP_DELAY_MAX_MS || '6500', 10)
    }

    /**
     * Sleep with human-like jitter
     */
    private static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private static getRandomDelay(): number {
        const min = this.getMinDelay()
        const max = this.getMaxDelay()
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    /**
     * Convert an international phone number (e.g. 628123456789) to a WAHA chatId.
     */
    private static toChatId(phone: string): string {
        const digits = normalizePhoneNumber(phone)
        return `${digits}@c.us`
    }

    /**
     * Internal direct send to WAHA HTTP API
     */
    private static async directSend(to: string, message: string): Promise<any> {
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
            throw new Error(result.message || `WAHA error status ${res.status}`)
        }

        return result
    }

    /**
     * Process FIFO Queue with rate-limiting & delays
     */
    private static async processQueue() {
        if (this.isProcessing) return
        this.isProcessing = true

        while (this.queue.length > 0) {
            const item = this.queue.shift()
            if (!item) break

            try {
                const result = await this.directSend(item.to, item.message)
                item.resolve(result)
            } catch (err: any) {
                console.error(`[WhatsappService Queue] Error sending to ${item.to}:`, err.message)
                if (item.attempt < 2) {
                    // Retry once after backoff delay
                    item.attempt++
                    this.queue.push(item)
                } else {
                    item.reject(err)
                }
            }

            // Apply anti-ban jitter delay if more messages are in queue
            if (this.queue.length > 0) {
                const delayMs = this.getRandomDelay()
                await this.sleep(delayMs)
            }
        }

        this.isProcessing = false
    }

    /**
     * Send a WhatsApp message safely via Queue.
     */
    static async send(to: string, message: string): Promise<any> {
        if (!to || !message) {
            console.warn('[WhatsappService] Missing recipient or message')
            return
        }

        return new Promise((resolve, reject) => {
            this.queue.push({
                to,
                message,
                resolve,
                reject,
                attempt: 1,
            })
            this.processQueue().catch(err => {
                console.error('[WhatsappService] processQueue loop error:', err)
            })
        })
    }

    /**
     * Send notification for a single New LOTO Request
     */
    static async notifyNewRequest(
        requestNumber: string,
        description: string,
        workType: string,
        seksiTujuan: string,
        creatorName: string,
        creatorPhone?: string | null
    ) {
        const sentNumbers = new Set<string>()

        // 1. Notify Creator (confirmation)
        if (creatorPhone) {
            const normCreator = normalizePhoneNumber(creatorPhone)
            sentNumbers.add(normCreator)
            const creatorMsg = `*LOTO REQUEST BERHASIL DIBUAT* ✅\n\nNo. Request: ${requestNumber}\nTipe Pekerjaan: ${workType}\nDeskripsi: ${description}\nTujuan: ${seksiTujuan}\n\nRequest Anda telah berhasil dibuat dan diteruskan ke seksi terkait.`
            this.send(normCreator, creatorMsg).catch(() => {})
        }

        // 2. Notify Seksi Tujuan
        const phone = await getPhoneNumberAsync(seksiTujuan)
        if (phone && !sentNumbers.has(phone)) {
            sentNumbers.add(phone)
            const message = `*NEW LOTO REQUEST* 📋\n\nNo. Request: ${requestNumber}\nTipe Pekerjaan: ${workType}\nDeskripsi: ${description}\nDibuat Oleh: ${creatorName}\nTujuan: ${seksiTujuan}\n\nMohon segera diproses.`
            this.send(phone, message).catch(() => {})
        }

        // 3. Notify Kru K3
        const k3Phones = await getK3PhoneNumbers()
        const k3Message = `*[K3 INFO] NEW LOTO REQUEST* 📋\n\nNo. Request: ${requestNumber}\nTipe: ${workType}\nDeskripsi: ${description}\nDibuat Oleh: ${creatorName}\nTujuan Seksi: ${seksiTujuan}\n\nHarap dimonitor sesuai prosedur K3.`
        for (const k3Phone of k3Phones) {
            if (!sentNumbers.has(k3Phone)) {
                sentNumbers.add(k3Phone)
                this.send(k3Phone, k3Message).catch(() => {})
            }
        }
    }

    /**
     * Send consolidated BATCH notification (Anti-spam / Anti-ban)
     * Groups multiple WOs into single summary messages per Seksi.
     */
    static async notifyBatchRequests(data: {
        creatorName: string
        creatorPhone?: string | null
        items: Array<{
            requestNumber: string
            workorderNumber: string
            description: string
            workType: string
            seksi: string
        }>
    }) {
        const { creatorName, creatorPhone, items } = data
        if (!items || items.length === 0) return

        const sentNumbers = new Set<string>()

        // 1. Group items by Seksi
        const seksiGroups: Record<string, typeof items> = {}
        for (const it of items) {
            const s = it.seksi || 'UMUM'
            if (!seksiGroups[s]) seksiGroups[s] = []
            seksiGroups[s].push(it)
        }

        // 2. Send 1 consolidated message per Seksi PIC
        for (const [seksi, woList] of Object.entries(seksiGroups)) {
            const phone = await getPhoneNumberAsync(seksi)
            if (!phone || sentNumbers.has(phone)) continue
            sentNumbers.add(phone)

            let msg = `*NEW BATCH LOTO REQUEST* 📋 (${woList.length} Pekerjaan)\n\n`
            msg += `Seksi Tujuan: *${seksi}*\n`
            msg += `Dibuat Oleh: ${creatorName}\n\n`
            msg += `*Daftar Pekerjaan:*\n`

            woList.forEach((wo, idx) => {
                const desc = wo.description ? (wo.description.length > 50 ? wo.description.substring(0, 47) + '...' : wo.description) : '-'
                msg += `${idx + 1}. *${wo.requestNumber}* (WO: ${wo.workorderNumber || '-'})\n   _${desc}_\n`
            })

            msg += `\nMohon segera ditindaklanjuti pada sistem LOTO.`
            this.send(phone, msg).catch(() => {})
        }

        // 3. Send 1 consolidated confirmation to Creator
        if (creatorPhone) {
            const normCreator = normalizePhoneNumber(creatorPhone)
            if (!sentNumbers.has(normCreator)) {
                sentNumbers.add(normCreator)
                let creatorMsg = `*BATCH LOTO REQUEST BERHASIL DIBUAT* ✅ (${items.length} Tiket)\n\n`
                creatorMsg += `Total: *${items.length} Pekerjaan*\n`
                creatorMsg += `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n`
                creatorMsg += `Seluruh request telah diteruskan ke masing-masing seksi terkait.`
                this.send(normCreator, creatorMsg).catch(() => {})
            }
        }

        // 4. Send consolidated notification to Kru K3
        const k3Phones = await getK3PhoneNumbers()
        if (k3Phones.length > 0) {
            let k3Msg = `*[K3 INFO] NEW BATCH LOTO REQUEST* 📋 (${items.length} Tiket)\n\n`
            k3Msg += `Dibuat Oleh: *${creatorName}*\n`
            k3Msg += `Total Pekerjaan: *${items.length}*\n\n`
            k3Msg += `*Ringkasan Tiket:*\n`
            items.slice(0, 10).forEach((it, idx) => {
                k3Msg += `${idx + 1}. *${it.requestNumber}* [${it.seksi || '-'}] ${it.description ? it.description.substring(0, 40) : '-'}\n`
            })
            if (items.length > 10) {
                k3Msg += `...dan ${items.length - 10} tiket lainnya.\n`
            }
            k3Msg += `\nHarap dimonitor dan dikoordinasikan sesuai prosedur K3.`

            for (const k3Phone of k3Phones) {
                if (!sentNumbers.has(k3Phone)) {
                    sentNumbers.add(k3Phone)
                    this.send(k3Phone, k3Msg).catch(() => {})
                }
            }
        }
    }

    /**
     * Send notification for Operator Execution
     */
    static async notifyExecution(data: {
        requestNumber: string
        workOrder: string
        status: string
        type: string
        seksi: string
        description: string
        equipment: string
        peralatan: string
        eksekusi: string
        eksekutor: string
        assetNumber: string
        creatorPhone?: string | null
    }) {
        const msg = `*LOTO EXECUTION REPORT* ⚡\n\nNo. Request: ${data.requestNumber}\nWork Order: ${data.workOrder}\nStatus: ${data.status}\nType: ${data.type}\nSeksi: ${data.seksi}\nAsset: ${data.equipment} (${data.assetNumber})\nPeralatan: ${data.peralatan}\nPosisi: ${data.eksekusi}\nEksekutor: ${data.eksekutor}\n\nKet: ${data.description}\n`
        const sentNumbers = new Set<string>()

        // 1. Notify Creator
        if (data.creatorPhone) {
            const normCreator = normalizePhoneNumber(data.creatorPhone)
            sentNumbers.add(normCreator)
            this.send(normCreator, msg).catch(() => {})
        }

        // 2. Notify Eksekutor (Team Leader)
        const eksekutorPhone = await getPhoneNumberAsync(data.eksekutor)
        if (eksekutorPhone && !sentNumbers.has(eksekutorPhone)) {
            sentNumbers.add(eksekutorPhone)
            this.send(eksekutorPhone, msg).catch(() => {})
        }

        // 3. Notify Seksi Har
        const seksiPhone = await getPhoneNumberAsync(data.seksi)
        if (seksiPhone && !sentNumbers.has(seksiPhone)) {
            sentNumbers.add(seksiPhone)
            this.send(seksiPhone, msg).catch(() => {})
        }

        // 4. Notify Kru K3
        const k3Phones = await getK3PhoneNumbers()
        const k3Msg = `*[K3 INFO] LOTO TELAH DIEKSEKUSI* ⚡\n\nNo. Request: ${data.requestNumber}\nWork Order: ${data.workOrder}\nAsset: ${data.equipment} (${data.assetNumber})\nPeralatan: ${data.peralatan}\nPosisi Isolasi: ${data.eksekusi}\nEksekutor: ${data.eksekutor}\nSeksi: ${data.seksi}\n\nStatus: *TAGGED & LOCKED*\n`
        for (const k3Phone of k3Phones) {
            if (!sentNumbers.has(k3Phone)) {
                sentNumbers.add(k3Phone)
                this.send(k3Phone, k3Msg).catch(() => {})
            }
        }
    }

    /**
     * Send notification for LOTO Release
     */
    static async notifyRelease(data: {
        requestNumber: string
        workOrder: string
        status: string
        description: string
        equipment: string
        eksekutorRelease: string
        keteranganRelease: string
        creatorPhone?: string | null
        seksiHar: string
    }) {
        const msg = `*LOTO RELEASE REPORT* 🔓\n\nNo. Request: ${data.requestNumber}\nWork Order: ${data.workOrder}\nStatus: ${data.status} (CLOSED)\nAsset: ${data.equipment}\nEksekutor Release: ${data.eksekutorRelease}\nKet. Release: ${data.keteranganRelease}\n\nLOTO telah dicabut dan normalisasi selesai.\n`
        const sentNumbers = new Set<string>()

        // 1. Notify Creator
        if (data.creatorPhone) {
            const normCreator = normalizePhoneNumber(data.creatorPhone)
            sentNumbers.add(normCreator)
            this.send(normCreator, msg).catch(() => {})
        }

        // 2. Notify Eksekutor Release (Team Leader)
        const eksekutorPhone = await getPhoneNumberAsync(data.eksekutorRelease)
        if (eksekutorPhone && !sentNumbers.has(eksekutorPhone)) {
            sentNumbers.add(eksekutorPhone)
            this.send(eksekutorPhone, msg).catch(() => {})
        }

        // 3. Notify Seksi Har
        const seksiPhone = await getPhoneNumberAsync(data.seksiHar)
        if (seksiPhone && !sentNumbers.has(seksiPhone)) {
            sentNumbers.add(seksiPhone)
            this.send(seksiPhone, msg).catch(() => {})
        }

        // 4. Notify Kru K3
        const k3Phones = await getK3PhoneNumbers()
        const k3Msg = `*[K3 INFO] LOTO TELAH DI-RELEASE* 🔓\n\nNo. Request: ${data.requestNumber}\nWork Order: ${data.workOrder}\nAsset: ${data.equipment}\nEksekutor: ${data.eksekutorRelease}\n\nLOTO telah resmi dicabut dan sistem dinormalkan kembali.\n`
        for (const k3Phone of k3Phones) {
            if (!sentNumbers.has(k3Phone)) {
                sentNumbers.add(k3Phone)
                this.send(k3Phone, k3Msg).catch(() => {})
            }
        }
    }
}

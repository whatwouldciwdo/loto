import prisma from '@/lib/db/prisma'

// Map Seksi/Department ke Nomor Telepon (Fallback jika database belum memiliki data)
// Format: Internasional tanpa + (contoh: 628123456789)
export const SEKSI_PHONE_NUMBERS: Record<string, string> = {
    'OPS A (IHWANSYAH WIBOWO)': '6285710506932',
    'OPS B (UNTUNG RIYADI)': '6287771708109',
    'OPS C (SULISTIYONO)': '6287871581077',
    'OPS D (YAYAN SURYANA)': '6287788516425',

    'HAR-MECH (JUWAN OKTAVIANSA)': '6281380712262',
    'HAR-I&C (YUDI NUGRAHA)': '6281331582934',
    'HAR-ELEC (GUNAWAN)': '6281212363710',
    'HAR-BOP (RIZKY ALIF)': '6282124175566',
    'SARANA (IRVAN SANDI)': '6285318050505',
    'HAR-PREDIKTIF (PEBRIANTO GINTING)': '6281260157164',
}

export const EKSEKUTOR_PHONE_NUMBERS: Record<string, string> = {
    'OPS A (IHWANSYAH WIBOWO)': '6285710506932',
    'OPS B (UNTUNG RIYADI)': '6287771708109',
    'OPS C (SULISTIYONO)': '6287871581077',
    'OPS D (YAYAN SURYANA)': '6287788516425',
}

export const normalizePhoneNumber = (phone: string): string => {
    let digits = phone.replace(/[^0-9]/g, '')
    if (digits.startsWith('0')) {
        digits = '62' + digits.substring(1)
    } else if (digits.startsWith('68') && !digits.startsWith('682') && !digits.startsWith('628')) {
        digits = '628' + digits.substring(2)
    }
    return digits
}

/**
 * Synchronous getPhoneNumber (fallback to memory)
 */
export const getPhoneNumber = (name: string): string | null => {
    if (!name) return null
    const raw = SEKSI_PHONE_NUMBERS[name] || EKSEKUTOR_PHONE_NUMBERS[name] || null
    return raw ? normalizePhoneNumber(raw) : null
}

/**
 * Asynchronous getPhoneNumber looking up from Database first, with fallback to hardcoded
 */
export const getPhoneNumberAsync = async (name: string): Promise<string | null> => {
    if (!name) return null
    try {
        const contact = await prisma.whatsappContact.findFirst({
            where: {
                isActive: true,
                OR: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { department: { equals: name, mode: 'insensitive' } },
                    { name: { contains: name, mode: 'insensitive' } },
                ],
            },
        })
        if (contact && contact.phone) {
            return normalizePhoneNumber(contact.phone)
        }
    } catch (err) {
        console.error('[whatsapp-config] Failed to get contact from DB, fallbacking:', err)
    }

    return getPhoneNumber(name)
}

/**
 * Get all active K3 phone numbers from database
 */
export const getK3PhoneNumbers = async (): Promise<string[]> => {
    try {
        const k3Contacts = await prisma.whatsappContact.findMany({
            where: {
                isActive: true,
                group: 'K3',
            },
            select: {
                phone: true,
            },
        })
        return k3Contacts
            .map(c => normalizePhoneNumber(c.phone))
            .filter(Boolean)
    } catch (err) {
        console.error('[whatsapp-config] Failed to get K3 contacts from DB:', err)
        return []
    }
}

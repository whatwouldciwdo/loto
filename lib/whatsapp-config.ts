
// Map Seksi/Department ke Nomor Telepon
// Format: Internasional tanpa + (contoh: 628123456789)
export const SEKSI_PHONE_NUMBERS: Record<string, string> = {
    'OPS A (IHWANSYAH WIBOWO)': '628571050693',
    'OPS B (UNTUNG RIYADI)': '628777170810',
    'OPS C (SULISTIYONO)': '628787158107',
    'OPS D (YAYAN SURYANA)': '6287788516425',

    'HAR-MECH (JUWAN OKTAVIANSA)': '6281380712262',
    'HAR-I&C (YUDI NUGRAHA)': '6281331582934',
    'HAR-ELEC (GUNAWAN)': '681212363710',
    'HAR-BOP (RIZKY ALIF)': '6282124175566',
    'SARANA (IRVAN SANDI)': '6285318050505',
    'HAR-PREDIKTIF (PEBRIANTO GINTING)': '6281260157164',
}

export const EKSEKUTOR_PHONE_NUMBERS: Record<string, string> = {
    'OPS A (IHWANSYAH WIBOWO)': '685710506932',
    'OPS B (UNTUNG RIYADI)': '6287771708109',
    'OPS C (SULISTIYONO)': '6287871581077',
    'OPS D (YAYAN SURYANA)': '687788516425',
}

export const getPhoneNumber = (name: string): string | null => {
    if (!name) return null
    return SEKSI_PHONE_NUMBERS[name] || EKSEKUTOR_PHONE_NUMBERS[name] || null
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_CONTACTS = [
    // OPERASI
    { name: 'OPS A (IHWANSYAH WIBOWO)', phone: '6285710506932', group: 'OPERASI', department: 'OPS A' },
    { name: 'OPS B (UNTUNG RIYADI)', phone: '6287771708109', group: 'OPERASI', department: 'OPS B' },
    { name: 'OPS C (SULISTIYONO)', phone: '6287871581077', group: 'OPERASI', department: 'OPS C' },
    { name: 'OPS D (YAYAN SURYANA)', phone: '6287788516425', group: 'OPERASI', department: 'OPS D' },

    // PEMELIHARAAN
    { name: 'HAR-MECH (JUWAN OKTAVIANSA)', phone: '6281380712262', group: 'PEMELIHARAAN', department: 'HAR-MECH' },
    { name: 'HAR-I&C (YUDI NUGRAHA)', phone: '6281331582934', group: 'PEMELIHARAAN', department: 'HAR-I&C' },
    { name: 'HAR-ELEC (GUNAWAN)', phone: '6281212363710', group: 'PEMELIHARAAN', department: 'HAR-ELEC' },
    { name: 'HAR-BOP (RIZKY ALIF)', phone: '6282124175566', group: 'PEMELIHARAAN', department: 'HAR-BOP' },
    { name: 'SARANA (IRVAN SANDI)', phone: '6285318050505', group: 'PEMELIHARAAN', department: 'SARANA' },
    { name: 'HAR-PREDIKTIF (PEBRIANTO GINTING)', phone: '6281260157164', group: 'PEMELIHARAAN', department: 'HAR-PREDIKTIF' },
]

async function main() {
    console.log('Seeding WhatsApp contacts...')
    const count = await prisma.whatsappContact.count()
    if (count > 0) {
        console.log(`Contacts table already contains ${count} records. Skipping seed.`)
        return
    }

    for (const c of INITIAL_CONTACTS) {
        await prisma.whatsappContact.create({
            data: {
                name: c.name,
                phone: c.phone,
                group: c.group,
                department: c.department,
                isActive: true,
            },
        })
        console.log(`+ Added: ${c.name} (${c.phone}) - ${c.group}`)
    }
    console.log('Finished seeding WhatsApp contacts.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evidence')
        await mkdir(uploadDir, { recursive: true })

        const uploadedFiles: { filename: string; url: string; originalName: string }[] = []

        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                continue
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                continue
            }

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generate unique filename
            const timestamp = Date.now()
            const ext = file.name.split('.').pop() || 'jpg'
            const filename = `evidence_${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`

            const filePath = path.join(uploadDir, filename)
            await writeFile(filePath, buffer)

            uploadedFiles.push({
                filename,
                url: `/uploads/evidence/${filename}`,
                originalName: file.name,
            })
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        )
    }
}

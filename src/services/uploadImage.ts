// services/uploadImage.ts

import supabaseAnonKey from '@/libs/supabase/anon_key'

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File

    if (!file) throw new Error('File tidak ditemukan')
    if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran file melebihi 10MB')

    const buffer = await file.arrayBuffer()
    const filePath = `stego/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabaseAnonKey.storage
        .from('stego-images')
        .upload(filePath, buffer, { contentType: file.type })

    if (uploadError) throw uploadError

    const { data } = supabaseAnonKey.storage
        .from('stego-images')
        .getPublicUrl(filePath)

    return {
        url: data.publicUrl,
        name: file.name,
        size: file.size,
    }
}

export async function deleteUploadedImage(imageUrl: string) {
    const BUCKET_NAME = 'stego-images'

    const marker = `/object/public/${BUCKET_NAME}/`
    const idx = imageUrl.indexOf(marker)
    if (idx === -1) {
        console.warn('[deleteUploadedImage] Tidak bisa parse path dari URL:', imageUrl)
        return
    }
    const filePath = imageUrl.slice(idx + marker.length)

    const { error } = await supabaseAnonKey.storage.from(BUCKET_NAME).remove([filePath])
    if (error) {
        console.error('[deleteUploadedImage] Gagal hapus file storage:', error.message)
    }
}
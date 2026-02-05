export interface Analysis {
    id: string
    image_url: string
    image_name: string
    image_size: number
    status: 'uploaded' | 'decoded' | 'interpreted'
    created_at: string
}

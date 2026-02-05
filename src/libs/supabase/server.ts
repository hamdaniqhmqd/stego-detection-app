import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug log - PENTING untuk melihat masalahnya
console.log('=== SUPABASE SERVER CONFIG ===')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)
console.log('Key length:', supabaseKey?.length || 0)

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        `Missing Supabase credentials!\n` +
        `URL: ${supabaseUrl ? 'OK' : 'MISSING'}\n` +
        `Key: ${supabaseKey ? 'OK' : 'MISSING'}`
    )
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
})
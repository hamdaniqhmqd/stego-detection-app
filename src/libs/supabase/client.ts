import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

import { createClient } from '@supabase/supabase-js'

// console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
// console.log('SUPABASE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseRoleKey);

export default supabase;

import { createClient } from '@supabase/supabase-js'

// console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
// console.log('SUPABASE KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAnonKey = createClient(supabaseUrl, supabaseKey);

export default supabaseAnonKey;

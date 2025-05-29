
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ecvsmyznwxulnxvyapqm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnNteXpud3h1bG54dnlhcHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzg4OTYsImV4cCI6MjA2MzI1NDg5Nn0.i0wP77SR-RgCzYfY18QXm9yYoXKHgGh8utUqWkT_WTk";
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? localStorage : undefined
    }
  }
)

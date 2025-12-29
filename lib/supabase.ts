import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlayerRecord {
  id?: string;
  name: string;
  region: string;
  security_code?: string;
  final_score: number;
  intro_score: number;    // Level 1: Complete-the-verse
  mcq_score: number;      // Level 2: Multiple choice
  easy_score: number;     // Level 3: Easy (fragment arrange)
  medium_score: number;   // Level 4: Medium (fragment arrange)
  hard_score: number;     // Level 5: Hard (fragment + reference)
  created_at?: string;
}


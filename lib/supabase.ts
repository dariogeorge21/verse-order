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
  easy_score: number;
  medium_score: number;
  hard_score: number;
  created_at?: string;
}


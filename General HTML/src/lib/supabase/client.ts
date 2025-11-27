import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient:
  | ReturnType<typeof createClient>
  | null = null;

export const getBrowserSupabase = () => {
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
    );
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, anonKey);
  }

  return browserClient;
};


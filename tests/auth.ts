import { createClient } from "@supabase/supabase-js";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

export const supabaseAdmin = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SECRET_KEY"),
);

const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("NUXT_PUBLIC_SUPABASE_KEY"),
);

export async function getTestSession() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: requireEnv("TEST_USER_EMAIL"),
    password: requireEnv("TEST_USER_PASSWORD"),
  });

  if (error) throw error;
  return data.session;
}

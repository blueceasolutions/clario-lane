// src/config/env.ts
import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_PAYSTACK_PUBLIC_KEY: z.string(),
  VITE_GOOGLE_ANALYTICS_KEY: z.string(),
});

// Validate client environment
export const clientEnv = clientEnvSchema.parse(import.meta.env);

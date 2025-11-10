import { clientEnv } from "@/config/env";
import axios from "axios";

export const apiInstance = axios.create({
  baseURL: `${clientEnv.VITE_SUPABASE_URL}/functions/v1/`,
  headers: {
    Authorization: `Bearer ${clientEnv.VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
});

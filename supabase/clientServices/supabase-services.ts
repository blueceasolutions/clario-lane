import { clientEnv } from "@/config/env";
import { logServerError } from "@/lib";
import type { UserTable } from "@/types";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "~supabase/supabase_types";

class SupabaseService {
  public sp;
  constructor() {
    this.sp = createClient<Database>(
      clientEnv.VITE_SUPABASE_URL,
      clientEnv.VITE_SUPABASE_ANON_KEY,
    );
  }

  public async signUp(email: string, password: string, name: string) {
    const { data, error } = await this.sp.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.sp.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  public async signOut() {
    const { error } = await this.sp.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  public async signInWithGoogle() {
    const { data, error } = await this.sp.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      logServerError(error);
      return;
    }
    return data;
  }

  async getUser() {
    const { data, error } = await supabaseService.sp.from("users").select(
      "*",
    )
      .single();

    if (error) {
      logServerError(error.message);
      return;
    }
    return data;
  }

  async getSession() {
    const { data: { session }, error } = await supabaseService.sp.auth
      .getSession();

    if (error) {
      logServerError(error.message);
    }

    return session;
  }

  async getPracticedSessions(userId?: string, limit: number = 6) {
    const { data, error } = await this.sp.from("practice_sessions").select("*")
      .eq("user_id", userId || "").order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      logServerError(error);
    }
    return data?.sort((a, b) => {
      const dateA = new Date(`${a.created_at}`);
      const dateB = new Date(`${b.created_at}`);
      // @ts-ignore
      return dateA - dateB;
    });
  }

  channel(callback: (payload: UserTable) => void) {
    return this.sp.channel("changes", {
      config: {
        broadcast: {
          ack: true,
        },
      },
    }).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
      },
      (payload) => {
        callback(payload.new as UserTable);
      },
    ).subscribe();
  }
}

export const supabaseService = new SupabaseService();

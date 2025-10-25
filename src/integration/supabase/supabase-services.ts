import { clientEnv } from "@/config/env";
import { logServerError } from "@/lib";
import {
  initialUserProfile,
  useOnboardingStore,
  useUserProfileStore,
  type UserProfileType,
} from "@/store";
import { createClient } from "@supabase/supabase-js";

class SupabaseService {
  private supabase;
  constructor() {
    this.supabase = createClient(
      clientEnv.VITE_SUPABASE_URL,
      clientEnv.VITE_SUPABASE_ANON_KEY,
    );
  }

  public async signUp(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  public async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  public async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  public async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      return logServerError(error);
    }
  }

  public async getUser() {
    try {
      const { error, data } = await this.supabase
        .from("users")
        .select("*")
        .single();

      if (error) {
        throw error;
      }
      useUserProfileStore.setState(data as UserProfileType);
      return data;
    } catch (error) {
      useUserProfileStore.setState(initialUserProfile);
      return logServerError(error);
    }
  }

  public async insertUser() {
    try {
      const store = useOnboardingStore.getState();
      const { error } = await this.supabase.from("users").insert({
        name: store.name,
        email: store.email,
        dateOfBirth: store.dateOfBirth,
        achievements: store.achievements,
        baseLineWPM: store.baseLineWPM,
        badges: store.badges,
        goals: store.goals,
        contentTypes: store.contentTypes,
        challenges: store.challenges,
        currentComprehensionScore: store.currentComprehensionScore,
        focusScore: store.focusScore,
        dailyReminder: store.dailyReminder,
        weeklyProgress: store.weeklyProgress,
        streakDays: store.streakDays,
        xpEarned: store.xpEarned,
        currentWPM: store.currentWPM,
        level: store.level,
        baselineComprehension: store.baselineComprehension,
        currentComprehension: store.currentComprehension,
        onboardingComplete: store.onboardingComplete,
      });

      if (error) {
        throw error;
      }

      const res = await this.getUser();
      if (res) {
        useOnboardingStore.setState({
          currentStep: 0,
          isSubmitting: false,
        });
        useUserProfileStore.setState({
          onboardingComplete: store.onboardingComplete,
        });
      }

      return;
    } catch (error) {
      return logServerError(error);
    }
  }
}

export const supabaseService = new SupabaseService();

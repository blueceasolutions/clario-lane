import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabaseService } from "~supabase/clientServices";

export type FontFace = "Inter" | "Dyslexie" | "Serif" | "Mono";
export type Theme = "light" | "dark" | "sepia" | "auto";

type UserPreferences = {
  font_face: string;
  font_size_scale: number;
  theme: string;
  bionic_reading?: boolean;
};

type SettingsStore = {
  fontFace: FontFace;
  fontSizeScale: number;
  theme: Theme;
  bionicReading: boolean;
  setFontFace: (fontFace: FontFace) => void;
  setFontSizeScale: (fontSizeScale: number) => void;
  setTheme: (theme: Theme) => void;
  setBionicReading: (bionicReading: boolean) => void;
  syncPreferences: (preferences: UserPreferences) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      fontFace: "Inter",
      fontSizeScale: 100,
      theme: "auto",
      bionicReading: false,
      setFontFace: async (fontFace) => {
        set({ fontFace });
        const user = await supabaseService.getUser();
        if (user) {
          await supabaseService.sp
            .from("user_preferences")
            .upsert({ user_id: user.id, font_face: fontFace });
        }
      },
      setFontSizeScale: async (fontSizeScale) => {
        set({ fontSizeScale });
        const user = await supabaseService.getUser();
        if (user) {
          await supabaseService.sp
            .from("user_preferences")
            .upsert({ user_id: user.id, font_size_scale: fontSizeScale });
        }
      },
      setTheme: async (theme) => {
        set({ theme });
        const user = await supabaseService.getUser();
        if (user) {
          await supabaseService.sp
            .from("user_preferences")
            .upsert({ user_id: user.id, theme });
        }
      },
      setBionicReading: async (bionicReading) => {
        set({ bionicReading });
        const user = await supabaseService.getUser();
        if (user) {
          await supabaseService.sp
            .from("user_preferences")
            .upsert({ user_id: user.id, bionic_reading: bionicReading });
        }
      },
      syncPreferences: (preferences) => {
        set({
          fontFace: preferences.font_face as FontFace,
          fontSizeScale: preferences.font_size_scale,
          theme: preferences.theme as Theme,
          bionicReading: preferences.bionic_reading ?? false,
        });
      },
    }),
    {
      name: "settings-storage",
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabaseService } from "~supabase/clientServices";

export type FontFace = "Inter" | "Dyslexie" | "Serif" | "Mono";
export type Theme = "light" | "dark" | "sepia" | "auto";

type SettingsStore = {
  fontFace: FontFace;
  fontSizeScale: number;
  theme: Theme;
  setFontFace: (fontFace: FontFace) => void;
  setFontSizeScale: (fontSizeScale: number) => void;
  setTheme: (theme: Theme) => void;
  syncPreferences: (preferences: any) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      fontFace: "Inter",
      fontSizeScale: 100,
      theme: "auto",
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
      syncPreferences: (preferences) => {
        set({
          fontFace: preferences.font_face as FontFace,
          fontSizeScale: preferences.font_size_scale,
          theme: preferences.theme as Theme,
        });
      },
    }),
    {
      name: "settings-storage",
    },
  ),
);

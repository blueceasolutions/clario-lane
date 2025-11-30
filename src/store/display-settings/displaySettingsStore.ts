import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DisplaySettings = {
  fontFamily: string;
  fontSize: number;
};

type DisplaySettingsActions = {
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  updateSettings: (settings: Partial<DisplaySettings>) => void;
  reset: () => void;
};

const initialState: DisplaySettings = {
  fontFamily: "Inter",
  fontSize: 48,
};

export const useDisplaySettingsStore = create<
  DisplaySettings & DisplaySettingsActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setFontFamily: (fontFamily: string) => set({ fontFamily }),
      setFontSize: (fontSize: number) => set({ fontSize }),
      updateSettings: (settings: Partial<DisplaySettings>) => set(settings),
      reset: () => set(initialState),
    }),
    {
      name: "clario-display-settings",
    },
  ),
);

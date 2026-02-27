import { useDisplaySettingsStore, usePracticeStore } from "@/store";

export function useAdjustedFontSize() {
  const { fontSize } = useDisplaySettingsStore();
  const chunkSize = usePracticeStore((state) => state.chunkSize);

  return chunkSize >= 6 && fontSize > 2 ? fontSize * 0.1 + 2 : fontSize;
}

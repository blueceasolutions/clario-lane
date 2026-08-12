// CSV export for a user's progress report. Deliberately no PDF library
// here -- the report page (ProgressReport route) is print-optimized and
// relies on the browser's native "Print > Save as PDF", which needs zero
// new dependencies and produces a real, selectable-text PDF.

export type ExportableSession = {
  created_at: string | null;
  wpm: number;
  comprehension: number;
  total_words: number | null;
  duration: number | null; // seconds, matching user_stats.total_time_seconds' convention
};

function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateProgressCsv(sessions: ExportableSession[]): string {
  const header = [
    "Date",
    "WPM",
    "Comprehension (%)",
    "Words Read",
    "Duration (min)",
    "Effective WPM",
  ];

  const rows = sessions.map((session) => {
    const date = session.created_at
      ? new Date(session.created_at).toISOString().slice(0, 10)
      : "";
    const durationMin = session.duration
      ? Math.round((session.duration / 60) * 10) / 10
      : 0;
    const effectiveWpm = Math.round(
      (session.wpm * session.comprehension) / 100,
    );

    return [
      date,
      session.wpm,
      session.comprehension,
      session.total_words ?? 0,
      durationMin,
      effectiveWpm,
    ];
  });

  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

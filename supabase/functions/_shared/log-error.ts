// Structured error logging for edge functions.
//
// Every function currently does `console.error(error)` with no consistent
// context, so a production failure can only be tracked down by grepping raw
// Supabase function logs and guessing which user/step it happened in.
// logError() always emits one structured JSON line (function, step, user id,
// message, stack) that's filterable in the Supabase log explorer, and
// additionally reports to Sentry once a SENTRY_DSN secret is configured —
// no code changes needed to turn that on, see below.
export interface ErrorContext {
  function: string;
  step: string;
  userId?: string;
  [key: string]: unknown;
}

// The subset of the Sentry SDK surface this module actually calls.
interface SentryScope {
  setTag: (key: string, value: unknown) => void;
  setUser: (user: { id: string }) => void;
  setExtra: (key: string, value: unknown) => void;
}

interface SentryModule {
  init: (options: {
    dsn: string;
    environment: string;
    defaultIntegrations: boolean;
    tracesSampleRate: number;
  }) => void;
  withScope: (callback: (scope: SentryScope) => void) => void;
  captureException: (error: unknown) => void;
  flush: (timeoutMs?: number) => Promise<boolean>;
}

// The Sentry SDK is imported dynamically, and only once SENTRY_DSN is
// actually set, so functions deploy and run exactly as they do today when
// no DSN is configured (which is the case until this secret is set):
//   supabase secrets set SENTRY_DSN=https://...@sentry.io/...
// See https://supabase.com/docs/guides/functions/examples/sentry-monitoring
let sentryModule: SentryModule | null | undefined;

async function getSentry(): Promise<SentryModule | null> {
  if (sentryModule !== undefined) return sentryModule;

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    sentryModule = null;
    return sentryModule;
  }

  const Sentry = await import("@sentry/deno") as unknown as SentryModule;
  Sentry.init({
    dsn,
    environment: Deno.env.get("SENTRY_ENVIRONMENT") ?? "production",
    defaultIntegrations: false,
    tracesSampleRate: 0,
  });
  sentryModule = Sentry;
  return sentryModule;
}

export async function logError(
  error: unknown,
  context: ErrorContext,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(JSON.stringify({
    level: "error",
    message,
    stack,
    timestamp: new Date().toISOString(),
    ...context,
  }));

  const Sentry = await getSentry();
  if (!Sentry) return;

  try {
    Sentry.withScope((scope) => {
      scope.setTag("function", context.function);
      scope.setTag("step", context.step);
      if (context.userId) scope.setUser({ id: context.userId });
      for (const [key, value] of Object.entries(context)) {
        if (key !== "function" && key !== "step" && key !== "userId") {
          scope.setExtra(key, value);
        }
      }
      Sentry.captureException(
        error instanceof Error ? error : new Error(message),
      );
    });
    // Edge function isolates can be torn down immediately after the response
    // is sent, so the event must be flushed before returning rather than
    // relying on Sentry's background sender.
    await Sentry.flush(2000);
  } catch (sentryError) {
    console.error(JSON.stringify({
      level: "error",
      message: "Failed to report error to Sentry",
      error: sentryError instanceof Error
        ? sentryError.message
        : String(sentryError),
    }));
  }
}

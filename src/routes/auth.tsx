import AuthPage from "@/pages/auth/auth-page";

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { session } = context;
    if (session) {
      throw redirect({ to: "/onboarding" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="bg-background flex min-h-[80svh] flex-col items-center justify-center gap-6 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-md flex-col gap-6"
      >
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BookOpen className="size-4" />
          </div>
          ClarioLane
        </Link>
        <AuthPage />
      </motion.div>
    </div>
  );
}

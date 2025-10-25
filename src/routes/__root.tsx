import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { supabaseService } from "@/integration";
import { Footer, PendingPage, ThemeProvider } from "@/components";
import type { Session } from "@supabase/supabase-js";

type RootRouteContext = {
  session: Session | null;
};

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  pendingComponent: PendingPage,
  beforeLoad: async () => {
    const session = await supabaseService.getSession();
    await supabaseService.getUser();
    return { session };
  },
});

function RootComponent() {
  return (
    <React.Fragment>
      <ThemeProvider>
        <Navbar />
        <Outlet />
        <Footer />
        <Toaster position="top-center" />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </React.Fragment>
  );
}

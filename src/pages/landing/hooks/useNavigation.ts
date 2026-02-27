import { useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import type { INavigationHandler } from "../types";

/**
 * Dependency Inversion Principle: Navigation abstraction
 * Components depend on INavigationHandler interface, not concrete implementation
 * Single Responsibility: Handles navigation logic only
 *
 * @param session - User session (nullable)
 * @returns Navigation handler following INavigationHandler interface
 */
export function useNavigation(session: Session | null): INavigationHandler {
  const navigate = useNavigate();

  const hasDashboardAccess = session !== null;

  const primaryAction = () => {
    if (hasDashboardAccess) {
      navigate({ to: "/dashboard/practice" });
    } else {
      navigate({ to: "/auth" });
    }
  };

  const primaryLabel = hasDashboardAccess ? "Go to Dashboard" : "Get Started";

  return {
    primaryAction,
    primaryLabel,
    hasDashboardAccess,
  };
}

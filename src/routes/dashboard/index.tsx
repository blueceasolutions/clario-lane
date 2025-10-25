import { Dashboard } from "@/components";

import { useOnboardingStore, useUserProfileStore } from "@/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { session } = context;
    if (!session) {
      throw redirect({ to: "/auth" });
    }
  },

  loader: async () => {
    const userProfileStore = useUserProfileStore.getState().onboardingComplete;
    const onboardingStore = useOnboardingStore.getState().onboardingComplete;
    console.log({ userProfileStore, onboardingStore });

    const isOnboarded = userProfileStore || onboardingStore;
    if (!isOnboarded) {
      throw redirect({ to: "/onboarding" });
    }
  },
});

function RouteComponent() {
  return <Dashboard />;
}

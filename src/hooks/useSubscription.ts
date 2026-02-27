import { useCallback, useEffect } from "react";
import PaystackPop from "@paystack/inline-js";
import { clientEnv } from "@/config/env";
import { fetchUserProfile } from "@/integration";
import { useQuery } from "@tanstack/react-query";
import { useOnboardingStore } from "@/store";
import { supabaseService } from "~supabase/clientServices";
import type { UserTable } from "@/types";
import { useRouteContext, useRouter } from "@tanstack/react-router";

import { REF_KEYWORD } from "@/lib/constants";

export const useSubscription = () => {
  const { data: user, refetch } = useQuery(fetchUserProfile);
  const paystackPop = new PaystackPop();

  const onboardingEmail = useOnboardingStore((state) => state.email);
  const email = user?.email || onboardingEmail;
  const route = useRouter();
  const rootContext = useRouteContext({ from: "__root__" });

  const affiliateId = typeof window !== "undefined"
    ? window.localStorage.getItem(REF_KEYWORD)
    : null;

  const onSubscribe = useCallback(
    (amount: number, plan: string) => {
      paystackPop.newTransaction({
        key: clientEnv.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100,
        planCode: plan,
        metadata: {
          custom_fields: [
            {
              display_name: "Affiliate Link ID",
              variable_name: "affiliate_link_id",
              value: affiliateId || "",
            },
          ],
        },
      });
    },
    [email, affiliateId],
  );

  useEffect(() => {
    const handleConfirmSubscription = async (payload: UserTable) => {
      if (payload.email === email && payload.is_subscribed) {
        route.invalidate({ sync: true });
        await rootContext.queryClient.fetchQuery(fetchUserProfile);
        refetch().then(() => {
          route.navigate({ to: "/dashboard/practice" });
        });
      }
    };
    const channel = supabaseService.channel(handleConfirmSubscription);
    return () => {
      supabaseService.sp.removeChannel(channel);
    };
  }, [email, affiliateId]);

  return { onSubscribe };
};

"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { useProfile } from "@/hooks/use-profile";

export default function AnalyticsTracker() {
  const { profile, isLoading } = useProfile();
  const hasSent = useRef(false);

  useEffect(() => {
    if (isLoading || hasSent.current) return;

    hasSent.current = true;
    track("visit", { isLoggedIn: profile !== null });
  }, [isLoading, profile]);

  return null;
}

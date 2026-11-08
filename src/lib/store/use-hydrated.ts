"use client";

import { useEffect, useState } from "react";
import { useJourney } from "./journey-store";

/** True once the persisted journey has been read from storage (avoids SSR/redirect flicker). */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useJourney.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useJourney.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

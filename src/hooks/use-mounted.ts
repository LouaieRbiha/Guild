"use client";

import { useState, useEffect } from "react";

/**
 * Returns `true` after the component has mounted on the client.
 * Useful for guarding browser-only APIs (localStorage, window, etc.)
 * and avoiding React hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

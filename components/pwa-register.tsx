"use client";

import { useEffect } from "react";

/** Registers the service worker in production only (avoids dev/HMR issues). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.warn("[PWA] service worker registration failed:", err);
    });
  }, []);

  return null;
}

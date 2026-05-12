"use client";

import { useEffect, useRef, useState } from "react";

export type AuditorMapPin = {
  id: string;
  username: string | null;
  full_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  auditors: AuditorMapPin[];
  center?: { lat: number; lng: number } | null;
  heightClassName?: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export function AuditorsMap({ auditors, center, heightClassName = "h-[420px]" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pins = auditors.filter(
      (a): a is AuditorMapPin & { latitude: number; longitude: number } =>
        typeof a.latitude === "number" && typeof a.longitude === "number"
    );

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLoadError(
        "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map (Maps JavaScript API enabled for this key)."
      );
      return;
    }

    if (pins.length === 0 && !center) {
      return;
    }

    let cancelled = false;

    const init = () => {
      if (!ref.current || cancelled || !window.google?.maps) return;
      const g = window.google.maps;
      const defaultCenter =
        center ??
        (pins[0] ? { lat: pins[0].latitude, lng: pins[0].longitude } : { lat: 20, lng: 0 });
      const map = new g.Map(ref.current, {
        center: defaultCenter,
        zoom: pins.length <= 1 ? 6 : 4,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const bounds = new g.LatLngBounds();
      for (const p of pins) {
        const pos = { lat: p.latitude, lng: p.longitude };
        bounds.extend(pos);
        new g.Marker({
          map,
          position: pos,
          title: p.full_name || p.username || "Auditor",
        });
      }
      if (pins.length > 1) {
        map.fitBounds(bounds, 48);
      }
    };

    if (window.google?.maps) {
      init();
      setReady(true);
      return;
    }

    const existing = document.querySelector(`script[data-google-maps="1"]`);
    if (existing) {
      existing.addEventListener("load", () => {
        if (!cancelled) {
          init();
          setReady(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "1";
    script.onload = () => {
      if (!cancelled) {
        init();
        setReady(true);
      }
    };
    script.onerror = () => setLoadError("Could not load Google Maps script.");
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [auditors, center]);

  const pins = auditors.filter(
    (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
  ) as Array<AuditorMapPin & { latitude: number; longitude: number }>;

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground ${heightClassName}`}
      >
        {loadError}
      </div>
    );
  }

  if (pins.length === 0 && !center) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground ${heightClassName}`}
      >
        No auditors with map coordinates yet. Ask auditors to pin their location in profile settings
        (geocoding uses your Google Cloud key on the server).
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={ref} className={`w-full rounded-lg overflow-hidden border ${heightClassName}`} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 text-sm">
          Loading map…
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { initDdragonVersion } from "@/lib/ddragon";

/** Invisible component that triggers DDragon version fetch on mount */
export function DdragonInit() {
  useEffect(() => {
    initDdragonVersion();
  }, []);
  return null;
}

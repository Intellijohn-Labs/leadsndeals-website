"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/Providers";

/** Pages without the intro loader (legal pages) release the scroll lock straight away. */
export default function IntroDone() {
  const { finishIntro } = useApp();
  useEffect(() => finishIntro(), [finishIntro]);
  return null;
}

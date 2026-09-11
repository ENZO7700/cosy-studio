import { useEffect } from "react";
import { subscribeAppDvh } from "@/lib/dvh";

/** Keeps --app-dvh in sync with the visual viewport. */
export function AppDvhSync() {
  useEffect(() => subscribeAppDvh(), []);
  return null;
}

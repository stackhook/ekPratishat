"use client";

import { sessionManager } from "@repo/shared-provider";

export default function TestSessionExpiry() {
  return (
    <button
      onClick={() => sessionManager.notifySessionExpired()}
      className="rounded-lg bg-red-500 px-4 py-2 text-white"
    >
      Test Session Expired
    </button>
  );
}
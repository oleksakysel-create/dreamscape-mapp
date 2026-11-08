"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-display text-3xl font-semibold">Something slipped</h1>
        <p className="text-muted">Your journey is safely stored on this device. Let&apos;s try that again.</p>
        {error.digest && <p className="text-xs text-muted">Reference: {error.digest}</p>}
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}

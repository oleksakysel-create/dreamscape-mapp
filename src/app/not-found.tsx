import Link from "next/link";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="space-y-4">
        <Logo className="justify-center" />
        <h1 className="font-display text-3xl font-semibold">This page wandered off the map</h1>
        <p className="text-muted">No worries — every path leads back home.</p>
        <Button asChild>
          <Link href="/journey">Return to your journey</Link>
        </Button>
      </div>
    </main>
  );
}

"use client";

import { Palette } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ColoringStudio } from "@/components/coloring/studio";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { getIllustration } from "@/lib/coloring/illustrations";
import { getMonth } from "@/lib/data/months";
import { useJourney } from "@/lib/store/journey-store";

export default function StudioPage() {
  const params = useParams<{ month: string }>();
  const month = Number(params.month);
  const coloring = useJourney((s) => s.colorings[month]);
  if (!getMonth(month)) notFound();

  if (!coloring || !getIllustration(coloring.imageId)) {
    return (
      <div className="mx-auto max-w-lg pt-10">
        <EmptyState
          icon={<Palette className="size-5" />}
          title="No page chosen yet"
          description="Pick one illustration for this chapter first — then the studio is all yours."
          action={
            <Button asChild>
              <Link href={`/journey/${month}#coloring`}>Choose a page</Link>
            </Button>
          }
        />
      </div>
    );
  }
  return <ColoringStudio key={coloring.imageId} month={month} coloring={coloring} />;
}

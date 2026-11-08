"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { color?: string; thumbLabel?: string }
>(({ className, color, thumbLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex h-8 w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-surface-2">
      <SliderPrimitive.Range className="absolute h-full rounded-full" style={{ background: color ?? "var(--ds-primary)" }} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      className="block size-6 rounded-full border-[3px] bg-surface shadow-soft transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      style={{ borderColor: color ?? "var(--ds-primary)" }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

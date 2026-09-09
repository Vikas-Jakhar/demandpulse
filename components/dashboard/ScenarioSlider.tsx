"use client";

import * as Slider from "@radix-ui/react-slider";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScenarioSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ScenarioSlider({ value, onChange }: ScenarioSliderProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Sparkles className="h-4 w-4 shrink-0 text-signal" />
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-ink-muted">Scenario: demand growth adjustment</span>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                value > 0 ? "text-good" : value < 0 ? "text-bad" : "text-ink"
              )}
            >
              {value > 0 ? "+" : ""}
              {value}%
            </span>
          </div>
          <Slider.Root
            className="relative flex h-4 w-full touch-none items-center"
            min={-50}
            max={50}
            step={1}
            value={[value]}
            onValueChange={([v]) => onChange(v)}
          >
            <Slider.Track className="relative h-1 grow rounded-full bg-border">
              <Slider.Range className="absolute h-full rounded-full bg-signal" />
            </Slider.Track>
            <Slider.Thumb className="block h-4 w-4 rounded-full border-2 border-signal bg-surface shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-signal" />
          </Slider.Root>
        </div>
        <span className="text-xs text-ink-faint">e.g. promo boost, price change</span>
      </CardContent>
    </Card>
  );
}

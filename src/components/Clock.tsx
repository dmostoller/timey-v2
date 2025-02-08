"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";

interface ClockProps {
  time: number;
}

export function Clock({ time }: ClockProps) {
  return (
    <Card className="inline-block bg-accent text-primary">
      <CardContent className="p-2">
        <div className="text-2xl font-mono font-bold">{formatTime(time)}</div>
      </CardContent>
    </Card>
  );
}

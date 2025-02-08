"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface PomodoroProps {
  onComplete?: () => void;
}

export function Pomodoro({ onComplete }: PomodoroProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const resetTimer = useCallback(() => {
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    setIsRunning(false);
  }, [isBreak]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onComplete?.();
      // Switch between pomodoro and break
      setIsBreak((prev) => !prev);
      setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isBreak, onComplete]);

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <div className="text-sm font-medium">
        {isBreak ? "Break Time" : "Focus Time"}
      </div>
      <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleTimer}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={resetTimer}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

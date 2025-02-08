"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { motion } from "framer-motion";

interface PomodoroCircleProps {
  size?: number;
  onComplete?: () => void;
}

export function PomodoroCircle({
  size = 300,
  onComplete,
}: PomodoroCircleProps) {
  const [initialTime, setInitialTime] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(initialTime * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const totalTime = isBreak ? 5 * 60 : initialTime * 60;
  const progress = 1 - timeLeft / totalTime;
  const center = size / 2;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const adjustTime = useCallback(
    (amount: number) => {
      if (isRunning) return; // Prevent adjustment while running
      const newTime = Math.max(1, initialTime + amount); // Minimum 1 minute
      setInitialTime(newTime);
      setTimeLeft(newTime * 60);
    },
    [isRunning, initialTime],
  );

  const resetTimer = useCallback(() => {
    setTimeLeft(isBreak ? 5 * 60 : initialTime * 60);
    setIsRunning(false);
  }, [isBreak, initialTime]);

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
      setIsBreak((prev) => !prev);
      setTimeLeft(isBreak ? initialTime * 60 : 5 * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isBreak, onComplete, initialTime]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="stroke-muted-foreground/20"
          fill="none"
          strokeWidth="4"
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth="4"
          className="stroke-primary"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm font-medium text-muted-foreground">
          {isBreak ? "Break" : "Focus"}
        </div>
        <div className="text-4xl font-bold mb-2">{formatTime(timeLeft)}</div>

        {/* Time adjustment controls */}
        {!isRunning && !isBreak && (
          <div className="flex items-center gap-1 mb-2">
            <Button
              onClick={() => adjustTime(-1)}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">
              {initialTime}m
            </span>
            <Button
              onClick={() => adjustTime(1)}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        )}

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
    </div>
  );
}

"use client";

import { useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Clock } from "./Clock";
import type { Task, Project, Client, TimeEntry } from "@/types";
import { GmailBadge } from "./GmailBadge";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TinyThemeToggle } from "@/components/TinyThemeToggle";
import { SmallClock } from "./SmallClock";

interface TimerProps {
  task: Task | null;
  project?: Project | null;
  client?: Client | null;
  onUpdateTask: (task: Task) => void;
  isUpdating: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  currentEntry: Partial<TimeEntry> | null;
  setCurrentEntry: (entry: Partial<TimeEntry> | null) => void;
  sessionStartTime: Date | null;
  setSessionStartTime: (date: Date | null) => void;
}

export function Timer({
  task,
  project,
  client,
  onUpdateTask,
  isUpdating,
  isCollapsed,
  onToggleCollapse,
  elapsedTime,
  setElapsedTime,
  currentEntry,
  setCurrentEntry,
  sessionStartTime,
  setSessionStartTime,
}: TimerProps) {
  const { createTimeEntry } = useTimeEntries();
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (task?.isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date());
      }

      interval = setInterval(() => {
        if (sessionStartTime) {
          const now = new Date();
          const elapsed = Math.floor(
            (now.getTime() - sessionStartTime.getTime()) / 1000,
          );
          setElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      setSessionStartTime(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task?.isRunning, sessionStartTime, setElapsedTime, setSessionStartTime]);

  // Handle play/pause
  const toggleTimer = useCallback(() => {
    if (!task || isUpdating) return;

    const newIsRunning = !task.isRunning;
    const now = new Date();
    const nowISO = now.toISOString();

    if (newIsRunning) {
      // Start new time entry
      const entry = {
        taskId: task.id,
        startTime: nowISO,
        endTime: null,
        duration: 0,
      };
      createTimeEntry(entry);
      setCurrentEntry(entry);
      setElapsedTime(0);
      setSessionStartTime(now);
    } else if (currentEntry && currentEntry.taskId) {
      // End current time entry
      const duration = Math.floor(elapsedTime);
      createTimeEntry({
        taskId: currentEntry.taskId,
        startTime: currentEntry.startTime ?? nowISO,
        endTime: nowISO,
        duration,
      });
      setCurrentEntry(null);
      setSessionStartTime(null);
    }

    onUpdateTask({
      ...task,
      id: task.id,
      isRunning: newIsRunning,
    });
  }, [
    task,
    isUpdating,
    elapsedTime,
    createTimeEntry,
    currentEntry,
    onUpdateTask,
    setCurrentEntry,
    setElapsedTime,
    setSessionStartTime,
  ]);

  if (!task) {
    return (
      <Card className="bg-muted mb-4">
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a task to start timing
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card mb-4">
      <CardContent className="p-2">
        <div className="flex items-center justify-between gap-8">
          {isCollapsed && <SmallClock size={120} />}
          <div className="flex items-center justify-between gap-4 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">{task.name}</h2>
              <div className="space-y-0.5">
                {project && (
                  <p className="text-sm text-muted-foreground">
                    Project: {project.name}
                  </p>
                )}
                {client && (
                  <p className="text-sm text-muted-foreground">
                    Client: {client.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GmailBadge />
            <Clock time={elapsedTime} />
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleTimer}
                variant="outline"
                size="icon"
                className="h-12 w-12"
                disabled={isUpdating}
              >
                {task.isRunning ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={onToggleCollapse}
                variant="ghost"
                size="icon"
                className="h-12 w-12"
              >
                {isCollapsed ? (
                  <Maximize2 className="h-6 w-6" />
                ) : (
                  <Minimize2 className="h-6 w-6" />
                )}
              </Button>
              {isCollapsed && (
                <div className="absolute top-2 left-2">
                  <TinyThemeToggle />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

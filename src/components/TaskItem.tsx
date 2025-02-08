"use client";

import type { Task, Project, Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { formatTime } from "@/lib/utils";
import { useTimeEntries } from "@/hooks/useTimeEntries";

interface TaskItemProps {
  task: Task;
  project?: Project;
  client?: Client;
  onDeleteTask: (id: string) => void;
  isDeleting: boolean;
  onLoadTimer: (task: Task) => void;
}

export default function TaskItem({
  task,
  project,
  client,
  onDeleteTask,
  isDeleting,
  onLoadTimer,
}: TaskItemProps) {
  // Fetch time entries for this specific task
  const { timeEntries } = useTimeEntries(undefined, undefined, task.id);

  // Calculate total duration from all time entries
  const totalTime =
    timeEntries?.reduce((acc, entry) => acc + (entry.duration || 0), 0) || 0;

  return (
    <Card className="bg-card text-card-foreground">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{task.name}</h3>
          <p className="text-sm text-muted-foreground">
            Total: {formatTime(totalTime)}
          </p>
          {project && (
            <p className="text-xs text-muted-foreground">
              Project: {project.name}
            </p>
          )}
          {client && (
            <p className="text-xs text-muted-foreground">
              Client: {client.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <Button
              onClick={() => onLoadTimer(task)}
              variant="outline"
              size="icon"
              title="Load in Timer"
            >
              <Timer className="h-4 w-4" />
            </Button>
            <DeleteTaskDialog
              taskName={task.name}
              onConfirm={() => onDeleteTask(task.id)}
              disabled={isDeleting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import TaskList from "./TaskList";
import AddTaskForm from "./AddTaskForm";
import Summary from "./Summary";
import ProjectClientManager from "./ProjectClientManager";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useTasks } from "@/hooks/useTasks";
import { Timer } from "./Timer";
import type { Task, TimeEntry } from "@/types";
import { PomodoroCircle } from "./PomodoroCircle";

export default function TimeTracker() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry> | null>(
    null,
  );
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { projects } = useProjects();
  const { clients } = useClients();
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    isUpdatingTask,
    isDeletingTask,
  } = useTasks();
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCollapsed) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isCollapsed]);

  const handleUpdateTask = useCallback(
    (task: Task) => {
      setActiveTimerTask(task);
      updateTask(task);
    },
    [updateTask],
  );

  const handleLoadTimer = (task: Task) => {
    setActiveTimerTask(task);
  };

  const handleAddTask = (
    name: string,
    projectId?: string,
    clientId?: string,
  ) => {
    addTask({
      name,
      projectId,
      clientId,
    });
  };

  const TimerComponent = (
    <Timer
      task={activeTimerTask}
      project={
        activeTimerTask
          ? projects?.find((p) => p.id === activeTimerTask.projectId)
          : null
      }
      client={
        activeTimerTask
          ? clients?.find((c) => c.id === activeTimerTask.clientId)
          : null
      }
      onUpdateTask={handleUpdateTask}
      isUpdating={isUpdatingTask}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      elapsedTime={elapsedTime}
      setElapsedTime={setElapsedTime}
      currentEntry={currentEntry}
      setCurrentEntry={setCurrentEntry}
      sessionStartTime={sessionStartTime}
      setSessionStartTime={setSessionStartTime}
    />
  );

  if (isCollapsed && activeTimerTask) {
    return (
      <>
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {/* Add a wrapper div that prevents pointer events on the backdrop only */}
          <div className="absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            {/* Add z-index to ensure controls are above backdrop */}
            <PomodoroCircle size={300} />
          </div>
        </div>
        <div className="fixed bottom-4 right-4 flex items-center gap-2">
          {TimerComponent}
        </div>
      </>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto relative">
      {TimerComponent}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-1/2">
          <ProjectClientManager />
        </div>
        <div className="w-full lg:w-1/2">
          <AddTaskForm
            onAddTask={handleAddTask}
            projects={projects || []}
            clients={clients || []}
          />
        </div>
      </div>
      <TaskList
        tasks={tasks || []}
        projects={projects || []}
        clients={clients || []}
        onDeleteTask={deleteTask}
        onLoadTimer={handleLoadTimer}
        isDeletingTask={isDeletingTask}
      />
      <Summary
        tasks={tasks || []}
        projects={projects || []}
        clients={clients || []}
      />
    </div>
  );
}

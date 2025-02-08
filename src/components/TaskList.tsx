import type { Task, Project, Client } from "@/types";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  clients: Client[];
  onDeleteTask: (id: string) => void;
  isDeletingTask: boolean;
  onLoadTimer: (task: Task) => void;
}

export default function TaskList({
  tasks,
  projects,
  clients,
  onDeleteTask,
  isDeletingTask,
  onLoadTimer,
}: TaskListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          project={projects.find((p) => p.id === task.projectId)}
          client={clients.find((c) => c.id === task.clientId)}
          onDeleteTask={onDeleteTask}
          isDeleting={isDeletingTask}
          onLoadTimer={onLoadTimer}
        />
      ))}
    </div>
  );
}

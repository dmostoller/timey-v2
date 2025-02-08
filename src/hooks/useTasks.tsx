import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { useSession } from "next-auth/react";

const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch("/api/tasks");
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized - Please sign in");
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch tasks");
  }
  return res.json();
};

const addTask = async (
  task: Omit<Task, "id" | "userId" | "timeSpent" | "isRunning">,
): Promise<Task> => {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized - Please sign in");
    const error = await res.json();
    throw new Error(error.message || "Failed to add task");
  }
  return res.json();
};

const updateTask = async (
  task: Partial<Task> & { id: string },
): Promise<Task> => {
  const res = await fetch(`/api/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

const deleteTask = async (id: string): Promise<Task> => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete task");
  }
  return res.json();
};

export const useTasks = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey: ["tasks", session?.user?.email],
    queryFn: fetchTasks,
    enabled: !!session?.user?.email,
  });

  const addMutation = useMutation<
    Task,
    Error,
    Omit<Task, "id" | "userId" | "timeSpent" | "isRunning">
  >({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", session?.user?.email],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateMutation = useMutation<
    Task,
    Error,
    Partial<Task> & { id: string }
  >({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", session?.user?.email],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation<Task, Error, string>({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", session?.user?.email],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Optimistically update task properties in the client cache
  const optimisticUpdateTask = (task: Partial<Task> & { id: string }) => {
    console.log("Optimistic update:", task);
    queryClient.setQueryData<Task[]>(["tasks", session?.user?.email], (old) => {
      if (!old) return [];
      return old.map((t) => (t.id === task.id ? { ...t, ...task } : t));
    });
  };

  // Only update the database when the timer is stopped (isRunning is false)
  const handleUpdateTask = (task: Partial<Task> & { id: string }) => {
    // Only do optimistic updates for state changes (play/pause)
    // not for time updates
    if ("isRunning" in task) {
      optimisticUpdateTask(task);
    }

    // If stopping the timer or it's a non-time update, sync with database
    if (task.isRunning === false || !("timeSpent" in task)) {
      updateMutation.mutate(task);
    }
  };

  return {
    tasks,
    isLoading,
    isError,
    error,
    addTask: addMutation.mutate,
    updateTask: handleUpdateTask,
    optimisticUpdateTask,
    isAddingTask: addMutation.isPending,
    isUpdatingTask: updateMutation.isPending,
    deleteTask: deleteMutation.mutate,
    isDeletingTask: deleteMutation.isPending,
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project } from "@/types";
import { useSession } from "next-auth/react";

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch("/api/projects");
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please sign in");
    }
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch projects");
  }
  return res.json();
};

const addProject = async (
  project: Omit<Project, "id" | "userId">,
): Promise<Project> => {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please sign in");
    }
    const error = await res.json();
    throw new Error(error.message || "Failed to add project");
  }
  return res.json();
};

const updateProject = async (
  project: Partial<Project> & { id: string },
): Promise<Project> => {
  const res = await fetch(`/api/projects/${project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized - Please sign in");
    const error = await res.json();
    throw new Error(error.message || "Failed to update project");
  }
  return res.json();
};

const deleteProject = async (id: string): Promise<void> => {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized - Please sign in");
    const error = await res.json();
    throw new Error(error.message || "Failed to delete project");
  }
};

export const useProjects = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", session?.user?.email],
    queryFn: fetchProjects,
    enabled: !!session?.user?.email,
  });

  const mutation = useMutation<Project, Error, Omit<Project, "id" | "userId">>({
    mutationFn: addProject,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["projects", session?.user?.email],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", session?.user?.email],
      });
    },
  });

  const updateMutation = useMutation<
    Project,
    Error,
    Partial<Project> & { id: string }
  >({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", session?.user?.email],
      });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", session?.user?.email],
      });
    },
  });

  return {
    projects,
    isLoading,
    isError,
    error,
    addProject: mutation.mutate,
    isAddingProject: mutation.isPending,
    updateProject: updateMutation.mutate,
    isUpdatingProject: updateMutation.isPending,
    deleteProject: deleteMutation.mutate,
    isDeletingProject: deleteMutation.isPending,
  };
};

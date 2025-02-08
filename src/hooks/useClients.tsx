import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "@/types";
import { useSession } from "next-auth/react";

const fetchClients = async (): Promise<Client[]> => {
  const res = await fetch("/api/clients");
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please sign in");
    }
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch clients");
  }
  return res.json();
};

const addClient = async (
  client: Omit<Client, "id" | "userId">,
): Promise<Client> => {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please sign in");
    }
    const error = await res.json();
    throw new Error(error.message || "Failed to add client");
  }
  return res.json();
};

const deleteClient = async (id: string): Promise<void> => {
  const res = await fetch(`/api/clients/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please sign in");
    }
    const error = await res.json();
    throw new Error(error.message || "Failed to delete client");
  }
};

export const useClients = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery<Client[], Error>({
    queryKey: ["clients", session?.user?.email],
    queryFn: fetchClients,
    enabled: !!session?.user?.email,
  });

  const mutation = useMutation<Client, Error, Omit<Client, "id" | "userId">>({
    mutationFn: addClient,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["clients", session?.user?.email],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", session?.user?.email],
      });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", session?.user?.email],
      });
    },
  });

  return {
    clients,
    isLoading,
    isError,
    error,
    addClient: mutation.mutate,
    isAddingClient: mutation.isPending,
    deleteClient: deleteMutation.mutate,
    isDeletingClient: deleteMutation.isPending,
  };
};

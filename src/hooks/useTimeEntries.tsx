import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TimeEntry } from "@/types";
import { useSession } from "next-auth/react";

export const useTimeEntries = (
  startDate?: string,
  endDate?: string,
  taskId?: string,
) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const fetchTimeEntries = async (): Promise<TimeEntry[]> => {
    let url = "/api/time-entries";
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (taskId) params.append("taskId", taskId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch time entries");
    }
    return res.json();
  };

  const createTimeEntry = async (
    entry: Omit<TimeEntry, "id" | "userId" | "date">,
  ) => {
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to create time entry");
    return res.json();
  };

  const { data: timeEntries, ...queryRest } = useQuery<TimeEntry[], Error>({
    queryKey: ["timeEntries", session?.user?.email, startDate, endDate, taskId],
    queryFn: fetchTimeEntries,
    enabled: !!session?.user?.email,
  });

  const createMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timeEntries", session?.user?.email],
      });
    },
  });

  return {
    timeEntries,
    ...queryRest,
    createTimeEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

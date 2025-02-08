import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface GithubEventPayload {
  commits?: Array<{ message: string; sha: string }>;
  push_id?: number;
  size?: number;
  ref?: string;
  description?: string;
  master_branch?: string;
  action?: string;
}

interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload: GithubEventPayload;
}

export function useGithubActivity() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<GithubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchGithubActivity() {
      if (!session?.user?.email) return;

      try {
        const res = await fetch("/api/github/activity");
        if (!res.ok) throw new Error("Failed to fetch GitHub activity");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchGithubActivity();
  }, [session?.user?.email]);

  return { events, loading, error };
}

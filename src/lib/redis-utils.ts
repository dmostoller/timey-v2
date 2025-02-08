import { TimeEntry } from "@/types";
import redis from "./redis";

export const timeEntryKey = (email: string) => `timeEntries:${email}`;
export const timeEntryTaskKey = (email: string, taskId: string) =>
  `timeEntries:${email}:task:${taskId}`;

export async function getTimeEntriesByDateRange(
  email: string,
  startDate: string,
  endDate: string,
): Promise<TimeEntry[]> {
  const entries = (await redis.get<TimeEntry[]>(timeEntryKey(email))) || [];
  return entries.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate,
  );
}

export async function getTimeEntriesByTask(
  email: string,
  taskId: string,
): Promise<TimeEntry[]> {
  const entries = (await redis.get<TimeEntry[]>(timeEntryKey(email))) || [];
  return entries.filter((entry) => entry.taskId === taskId);
}

export async function addTimeEntry(
  email: string,
  entry: TimeEntry,
): Promise<TimeEntry> {
  const key = timeEntryKey(email);
  const entries = (await redis.get<TimeEntry[]>(key)) || [];
  entries.push(entry);
  await redis.set(key, entries);
  return entry;
}

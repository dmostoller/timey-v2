import { NextResponse } from "next/server";
import {
  getTimeEntriesByDateRange,
  getTimeEntriesByTask,
  addTimeEntry,
} from "@/lib/redis";
import { TimeEntry } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const taskId = searchParams.get("taskId");

    if (taskId) {
      const entries = await getTimeEntriesByTask(session.user.email, taskId);
      return NextResponse.json(entries);
    }

    if (startDate && endDate) {
      const entries = await getTimeEntriesByDateRange(
        session.user.email,
        startDate,
        endDate,
      );
      return NextResponse.json(entries);
    }

    // Get all entries if no filters are provided
    const entries = await getTimeEntriesByDateRange(
      session.user.email,
      "1970-01-01", // Beginning of time
      "2100-12-31", // Far future date
    );
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch time entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const newEntry: TimeEntry = {
      id: nanoid(),
      userId: session.user.email,
      ...data,
      date: new Date(data.startTime).toISOString().split("T")[0],
    };

    await addTimeEntry(session.user.email, newEntry);
    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      { message: "Failed to create time entry" },
      { status: 500 },
    );
  }
}

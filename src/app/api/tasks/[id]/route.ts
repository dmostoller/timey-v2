import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Task } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params resolution
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const taskKey = `tasks:${session.user.email}`;
    const tasks = (await redis.get<Task[]>(taskKey)) || [];
    const updatedData = await request.json();

    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Merge the updated data with the current task data
    // Removed any timeSpent logic since it's now tracked separately
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updatedData,
      isRunning:
        updatedData.isRunning !== undefined
          ? updatedData.isRunning
          : tasks[taskIndex].isRunning,
    };

    await redis.set(taskKey, tasks);
    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params resolution
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const taskKey = `tasks:${session.user.email}`;
    const tasks = (await redis.get<Task[]>(taskKey)) || [];

    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    await redis.set(taskKey, tasks);
    return NextResponse.json(deletedTask);
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 },
    );
  }
}

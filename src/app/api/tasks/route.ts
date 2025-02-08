import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Task } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const getTaskKey = (email: string) => `tasks:${email}`;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const taskKey = getTaskKey(session.user.email);
    const tasks = await redis.get<Task[]>(taskKey);
    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
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

    const { name, projectId, clientId } = await request.json();
    if (!name) {
      return NextResponse.json(
        { message: "Task name is required" },
        { status: 400 },
      );
    }

    const taskKey = getTaskKey(session.user.email);
    const id = uuidv4();
    const newTask: Task = {
      id,
      name,
      projectId,
      clientId,
      userId: session.user.email,
      isRunning: false,
    };

    const tasks = (await redis.get<Task[]>(taskKey)) || [];
    tasks.push(newTask);
    await redis.set(taskKey, tasks);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 },
    );
  }
}

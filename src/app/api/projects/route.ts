import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Project } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const getProjectKey = (email: string) => `projects:${email}`;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projectKey = getProjectKey(session.user.email);
    const projects = await redis.get<Project[]>(projectKey);
    return NextResponse.json(projects || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, hourlyRate } = await request.json();

    if (!name || !hourlyRate) {
      return NextResponse.json(
        { message: "Name and hourly rate are required" },
        { status: 400 },
      );
    }

    const projectKey = getProjectKey(session.user.email);
    const id = uuidv4();
    const newProject: Project = {
      id,
      name,
      hourlyRate: parseFloat(hourlyRate),
      userId: session.user.id,
    };

    const projects = (await redis.get<Project[]>(projectKey)) || [];
    projects.push(newProject);

    await redis.set(projectKey, projects);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 },
    );
  }
}

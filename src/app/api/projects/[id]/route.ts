import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Project } from "@/types";
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

    const projectKey = `projects:${session.user.email}`;
    const projects = (await redis.get<Project[]>(projectKey)) || [];
    const updatedData = await request.json();

    const projectIndex = projects.findIndex((project) => project.id === id);
    if (projectIndex === -1) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updatedData,
    };

    await redis.set(projectKey, projects);
    return NextResponse.json(projects[projectIndex]);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update project: " + error },
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

    const projectKey = `projects:${session.user.email}`;
    const projects = (await redis.get<Project[]>(projectKey)) || [];

    const projectIndex = projects.findIndex((project) => project.id === id);
    if (projectIndex === -1) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const updatedProjects = projects.filter((project) => project.id !== id);
    await redis.set(projectKey, updatedProjects);

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete project: " + error },
      { status: 500 },
    );
  }
}

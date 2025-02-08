import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${GITHUB_API}/users/${process.env.GITHUB_USERNAME}/events`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_PAT}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch GitHub activity");
    }

    const events = await res.json();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return NextResponse.json(
      { message: "Failed to fetch GitHub activity" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Client } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const clientKey = `clients:${session.user.email}`;
    const clients = (await redis.get<Client[]>(clientKey)) || [];

    const updatedClients = clients.filter((client) => client.id !== id);
    if (clients.length === updatedClients.length) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 },
      );
    }

    await redis.set(clientKey, updatedClients);
    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete client: " + error },
      { status: 500 },
    );
  }
}

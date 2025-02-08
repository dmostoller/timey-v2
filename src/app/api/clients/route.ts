import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Client } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const getClientKey = (email: string) => `clients:${email}`;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientKey = getClientKey(session.user.email);
    const clients = await redis.get<Client[]>(clientKey);
    return NextResponse.json(clients || []);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Failed to fetch clients" },
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

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    const clientKey = getClientKey(session.user.email);
    const id = uuidv4();
    const newClient: Client = {
      id,
      name,
      userId: session.user.id,
    };

    const clients = (await redis.get<Client[]>(clientKey)) || [];
    clients.push(newClient);

    await redis.set(clientKey, clients);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "Failed to create client" },
      { status: 500 },
    );
  }
}

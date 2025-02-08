import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    oauth2Client.setCredentials({
      access_token: session.user.accessToken,
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    // Get unread messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread in:inbox",
      maxResults: 10, // Limit to 10 messages
    });

    const messages = response.data.messages || [];
    const unreadCount = response.data.resultSizeEstimate || 0;

    // Get details for each message
    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });

        const headers = details.data.payload?.headers;
        return {
          id: message.id,
          subject: headers?.find((h) => h.name === "Subject")?.value,
          from: headers?.find((h) => h.name === "From")?.value,
          date: headers?.find((h) => h.name === "Date")?.value,
        };
      }),
    );

    return NextResponse.json({
      unreadCount,
      messages: messageDetails,
    });
  } catch (error) {
    console.error("Error fetching unread emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread emails" },
      { status: 500 },
    );
  }
}

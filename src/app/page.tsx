import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TimeTracker from "@/components/TimeTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("Session data:", session);

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Freelance Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to access your time tracking data.</p>
        </CardContent>
      </Card>
    );
  }

  return <TimeTracker />;
}

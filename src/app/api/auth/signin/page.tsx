"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign in to Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full"
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginButton } from "@/components/LoginButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <header className="max-w-screen-xl mx-auto p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={session?.user?.image || "/logo.png"}
              alt={session?.user?.name || "Timey Time Logo"}
            />
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || "TT"}
            </AvatarFallback>
          </Avatar>
          {session?.user ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {session.user.email}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-sm font-medium">Timey Time</span>
              <span className="text-xs text-muted-foreground">
                Time Tracking Made Simple
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <LoginButton />
        <ThemeToggle />
      </div>
    </header>
  );
}

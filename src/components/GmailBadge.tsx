"use client";

import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGmail } from "../hooks/useGmail";
import type { GmailBadgeProps } from "../types/gmail";

export function GmailBadge({ refreshInterval = 60000 }: GmailBadgeProps) {
  const { unreadCount, isLoading, error } = useGmail(refreshInterval);

  const handleClick = () => {
    window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative h-12 w-12"
      onClick={handleClick}
      title="Open Gmail"
    >
      <Mail className="h-8 w-8" />
      {!isLoading && !error && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 px-2 py-1 text-xs"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
}

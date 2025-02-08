"use client"

import { useState, useEffect } from "react"
import type { UseGmailResult } from "../types/gmail"

export function useGmail(refreshInterval = 60000): UseGmailResult {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/gmail/unread")
        if (!response.ok) {
          throw new Error("Failed to fetch unread count")
        }
        const data = await response.json()
        if (isMounted) {
          setUnreadCount(data.unreadCount)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("An error occurred"))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUnreadCount()
    const intervalId = setInterval(fetchUnreadCount, refreshInterval)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [refreshInterval])

  return { unreadCount, isLoading, error }
}


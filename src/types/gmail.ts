export interface GmailBadgeProps {
  refreshInterval?: number
}

export interface UseGmailResult {
  unreadCount: number
  isLoading: boolean
  error: Error | null
}


export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

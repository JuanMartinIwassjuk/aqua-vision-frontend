export interface Notification {
  id: number;
  homeId: number;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'event' | 'reminder';
  createdAt: Date;
  isRead: boolean;
}
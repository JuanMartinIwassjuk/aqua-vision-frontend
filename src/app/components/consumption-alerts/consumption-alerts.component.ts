import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Notification } from '../../models/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consumption-alerts',
  imports: [CommonModule],
  templateUrl: './consumption-alerts.component.html',
  styleUrl: './consumption-alerts.component.css'
})
export class ConsumptionAlertsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  homeId :number = 1;
  unreadCount = 0;
  deletingIds = new Set<number>();

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    const hid = this.homeService.getHomeId?.() ?? 1;
    this.homeId = hid ?? 1;
    this.loadNotifications();
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  loadNotifications(): void {
    this.loading = true;



    this.homeService.getNotifications(this.homeId).subscribe({
      next: (data: Notification[]) => {
        this.notifications = (data || []).map(d => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        }));
        this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        this.updateUnreadCount();
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando notificaciones', err);
        this.notifications = [];
        this.updateUnreadCount();
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification || notification.isRead) return;

    notification.isRead = true;
    this.updateUnreadCount();

    this.homeService.markAsRead(notification.id).subscribe({
      error: () => {
        notification.isRead = false;
        this.updateUnreadCount();
      }
    });
  }

  markAllAsRead(): void {
    if (this.notifications.length === 0) return;

    const confirmAll = true;
    if (!confirmAll) return;

    this.notifications.forEach(n => n.isRead = true);
    this.updateUnreadCount();

    this.homeService.markAllAsRead(this.homeId).subscribe({
      error: () => this.loadNotifications()
    });
  }

  deleteNotification(notification: Notification): void {
    if (!notification) return;
    const ok = confirm('¿Seguro que querés eliminar esta notificación?');
    if (!ok) return;

    this.deletingIds.add(notification.id);

    this.homeService.deleteNotification(notification.id).subscribe({
      next: () => {
        setTimeout(() => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.deletingIds.delete(notification.id);
          this.updateUnreadCount();
        }, 360);
      },
      error: () => {
        this.deletingIds.delete(notification.id);
        alert('No se pudo eliminar la notificación.');
      }
    });
  }

  deleteAllNotifications(): void {
    if (this.notifications.length === 0) return;

    const ok = confirm('¿Seguro que querés eliminar TODAS las notificaciones?');
    if (!ok) return;

    this.notifications.forEach(n => this.deletingIds.add(n.id));

    this.homeService.deleteAllNotifications(this.homeId).subscribe({
      next: () => {
        setTimeout(() => {
          this.notifications = [];
          this.deletingIds.clear();
          this.updateUnreadCount();
        }, 420);
      },
      error: () => {
        this.deletingIds.clear();
        alert('No se pudieron eliminar todas las notificaciones.');
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'alert': return '⚠️';
      case 'info': return 'ℹ️';
      case 'event': return '🎉';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  }

getCardClass(n: Notification): string {
  const base = 'notif-card';
  if (this.deletingIds.has(n.id)) return `${base} deleting`;
  if (!n.isRead && n.type === 'alert') return `${base} pulse-alert-laser`;
  if (!n.isRead && n.type === 'event') return `${base} pulse-green`;
  return base;
}


  timeAgo(date: Date): string {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }

  onCardClick(n: Notification, event?: MouseEvent): void {
    const target = event?.target as HTMLElement;
    if (target && (target.closest('button') || target.tagName === 'BUTTON' || target.closest('.action-btn'))) return;
    this.markAsRead(n);
  }

  hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  
}
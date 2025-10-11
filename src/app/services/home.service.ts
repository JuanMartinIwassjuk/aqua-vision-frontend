import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { Sector } from '../models/sector';
import { Notification } from '../models/notification';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

   private mockNotifications: Notification[] = [
    {
      id: 1,
      homeId: 1,
      title: 'Fuga detectada en el baño',
      message: 'Se ha detectado un consumo anómalo en el sector baño. Revisa el flujo de agua.',
      type: 'alert',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      isRead: false
    },
    {
      id: 2,
      homeId: 1,
      title: 'Consumo diario dentro del promedio',
      message: 'Tu consumo de hoy está dentro del rango normal.',
      type: 'info',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true
    },
    {
      id: 3,
      homeId: 1,
      title: 'Evento de ahorro detectado',
      message: 'Se redujo el consumo nocturno en un 12% respecto a ayer. ¡Excelente!',
      type: 'event',
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      isRead: false
    },
    {
      id: 4,
      homeId: 1,
      title: 'Recordatorio: mantenimiento del tanque',
      message: 'Hace 3 meses desde el último mantenimiento. Se recomienda revisar el tanque.',
      type: 'reminder',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: false
    }
  ];


  
  private readonly STORAGE_KEY = 'homeId';
  private homeIdSubject: BehaviorSubject<number | null>;
  homeId$: Observable<number | null>;

  constructor(private userService: UserService,private http: HttpClient) {
    const storedHomeId = sessionStorage.getItem(this.STORAGE_KEY);
    const initialValue = storedHomeId ? Number(storedHomeId) : null;

    this.homeIdSubject = new BehaviorSubject<number | null>(initialValue);
    this.homeId$ = this.homeIdSubject.asObservable();
  }

  initHomeId(): void {

      this.userService.getAuthenticatedHomeId().subscribe({
        next: (id) => {
          this.setHomeId(id);
        },
        error: (err) => {
          console.error('Error obteniendo homeId', err);
        }
      });

  }

  public getHomeId(): number | null {
    return this.homeIdSubject.value;
  }

  public setHomeId(id: number | null): void {
    if (id !== null) {
      sessionStorage.setItem(this.STORAGE_KEY, String(id));
    } else {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
    this.homeIdSubject.next(id);
  }

    getSectorsByHomeId(homeId: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`http://localhost:8080/hogares/${homeId}/sectores`);
  }



getNotifications(homeId: number): Observable<Notification[]> {

  const allNotifications = this.mockNotifications.map(n => ({ ...n }));

  console.log('Resultado:', allNotifications);

  return of(allNotifications).pipe(delay(450));
}



  getUnreadNotifications(homeId: number): Observable<Notification[]> {
    return this.getNotifications(homeId).pipe(
      map(list => list.filter(n => !n.isRead))
    );
  }


  markAsRead(notificationId: number): Observable<Notification | null> {
    const notif = this.mockNotifications.find(n => n.id === notificationId);
    if (!notif) {

      return of(null).pipe(delay(300));
    }
    notif.isRead = true;

    return of({ ...notif }).pipe(delay(300));
  }


  markAllAsRead(homeId: number): Observable<boolean> {
    this.mockNotifications.forEach(n => {
      if (n.homeId === homeId) n.isRead = true;
    });
    return of(true).pipe(delay(350));
  }


  deleteNotification(notificationId: number): Observable<boolean> {
    const idx = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (idx === -1) {

      return of(false).pipe(delay(300));
    }

    this.mockNotifications.splice(idx, 1);
    return of(true).pipe(delay(360));
  }


  deleteAllNotifications(homeId: number): Observable<boolean> {
    const beforeCount = this.mockNotifications.length;
    this.mockNotifications = this.mockNotifications.filter(n => n.homeId !== homeId);
    const afterCount = this.mockNotifications.length;
    const removed = beforeCount - afterCount;

    return of(true).pipe(delay(420));
  }



  createNotification(payload: Omit<Notification, 'id' | 'createdAt'>): Observable<Notification> {
    const newNotif: Notification = {
      id: 14,
      homeId: payload.homeId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      createdAt: new Date(),
      isRead: !!payload.isRead
    };
    this.mockNotifications.unshift(newNotif);
    return of({ ...newNotif }).pipe(delay(300));
  }


  deleteAll(homeId: number): Observable<boolean> {
    return this.deleteAllNotifications(homeId);
  }
}

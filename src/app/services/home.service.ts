import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { Sector } from '../models/sector';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
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
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private homeIdSubject = new BehaviorSubject<number | null>(null);
  homeId$: Observable<number | null> = this.homeIdSubject.asObservable();

  constructor(private userService: UserService) {}

  initHomeId(): void {
    if (this.homeIdSubject.value === null) {
      this.userService.getAuthenticatedHomeId().subscribe({
        next: (id) => {
          this.homeIdSubject.next(id);
        },
        error: (err) => {
        }
      });
    }
  }

  public getHomeId(): number | null {
    return this.homeIdSubject.value;
  }
}


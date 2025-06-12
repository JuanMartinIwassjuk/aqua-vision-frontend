import { Injectable } from '@angular/core';
import { User } from '../../models/user';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urlBackend = 'http://localhost:8080/users'

  constructor(private http: HttpClient) { 

  }

  findAll(): Observable<User[]> {
    return this.http.get(this.urlBackend).pipe(
      map((response: any) => response as User[])
    );
  }
  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBackend}/${id}`);
  }


  create(user: User): Observable<User> {
    return this.http.post<User>(this.urlBackend, user).pipe(
      map((response: any) => response as User)
    );
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.urlBackend}/${user.id}`, user).pipe(
      map((response: any) => response as User)
    );
  }
}

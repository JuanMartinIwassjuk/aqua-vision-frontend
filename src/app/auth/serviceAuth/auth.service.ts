import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeService } from '../../services/home.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private homeService: HomeService) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }


  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }


  getToken(): string | null {
    const token = sessionStorage.getItem('token');
    console.log('Token obtenido:', token);  
    return token;

  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.homeService.removeHomeId();
  }

  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (e) {
      console.error('Error decodificando token', e);
      return null;
    }
  }


  isAdmin(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.authorities) return false;
    let roles = decoded.authorities;
    if (typeof roles === 'string') {
      try {
        roles = JSON.parse(roles);
      } catch {
        return false;
      }
    }
    return roles.some((r: any) => r.authority === 'ROLE_ADMIN');
  }

  isUser(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.authorities) return false;

    let roles = decoded.authorities;
    if (typeof roles === 'string') {
      try {
        roles = JSON.parse(roles);
      } catch {
        return false;
      }
    }
    return roles.some((r: any) => r.authority === 'ROLE_USER');
  }
}

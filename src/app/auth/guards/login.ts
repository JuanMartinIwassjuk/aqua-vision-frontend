// login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../serviceAuth/auth.service'; // Ajusta la ruta según tu proyecto

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return true;
    } else {
      // Redirecciona a la ruta por defecto, por ejemplo 'users'
      return this.router.createUrlTree(['/users']);
    }
  }
}

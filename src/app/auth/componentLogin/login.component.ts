import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../serviceAuth/auth.service'; // Asegúrate de que la ruta sea la correcta
import { NgIf } from '@angular/common';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = ''; 
constructor(
  private authService: AuthService,
  private homeService: HomeService, 
  private router: Router
) {}

onLogin(): void {
  this.authService.login(this.username, this.password).subscribe(
    (response) => {
      this.authService.setToken(response.token);
      console.log(response.message);
   
      this.homeService.initHomeId();

      this.router.navigate(['/dashboard']);
    }, 
    (error) => {
      console.error('Error during login:', error);
      this.errorMessage = 'Usuario o contraseña incorrecta';
    }
  );
}

}

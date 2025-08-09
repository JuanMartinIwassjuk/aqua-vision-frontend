import { Component } from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  imports: [],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent {

  constructor(private authService: AuthService, private router: Router){

  }

   logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}

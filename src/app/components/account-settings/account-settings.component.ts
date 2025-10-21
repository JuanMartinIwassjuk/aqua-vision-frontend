import { Component, ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef} from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { HomeService } from '../../services/home.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule],
  templateUrl: './account-settings.component.html',
  styleUrls: [
    './account-settings.component.css',
    './normalize.css',
    './webflow.css',
    './aquavision-portal-usuarios.webflow.css'
  ],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('modalAnimation', [
      state('open', style({ opacity: 1, transform: 'scale(1)' })),
      state('closed', style({ opacity: 0, transform: 'scale(0.8)' })),
      transition('closed => open', [animate('300ms ease-out')]),
      transition('open => closed', [animate('300ms ease-in')])
    ])]
})
export class AccountSettingsComponent {

  activeModal: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private homeService: HomeService,
    private userService: UserService
  ){  }

   logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(id: string) {
    console.log('Abriendo modal: ', id)
    this.activeModal = id;
  }

  closeModal() {
    this.activeModal = null;
  }

  user: User | null = null;
  /*sensores: Sensor[] = [];*/

  ngOnInit(): void {
    this.userService.getAuthenticatedUser().subscribe({
      next: (u) => this.user = u,
      error: (err) => console.error('Error al obtener usuario', err)
    });

    /*
    const idUsuario = this.authService.getUsuarioId();
    this.sensorService.getSensoresUsuario(idUsuario).subscribe({
      next: (data) => this.sensores = data,
      error: (err) => console.error(err)
    */
  }

}

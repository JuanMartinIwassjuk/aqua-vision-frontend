import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef, HostListener} from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { HomeService } from '../../services/home.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

import { CuentaService } from '../../services/cuenta.service';
import { Hogar } from '../../models/hogar';
import { Facturacion } from '../../models/facturacion';
import { Sensor } from '../../models/sensor';

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
export class AccountSettingsComponent implements OnInit{

  activeModal: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private homeService: HomeService,
    private userService: UserService,
    private cuentaService: CuentaService
  ){  }

   logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(id: string) {
    console.log('Abriendo modal: ', id)
    this.activeModal = id;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    this.closeModal();
  }

  closeModal() {
    this.activeModal = null;
  }

  user?: User;
  hogar?: Hogar;
  facturacion?: Facturacion;
  sensores: Sensor[] = [];
  /*usuario?: User;*/


  ngOnInit(): void {
    this.userService.getAuthenticatedUser().subscribe({
      next: (u) => this.user = u,
      error: (err) => console.error('Error al obtener usuario', err)
    });

    this.homeService.waitForHomeId().subscribe({
      next: (hogarId: number) => {
        console.log('Hogar ID obtenido:', hogarId);
       this.cargarDatos(hogarId);
      },
      error: (err) => console.error('Error al obtener hogarId', err)
    });

  }

  descargarManual() {
    const link = document.createElement('a');
    link.href = 'files/Manual_de_usuario.pdf';
    link.download = 'Manual_Sensor.pdf';
    link.click();
  }

  irASoporte() {
    window.open('https://aquavision-comercial.webflow.io/contacto', '_blank');
  }

  cargarDatos(hogarId:number): void {
    this.cuentaService.getUsuario(hogarId).subscribe(data => this.user = data);
    this.cuentaService.getHogar(hogarId).subscribe(data => this.hogar = data);
    this.cuentaService.getFacturacion(hogarId).subscribe(data => this.facturacion = data);
    this.cuentaService.getSensores(hogarId).subscribe(data => this.sensores = data);
  }
}

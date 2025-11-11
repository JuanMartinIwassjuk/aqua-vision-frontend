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

import { GamificacionService } from '../../services/gamificacion.service';
import { Logro } from '../../models/logro';

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
    private cuentaService: CuentaService,
    private gamificacionService: GamificacionService
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
       this.cargarLogros(hogarId);
      },
      error: (err) => console.error('Error al obtener hogarId', err)
    });

  }

  descargarManual() {
    const link = document.createElement('a');
    link.href = 'files/Manual_usuario_Aquavision_v1.0.pdf';
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

  logros: Logro[] = [
    { nombre: 'Registro', descripcion: 'Te registraste en AquaVision'},
    { nombre: 'Primer sensor', descripcion: 'Instalaste tu primer sensor'},
    { nombre: 'Primer ahorro', descripcion: 'Reduciste tu consumo de agua'},
    { nombre: 'Sabio acuatico', descripcion: 'Participaste en 7 trivias seguidas', pista: 'Completa todas las trivia durante una semana entera para conseguir este logro'},
    { nombre: 'Primer Reto', descripcion: 'Completá tu primera trivia', pista: 'Participá en una trivia para conseguir este logro' },
    { nombre: 'Eco Heroe', descripcion: 'Ahorra agua durante 7 días seguidos', pista: 'Controlá tu consumo diario en el dashboard' }
  ];

  logrosDesbloqueados: Logro[] = [];
  
  cargarLogros(hogarId: number): void {
    this.gamificacionService.getLogros(hogarId).subscribe({
      next: (data) => {
        this.logrosDesbloqueados = data;
        console.log('Logros desbloqueados:', data);
      },
      error: (err) => console.error('Error al cargar logros', err)
    });
  }

  esLogroDesbloqueado(nombre: string): boolean {
    return this.logrosDesbloqueados.some(l => l.nombre === nombre);
  }

  tooltipVisible = false;
  tooltipText = '';
  tooltipX = 0;
  tooltipY = 0;

  showTooltip(event: MouseEvent, logro: Logro): void {
    console.log('entro a show pero no a if');
    if (!this.esLogroDesbloqueado(logro.nombre)) {
      console.log('entro a if en show');
      this.tooltipText = logro.pista || 'Completa más desafíos para desbloquear este logro';
      this.tooltipVisible = true;
      this.moveTooltip(event);
      console.log('hover sobre', logro.nombre)
    }
  }

  moveTooltip(event: MouseEvent): void {
    this.tooltipX = event.clientX + 10;
    this.tooltipY = event.clientY + 10;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

}

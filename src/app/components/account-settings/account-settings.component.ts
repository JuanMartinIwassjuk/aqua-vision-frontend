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
    { nombre: 'Registro', descripcion: 'Te registraste en AquaVision', pista: 'El viaje comienza con el primer paso.'},
    { nombre: 'Primer sensor', descripcion: 'Instalaste tu primer sensor', pista: 'Conecta tu primer ojo bajo el agua.'},
    { nombre: 'Primer ahorro', descripcion: 'Reduciste tu consumo de agua', pista: 'La primera gota que no se desperdicia es la más significativa.'},
    { nombre: 'Sabio acuatico', descripcion: 'Participaste en 7 trivias seguidas', pista: 'Demuestra tu constancia al aceptar todos los desafíos semanales.'},
    { nombre: 'Primer Reto', descripcion: 'Completá tu primera trivia', pista: 'Poné a prueba tu conocimiento participando en una trivia.' },
    { nombre: 'Eco Heroe', descripcion: 'Ahorra agua durante 7 días seguidos', pista: 'Siete amaneceres de compromiso con el planeta.' }
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
    if (!this.esLogroDesbloqueado(logro.nombre)) {
      this.tooltipText = logro.pista || 'Completa más desafíos para desbloquear este logro';
      this.tooltipVisible = true;
      this.moveTooltip(event);
      console.log('hover sobre', logro.nombre)
    }
  }

  moveTooltip(event: MouseEvent): void {
    const tooltipWidth = 300; // Mantenemos el mismo max-width definido en CSS
    const offset = 15; // Distancia estándar desde el cursor
    const minMargin = 5; // Margen mínimo desde el borde izquierdo de la pantalla (para que no se pegue al borde)

    // 1. Obtener el ancho de la ventana
    const windowWidth = window.innerWidth;

    let newX = event.pageX + offset; // Posición inicial por defecto (a la derecha del cursor)

    // 2. VERIFICACIÓN DEL BORDE DERECHO
    // Si el tooltip se sale por la derecha, lo posicionamos a la izquierda del cursor.
    if (event.pageX + offset + tooltipWidth > windowWidth) {
      newX = event.pageX - tooltipWidth - offset;
    }
    
    // 3. VERIFICACIÓN DEL BORDE IZQUIERDO (¡NUEVO!)
    // Si después de cualquier ajuste, la posición resultante es menor que el margen mínimo (newX < minMargin),
    // significa que el tooltip se está saliendo por la izquierda. Lo ajustamos al margen.
    if (newX < minMargin) {
      newX = minMargin;
    }
    
    this.tooltipX = newX;
    this.tooltipY = event.pageY + offset;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

}

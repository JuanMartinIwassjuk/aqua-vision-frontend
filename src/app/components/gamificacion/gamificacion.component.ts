import { Component, ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef, OnInit, HostListener} from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RouterModule } from '@angular/router';

import { HomeService } from '../../services/home.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

import { Hogar } from '../../models/hogar';

import { GamificacionService } from '../../services/gamificacion.service';
import { HogarRanking, Recompensa } from '../../models/gamificacion';

@Component({
  selector: 'app-gamificacion',
  imports: [CommonModule, RouterModule],
  templateUrl: './gamificacion.component.html',
  styleUrl: './gamificacion.component.css',
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

export class GamificacionComponent implements OnInit{

  activeModal: string | null = null;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private homeService: HomeService,
    private userService: UserService,
    private gamificacionService: GamificacionService
  ){  }
  
  @ViewChild('medallasModal') medallasModal!: TemplateRef<any>;
  
  modalTemplates: { [key: string]: TemplateRef<any> } = {};
  
  ngAfterViewInit(): void {
    // prevenir navegación en los anchors
    const anchors = document.querySelectorAll('a[href="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (event) => event.preventDefault());
    });
  
    this.modalTemplates = {
      medallas: this.medallasModal,
    };
  }
  
  openModal(id: string) {
    this.activeModal = id;
  }
  
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    this.closeModal();
  }

  closeModal() {
    this.activeModal = null;
  }

  user: User | null = null;

  trivias = [
    { id: 1, nombre: 'Trivia 1', diaSemana: 1, completado: true },
    { id: 2, nombre: 'Trivia 2', diaSemana: 2, completado: true },
    { id: 3, nombre: 'Trivia 3', diaSemana: 3, completado: false },
    { id: 4, nombre: 'Trivia 4', diaSemana: 4, completado: true },
    { id: 5, nombre: 'Trivia 5', diaSemana: 5, completado: false },
    { id: 6, nombre: 'Trivia 6', diaSemana: 6, completado: false },
    { id: 7, nombre: 'Trivia 7', diaSemana: 7, completado: false },
    ];

  diaActual: number = 0;
  tiempoRestante: string = '';

  actualizarTiempoRestante() {
    const ahora = new Date();
    const proximoDia = new Date();
    proximoDia.setDate(ahora.getDate() + 1);
    proximoDia.setHours(0, 0, 0, 0);

    const diff = proximoDia.getTime() - ahora.getTime();

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    this.tiempoRestante = `${horas}h ${minutos}m ${segundos}s`;
  }

  ngOnInit(): void {
    this.userService.getAuthenticatedUser().subscribe({
      next: (u) => this.user = u,
      error: (err) => console.error('Error al obtener usuario', err)
    });  

    // Calcular día actual (lunes=1 ... domingo=7)
    const hoy = new Date().getDay();
    this.diaActual = hoy === 0 ? 7 : hoy;

    this.actualizarTiempoRestante();
    setInterval(() => this.actualizarTiempoRestante(), 1000);

    this.homeService.waitForHomeId().subscribe({
      next: (hogarId: number) => {
        console.log('Hogar ID obtenido:', hogarId);
       this.cargarPuntos(hogarId);
      },
      error: (err) => console.error('Error al obtener hogarId', err)
    });

    this.cargarRanking();
    this.cargarRecompensas();

  }    

  tooltipVisible = false;
  tooltipText = '';
  tooltipX = 0;
  tooltipY = 0;

  private intervalId: any = null;

  /**
   * Calcula el tiempo restante hasta el inicio del día de la trivia.
   */
  calcularTiempoRestante(diaTrivia: number): string {
    const ahora = new Date();
    const diaActual = this.diaActual;

    let diasFaltantes = diaTrivia - diaActual;
    if (diasFaltantes < 0) diasFaltantes += 7; // por si se cruza de semana

    const proximoDia = new Date();
    proximoDia.setDate(ahora.getDate() + diasFaltantes);
    proximoDia.setHours(0, 0, 0, 0);

    const diff = proximoDia.getTime() - ahora.getTime();

    if (diff <= 0) return 'Disponible ahora';

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    let texto = '';
    if (dias > 0) texto += `${dias}d `;
    texto += `${horas}h ${minutos}m ${segundos}s`;
    return texto;
  }

  showTooltip(event: MouseEvent, trivia: any) {
    this.tooltipVisible = true;
    this.moveTooltip(event);

    // Limpiar intervalos previos
    if (this.intervalId) clearInterval(this.intervalId);

    // Actualizar cada segundo para esa trivia puntual
    this.tooltipText = `Disponible en ${this.calcularTiempoRestante(trivia.diaSemana)}`;
    this.intervalId = setInterval(() => {
      this.tooltipText = `Disponible en ${this.calcularTiempoRestante(trivia.diaSemana)}`;
    }, 1000);
  }

  moveTooltip(event: MouseEvent) {
    this.tooltipX = event.pageX + 15;
    this.tooltipY = event.pageY + 15;
  }

  hideTooltip() {
    this.tooltipVisible = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  hogar?: Hogar;

  cargarPuntos(hogarId:number): void {
    this.homeService.getPuntosHogar(hogarId).subscribe(data => this.hogar = data);
  }

  rankingHogares: HogarRanking[] = [];
  top5Hogares: HogarRanking[] = [];
  recompensas: Recompensa[] = [];

  cargarRanking(): void {
    this.gamificacionService.getRanking().subscribe({
      next: (data) => {
        const hogaresOrdenados = data.hogares.sort((a, b) => b.puntaje_ranking - a.puntaje_ranking);

        let ultimaPosicion = 0;
        let ultimoPuntaje: number | null = null;
        let conteo = 0;

        this.rankingHogares = hogaresOrdenados.map((hogar) => {
          conteo++;

          // Si el puntaje es distinto al anterior, se actualiza la posición
          if (hogar.puntaje_ranking !== ultimoPuntaje) {
            ultimaPosicion = conteo;
            ultimoPuntaje = hogar.puntaje_ranking;
          }
          return {
            ...hogar,
            posicion: ultimaPosicion
          };
        });

      this.top5Hogares = this.rankingHogares.slice(0, 5);
      },
      error: (err) => console.error('Error al cargar ranking', err)
    });
  }

  cargarRecompensas(): void {
    this.gamificacionService.getRecompensas().subscribe({
      next: (data) => this.recompensas = data,
      error: (err) => console.error('Error al cargar recompensas', err)
    });
  }

}

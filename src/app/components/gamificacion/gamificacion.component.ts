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
import { HogarRanking, Recompensa, RecompensaCanjeada } from '../../models/gamificacion';
import { Medalla } from '../../models/medalla';

import { Desafio } from '../../models/desafio';
import { Observable, BehaviorSubject, switchMap, tap, map } from 'rxjs';

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
        this.homeService.getHogar(hogarId).subscribe({
          next: (hogarFull) => {
            this.hogar = hogarFull;
            this.cargarRecompensasCanjeadas(hogarFull);
          }
        });
        this.cargarPuntos(hogarId);
        this.cargarRecompensasGlobales();
        this.cargarDesafiosPorHogar(hogarId);
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

  tooltipVisibleMedalla = false;
  tooltipTextMedalla = '';
  tooltipXMedalla = 0;
  tooltipYMedalla = 0;

  /*Calcula el tiempo restante hasta el inicio del día de la trivia.*/
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

  /* LOGICA PARA TOOLTIP DE TRIVIAS */
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
    const tooltipWidth = 300; // Usamos el max-width definido en CSS
    const offset = 20; // Distancia desde el cursor
  
    // Obtener el ancho de la ventana
    const windowWidth = window.innerWidth;

    // Si la posición del mouse + el ancho del tooltip excede el ancho de la ventana,
    // posiciona el tooltip a la izquierda
    if (event.pageX + offset + tooltipWidth > windowWidth) {
      // Posicionar a la izquierda
      this.tooltipX = event.pageX - tooltipWidth - offset;
    } else {
      // Posicionar a la derecha (normal)
      this.tooltipX = event.pageX + offset;
    }
  
    this.tooltipY = event.pageY + offset;
  }

  hideTooltip() {
    this.tooltipVisible = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /* LOGICA PARA TOOLTIP DE MEDALLAS */
  showTooltipMedalla(event: MouseEvent, medalla: any) {
    this.tooltipVisibleMedalla = true;
    this.moveTooltipMedalla(event);
    this.tooltipTextMedalla = medalla.descripcion || 'Medalla bloqueada';
  }

  moveTooltipMedalla(event: MouseEvent): void {
    const tooltipWidth = 280;  // un poco más angosto que logros
    const offset = 20;         // leve separación del cursor
    const minMargin = 5;       // margen mínimo con el borde
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newX = event.pageX + offset; 
    let newY = event.pageY + offset;

    if (event.pageX + offset + tooltipWidth > windowWidth) {
      newX = event.pageX - tooltipWidth - offset;
    }

    if (newX < minMargin) {
      newX = minMargin;
    }

    const tooltipHeight = 80;
    if (event.clientY + tooltipHeight + offset > windowHeight) {
      newY = event.pageY - tooltipHeight - offset;
    }

    if (newY < minMargin) {
      newY = minMargin;
    }

    this.tooltipXMedalla = newX;
    this.tooltipYMedalla = newY;
  }

  hideTooltipMedalla() {
    this.tooltipVisibleMedalla = false;
  }

  hogar?: Hogar;

  cargarPuntos(hogarId:number): void {
    this.homeService.getPuntosHogar(hogarId).subscribe(data => this.hogar = data);
  }

  rankingHogares: HogarRanking[] = [];
  top5Hogares: HogarRanking[] = [];
  recompensas: Recompensa[] = [];

  recompensasCanjeadas = new Set<number>();
  isLoadingCanje: { [id: number]: boolean } = {};

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

  cargarRecompensasGlobales(): void {
    this.gamificacionService.getRecompensas().subscribe({
      next: (data) => this.recompensas = data,
      error: (err) => console.error('Error al cargar recompensas globales', err)
    });
  }

  cargarRecompensas(hogarId?: number): void {
    this.gamificacionService.getRecompensas().subscribe({
      next: (data) => this.recompensas = data,
      error: (err) => console.error('Error al cargar recompensas', err)
    });
  }

  cargarRecompensasCanjeadas(hogar: Hogar): void {
    if (hogar.recompensas) {
      hogar.recompensas.forEach((r: RecompensaCanjeada) => {
        if (r.estado === 'CANJEADO' || r.estado === 'RECLAMADO') {
          this.recompensasCanjeadas.add(r.recompensa.id);
        }
      });
    }
  }

  puedeCanjear(r: Recompensa): boolean {
    if (!this.hogar) return false;
    if (this.recompensasCanjeadas.has(r.id)) return false;
    return this.hogar.puntos >= r.puntosNecesarios;
  }


  canjear(recompensa: Recompensa) {
    console.log('Entro a canjear');
    if (!this.hogar?.id) {
      alert('No se encontró el hogar. Intenta recargar la página.');
      return;
    }

    const id = recompensa.id;
    const puntosNecesarios = recompensa.puntosNecesarios;

    if (this.recompensasCanjeadas.has(id)) return;
    if (this.hogar.puntos < puntosNecesarios) {
      alert('No tenés suficientes puntos para canjear esta recompensa.');
      console.log('Puntos del hogar: ', this.hogar.puntos);
      return;
    }

    this.isLoadingCanje[id] = true;

    this.gamificacionService.canjearRecompensa(this.hogar.id, id).subscribe({
      next: (res) => {
        this.hogar!.puntos -= puntosNecesarios;
        this.recompensasCanjeadas.add(id);
        this.isLoadingCanje[id] = false;
        alert(`Recompensa canjeada: ${recompensa.descripcion}`);
      },
      error: (err) => {
        console.error('Error al canjear recompensa', err);
        this.isLoadingCanje[id] = false;
      }
    });
  }

  //MUCHAS DE ESTAS MEDALLAS EN REALIDAD SON MAS LOGROS QUE MEDALLA PERO ES 
  //POR TENER ALGO Y ME LO TIRO GPT COMO PARA QUE NO QUEDAN DOS MEDALLAS SOLAS
  medallas: Medalla[] = [
    { nombre: 'Ahorro Semanal', descripcion: 'Reduciste tu consumo durante una semana completa.' },
    { nombre: 'Consumo Eficiente', descripcion: 'Mantuviste un consumo óptimo durante un mes.' },
    { nombre: 'Guardian del Agua', descripcion: 'Completaste todos los desafíos mensuales.' },
    { nombre: 'Participante Activo', descripcion: 'Participaste en todas las trivias del mes.' },
    { nombre: 'Sensor Maestro', descripcion: 'Instalaste más de 3 sensores en tu hogar.' }
  ];

  medallasDesbloqueadas: Medalla[] = [];

  cargarMedallas(hogarId: number): void {
    this.gamificacionService.getMedallas(hogarId).subscribe({
      next: (data) => {
        this.medallasDesbloqueadas = data;
        console.log('Medallas desbloqueadas:', data);
      },
      error: (err) => console.error('Error al cargar medallas', err)
    });
  }

  esMedallaDesbloqueada(nombre: string): boolean {
    return this.medallasDesbloqueadas.some(m => m.nombre === nombre);
  }

  desafios: Desafio[] = []; 
  desafiosPendientes: Desafio[] = []; 
  desafiosCompletados: Desafio[] = []; 

  isLoadingDesafio: { [id: number]: boolean } = {};

  /**
    * Carga todos los desafíos de un hogar y los almacena en la propiedad 'desafios'.
    * @param hogarId El ID del hogar.
    */
  cargarDesafiosPorHogar(hogarId: number): void {
    this.gamificacionService.getDesafiosPorHogar(hogarId).subscribe({
      next: (data) => {
        this.desafios = data;

        this.desafiosPendientes = data.filter(d => d.puntosRecompensa > 0);
        //this.desafiosPendientes = data.filter(d => !d.completado);
        this.desafiosCompletados = data.filter(d => d.completado);
        
        console.log(`Cargados: ${this.desafios.length} desafíos.`);
        console.log(`Pendientes: ${this.desafiosPendientes.length}`);
        console.log(`Completados: ${this.desafiosCompletados.length}`);
        console.log('Todo pendientes: ', this.desafiosPendientes);
      },
      error: (err) => console.error('Error al cargar desafíos del hogar', err)
    });
  }

  aumentarProgreso(desafio: Desafio): void {
    if (desafio.tipoValidacion !== 'manual' || !this.hogar?.id) return;
       
    if (desafio.progresoActual < desafio.progresoTotal) {
      const id = desafio.idDesafioGlobal;
      this.isLoadingDesafio[id] = true;
            
      this.gamificacionService.aumentarProgreso(this.hogar.id, id).subscribe({
        next: () => {
          this.cargarDesafiosPorHogar(this.hogar!.id);
          alert(`Progreso de ${desafio.titulo} aumentado.`);
        },
        error: (err) => {
          console.error('Error al aumentar progreso', err);
          this.isLoadingDesafio[id] = false;
        }
      });
    } else {
        this.completarDesafio(desafio);
      }
  }

  completarDesafio(desafio: Desafio): void {
    if (!this.hogar?.id || !desafio.completado) return;

    const id = desafio.idDesafioGlobal; 
    this.isLoadingDesafio[id] = true;

    this.gamificacionService.completarDesafio(this.hogar.id, id).subscribe({
      next: (res) => {
        this.cargarDesafiosPorHogar(this.hogar!.id);
        alert(`¡Desafío completado: ${desafio.titulo}! Has ganado ${desafio.puntosRecompensa} puntos.`);
      },
      error: (err) => {
        console.error('Error al completar desafío', err);
        this.isLoadingDesafio[id] = false;
      }
    });
  }


}

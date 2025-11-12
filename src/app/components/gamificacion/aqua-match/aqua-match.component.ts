import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Card {
  id: number;
  text: string;
  matched: boolean;
  x?: number;
  y?: number;
  initialX?: number;
  initialY?: number;
  tip?: string;
  isWrong?: boolean;
}

export interface MergedCard {
  id: number;
  leftText: string;
  rightText: string;
  tip: string;
  claimed?: boolean;
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './aqua-match.component.html',
  styleUrls: ['./aqua-match.component.css']
})
export class AquaMatchComponent implements OnInit, OnDestroy {
  private allLeftCards: Card[] = [
    { id: 1, text: 'Si lavás el auto dejando correr la manguera por minutos', matched: false, tip: 'Usá balde y esponja: podés ahorrar hasta 200 L por lavado.' },
    { id: 2, text: 'Si regás el jardín al mediodía, cuando el sol es más fuerte', matched: false, tip: 'Regá temprano o al atardecer para evitar hasta un 50% de evaporación.' },
    { id: 3, text: 'Si dejás la canilla abierta mientras te cepillás los dientes', matched: false, tip: 'Cerrarla mientras te cepillás ahorra unos 6 L por minuto.' },
    { id: 4, text: 'Si te das duchas largas de más de 10 minutos', matched: false, tip: 'Reduciendo la ducha a 5 minutos se ahorran hasta 75 L por día.' },
    { id: 5, text: 'Si tu inodoro o canillas gotean constantemente', matched: false, tip: 'Una fuga puede desperdiciar 20 L diarios. Revisá y arreglá a tiempo.' },
    { id: 6, text: 'Si usás el lavarropas con media carga varias veces por semana', matched: false, tip: 'Esperar a tener carga completa ahorra agua y energía.' },
    { id: 7, text: 'Si lavás frutas y verduras directamente bajo la canilla', matched: false, tip: 'Lavar en un recipiente puede ahorrar hasta 10 L por vez.' },
    { id: 8, text: 'Si nunca controlás tu consumo de agua ni revisás el medidor', matched: false, tip: 'Monitorear el consumo ayuda a detectar fugas y reducir gastos.' },
    { id: 9, text: 'Si llenás la pileta sin control ni mantenimiento', matched: false, tip: 'Cubrirla con una lona reduce evaporación y mantiene el agua limpia más tiempo.' },
    { id: 10, text: 'Si descongelás los alimentos bajo el grifo abierto', matched: false, tip: 'Descongelar en la heladera o naturalmente evita desperdiciar agua.' },
    { id: 11, text: 'Si limpiás veredas o patios usando manguera', matched: false, tip: 'Barré primero o usá balde: podés ahorrar hasta 150 L por limpieza.' },
    { id: 12, text: 'Si no aprovechás el agua de lluvia para tareas simples', matched: false, tip: 'Recolectarla permite regar plantas o limpiar sin gastar agua potable.' },
  ];

  private allRightCards: Card[] = [
    { id: 1, text: 'Desperdiciás cientos de litros de agua cada vez que lavás el auto.', matched: false },
    { id: 2, text: 'Gran parte del agua se evapora antes de que las plantas la absorban.', matched: false },
    { id: 3, text: 'Se pierden varios litros de agua por minuto innecesariamente.', matched: false },
    { id: 4, text: 'Tu consumo diario se dispara y usás más agua de la necesaria.', matched: false },
    { id: 5, text: 'Las fugas constantes generan pérdidas de agua todos los días.', matched: false },
    { id: 6, text: 'Aumentás el consumo de agua y energía sin aprovechar la capacidad del lavarropas.', matched: false },
    { id: 7, text: 'Malgastás agua en la cocina con un uso poco eficiente del recurso.', matched: false },
    { id: 8, text: 'Podés tener fugas ocultas o consumos excesivos sin darte cuenta.', matched: false },
    { id: 9, text: 'La evaporación y los recambios innecesarios desperdician miles de litros.', matched: false },
    { id: 10, text: 'Gastás litros de agua innecesarios en un proceso que puede ser simple.', matched: false },
    { id: 11, text: 'Usás grandes cantidades de agua para una tarea que puede hacerse en seco.', matched: false },
    { id: 12, text: 'Desaprovechás una fuente gratuita y sustentable de agua.', matched: false },
  ];

  leftCards: Card[] = [];
  rightCards: Card[] = [];
  mergedCards: MergedCard[] = [];

  currentLevel = 1;
  readonly cardsPerLevel = 3;
  maxLevel = 4;
  showIntro = true;
  showNextLevel = false;
  finalMessage = false;

  draggingCard: Card | null = null;
  offsetX = 0;
  offsetY = 0;

  @ViewChild('container', { static: true }) container!: ElementRef;

  backgroundMusic!: HTMLAudioElement;
  matchSound!: HTMLAudioElement;
  notMatchSound!: HTMLAudioElement;
  showVolume = false;
  volume = 20; 
  muted = false;

  ngOnInit() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.backgroundMusic = new Audio('sounds/drag-drop-bg.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.02;

    this.matchSound = new Audio('sounds/match-sound.mp3');
    this.matchSound.volume = 0.1;

    this.notMatchSound = new Audio('sounds/not-match.mp3');
    this.notMatchSound.volume = 0.1;

    this.backgroundMusic.play()
  }

  ngOnDestroy() {
    this.stopAllSounds();
  }

  startGame() {
    this.showIntro = false;
    this.loadLevel(this.currentLevel);
    this.backgroundMusic.play().catch(() => {});
  }

  stopAllSounds() {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  private loadLevel(level: number) {
    const start = (level - 1) * this.cardsPerLevel;
    const end = start + this.cardsPerLevel;

    this.leftCards = this.allLeftCards.slice(start, end).map(c => ({ ...c, matched: false }));
    this.rightCards = this.shuffle(this.allRightCards.slice(start, end).map(c => ({ ...c, matched: false })));

    const verticalSpacing = 140;
    const boardWidth = this.container.nativeElement.offsetWidth;
    const cardWidth = 280;

    this.leftCards.forEach((c, i) => {
      c.x = 20;
      c.y = 50 + i * verticalSpacing;
      c.initialX = c.x;
      c.initialY = c.y;
    });

    this.rightCards.forEach((c, i) => {
      c.x = boardWidth - cardWidth - 20;
      c.y = 50 + i * verticalSpacing;
      c.initialX = c.x;
      c.initialY = c.y;
    });
  }

  private shuffle<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  startDrag(event: MouseEvent | TouchEvent, card: Card) {
    if (card.matched) return;
    this.draggingCard = card;

    const containerRect = (this.container.nativeElement as HTMLElement).getBoundingClientRect();
    const pos = this.getEventPosition(event);
    this.offsetX = pos.x - (containerRect.left + (card.x ?? 0));
    this.offsetY = pos.y - (containerRect.top + (card.y ?? 0));

    (event.currentTarget as HTMLElement).classList.add('dragging');
    event.preventDefault();
  }

  onMove(event: MouseEvent | TouchEvent) {
    if (!this.draggingCard) return;

    const pos = this.getEventPosition(event);
    const containerRect = (this.container.nativeElement as HTMLElement).getBoundingClientRect();
    this.draggingCard.x = pos.x - containerRect.left - this.offsetX;
    this.draggingCard.y = pos.y - containerRect.top - this.offsetY;
  }

onEnd(event?: MouseEvent | TouchEvent) {
  if (!this.draggingCard) return;

  const card = this.draggingCard;
  const leftRect = { x: card.x ?? 0, y: card.y ?? 0, width: 280, height: 120 };
  const match = this.rightCards.find(rc => !rc.matched && rc.id === card.id);

  if (match) {
    const rightRect = { x: match.x ?? 0, y: match.y ?? 0, width: 280, height: 120 };
    const touching = !(
      leftRect.x + leftRect.width < rightRect.x ||
      leftRect.x > rightRect.x + rightRect.width ||
      leftRect.y + leftRect.height < rightRect.y ||
      leftRect.y > rightRect.y + rightRect.height
    );

    if (touching) {
      card.matched = true;
      match.matched = true;

      this.mergedCards.push({
        id: card.id,
        leftText: card.text,
        rightText: match.text,
        tip: card.tip ?? ''
      });

      this.leftCards = this.leftCards.filter(c => c.id !== card.id);
      this.rightCards = this.rightCards.filter(c => c.id !== match.id);

      this.matchSound.currentTime = 0;
      this.matchSound.play().catch(() => {});

      if (this.leftCards.length === 0 && this.currentLevel < this.maxLevel) {
        setTimeout(() => (this.showNextLevel = true), 400);
      } else if (this.leftCards.length === 0 && this.currentLevel === this.maxLevel) {
        setTimeout(() => (this.finalMessage = true), 400);
      }

      this.finishDrag();
      return;
    }
  }

  const element = document.getElementById(`card-${card.id}`);
  if (element) {
    element.classList.add('shake');
    setTimeout(() => {
      element.classList.remove('shake');
      element.classList.add('returning');
    }, 400);

    setTimeout(() => {
      element.classList.remove('returning');
      this.finishDrag(true); 
    }, 900);
  } else {
    this.finishDrag(true);
  }
  if (this.notMatchSound) {
    this.notMatchSound.currentTime = 0;
    this.notMatchSound.play().catch(() => {});
  }
}

  private getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }
    return { x: 0, y: 0 };
  }

  nextLevel() {
    this.showNextLevel = false;
    this.currentLevel++;
    this.loadLevel(this.currentLevel);
  }

  restartGame() {
    this.finalMessage = false;
    this.currentLevel = 1;
    this.mergedCards = [];
    this.loadLevel(this.currentLevel);
  }

  finishDrag(wrong = false) {
    const draggingEl = document.querySelector('.dragging') as HTMLElement;
    if (!draggingEl) {
      this.draggingCard = null;
      return;
    }
    if (wrong) {
      draggingEl.classList.add('wrong');
      setTimeout(() => draggingEl.classList.remove('wrong'), 300);
    } else if (this.draggingCard?.matched) {
      draggingEl.classList.add('matched');
    }
    draggingEl.classList.remove('dragging');
    this.draggingCard = null;
  }

  claimPoints(card: MergedCard) {
    if (!card.claimed) {
      card.claimed = true;
    }
  }

  private handleResize() {
    if (!this.container) return;
    const boardWidth = this.container.nativeElement.offsetWidth;
    const cardWidth = 280;
    if (this.leftCards.length > 0 && this.rightCards.length > 0) {
      this.leftCards.forEach((c, i) => {
        c.x = 20;
        c.y = 50 + i * 140;
      });
      this.rightCards.forEach((c, i) => {
        c.x = Math.max(20, boardWidth - cardWidth - 20);
        c.y = 50 + i * 140;
      });
    }
  }

   updateVolume() {
    const vol = this.volume / 100;
    if (this.backgroundMusic) this.backgroundMusic.volume = this.muted ? 0 : vol * 0.2;
    if (this.matchSound) this.matchSound.volume = this.muted ? 0 : vol * 0.5;
    if (this.notMatchSound) this.notMatchSound.volume = this.muted ? 0 : vol * 0.5;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.backgroundMusic.volume = 0;
      this.matchSound.volume = 0;
      this.notMatchSound.volume = 0;
    } else {
      this.updateVolume();
    }
  }

  
}
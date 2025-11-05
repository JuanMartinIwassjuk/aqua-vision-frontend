import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Card {
  id: number;
  text: string;
  matched: boolean;
  x?: number;
  y?: number;
  initialX?: number;
  initialY?: number;
  tip?: string;
}

export interface MergedCard {
  id: number;
  leftText: string;
  rightText: string;
  tip: string;
  claimed?: boolean;
}

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css']
})
export class DragDropComponent implements OnInit {
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

  currentLevel = 1;
  readonly cardsPerLevel = 3;
  maxLevel = 4;

  showIntro = true;

  draggingCard: Card | null = null;
  offsetX = 0;
  offsetY = 0;
  mergedCards: MergedCard[] = [];
  showNextLevel = false;
  finalMessage = false;

  @ViewChild('container', { static: true }) container!: ElementRef;

  ngOnInit() {
  }

  startGame() {
    this.showIntro = false;
    this.loadLevel(this.currentLevel);
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

  startDrag(event: MouseEvent, card: Card) {
    if (card.matched) return;
    this.draggingCard = card;

    const containerRect = (this.container.nativeElement as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - (containerRect.left + (card.x ?? 0));
    this.offsetY = event.clientY - (containerRect.top + (card.y ?? 0));

    (event.currentTarget as HTMLElement).classList.add('dragging');
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.draggingCard) return;
    const containerRect = (this.container.nativeElement as HTMLElement).getBoundingClientRect();
    this.draggingCard.x = event.clientX - containerRect.left - this.offsetX;
    this.draggingCard.y = event.clientY - containerRect.top - this.offsetY;
  }

  onMouseUp() {
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

        if (this.leftCards.length === 0 && this.currentLevel < this.maxLevel) {
          setTimeout(() => this.showNextLevel = true, 100);
        } else if (this.leftCards.length === 0 && this.currentLevel === this.maxLevel) {
          setTimeout(() => this.finalMessage = true, 100);
        }

        this.finishDrag();
        return;
      }
    }

    card.x = card.initialX ?? card.x ?? 0;
    card.y = card.initialY ?? card.y ?? 0;
    this.finishDrag(true);
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
}
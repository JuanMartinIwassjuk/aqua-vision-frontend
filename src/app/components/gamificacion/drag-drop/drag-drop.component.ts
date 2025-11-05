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
  leftCards: Card[] = [
    { id: 1, text: 'Si lavas el auto dejando la manguera abierta durante minutos.', matched: false, tip: 'Usando balde y esponja podés ahorrar hasta 200 L por lavado.' },
    { id: 2, text: 'Si regás el jardín al mediodía, cuando el sol es fuerte.', matched: false, tip: 'Regando temprano o al atardecer se evita hasta el 50% de evaporación.' },
    { id: 3, text: 'Si dejas la canilla abierta mientras te cepillás los dientes.', matched: false, tip: 'Cerrar la canilla mientras te cepillás ahorra unos 6 L por minuto.' },
    { id: 4, text: 'Si te das duchas largas de más de 10 minutos todos los días.', matched: false, tip: 'Reduciendo la ducha a 5 minutos se ahorran hasta 75 L por día.' },
    { id: 5, text: 'Si tu inodoro o canillas gotean sin que lo notes.', matched: false, tip: 'Una fuga puede desperdiciar 20 L diarios. Revisá y arreglá a tiempo.' },
    { id: 6, text: 'Si usás el lavarropas con media carga varias veces por semana.', matched: false, tip: 'Esperar a carga completa ahorra agua y energía.' },
    { id: 7, text: 'Si lavas frutas y verduras directamente bajo la canilla abierta.', matched: false, tip: 'Lavar en un recipiente puede ahorrar hasta 10 L.' },
    { id: 8, text: 'Si nunca revisás tu medidor ni controlás tu consumo de agua.', matched: false, tip: 'Controlando tu consumo podés detectar fugas y reducir gastos.' },
  ];

  rightCards: Card[] = [
    { id: 1, text: 'Desperdiciás cientos de litros de agua innecesariamente al lavar tu vehículo.', matched: false },
    { id: 2, text: 'Gran parte del agua se evapora antes de que las plantas la absorban.', matched: false },
    { id: 3, text: 'Se desperdician litros de agua cada minuto mientras te higienizas.', matched: false },
    { id: 4, text: 'Tu huella hídrica diaria se dispara, usando más agua de la necesaria.', matched: false },
    { id: 5, text: 'La fuga constante genera pérdida de agua todos los días.', matched: false },
    { id: 6, text: 'Usar electrodomésticos a media carga aumenta tu consumo innecesario.', matched: false },
    { id: 7, text: 'Malgastás agua en la cocina y no aprovechás bien el recurso.', matched: false },
    { id: 8, text: 'No detectás fugas ni controlás tu consumo, aumentando desperdicios y costos.', matched: false },
  ];
  draggingCard: Card | null = null;
  offsetX = 0;
  offsetY = 0;
  tips: string[] = [];
  mergedCards: MergedCard[] = [];

  @ViewChild('container', { static: true }) container!: ElementRef;

  ngOnInit() {
    const verticalSpacing = 140;
    const containerWidth = 400;
    const boardWidth = this.container.nativeElement.offsetWidth;

    this.leftCards.forEach((c, i) => {
      c.x = 20;
      c.y = 20 + i * verticalSpacing;
      c.initialX = c.x;
      c.initialY = c.y;
    });

    this.rightCards.forEach((c, i) => {
      const cardWidth = 280;
      c.x = boardWidth - cardWidth - 20;
      c.y = 20 + i * verticalSpacing;
      c.initialX = c.x;
      c.initialY = c.y;
    });
  }

  startDrag(event: MouseEvent, card: Card) {
    if (card.matched) return;

    this.draggingCard = card;

    const container = this.container.nativeElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    this.offsetX = event.clientX - (containerRect.left + card.x!);
    this.offsetY = event.clientY - (containerRect.top + card.y!);

    (event.currentTarget as HTMLElement).classList.add('dragging');

    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.draggingCard) return;

    const container = this.container.nativeElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    this.draggingCard.x = event.clientX - containerRect.left - this.offsetX;
    this.draggingCard.y = event.clientY - containerRect.top - this.offsetY;
  }

  onMouseUp() {
    if (!this.draggingCard) return;

    const card = this.draggingCard;

    const leftRect = {
      x: card.x ?? 0,
      y: card.y ?? 0,
      width: 280,
      height: 120
    };

    const match = this.rightCards.find(rc => !rc.matched && rc.id === card.id);

    if (match) {
      const rightRect = {
        x: match.x ?? 0,
        y: match.y ?? 0,
        width: 280,
        height: 120
      };

      const isTouching = !(
        leftRect.x + leftRect.width < rightRect.x ||
        leftRect.x > rightRect.x + rightRect.width ||
        leftRect.y + leftRect.height < rightRect.y ||
        leftRect.y > rightRect.y + rightRect.height
      );

if (isTouching) {
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

  this.finishDrag();
  return;
}
    }

    card.x = card.initialX ?? card.x ?? 0;
    card.y = card.initialY ?? card.y ?? 0;
    this.finishDrag(true);
  }

  get matchedCount() {
    return this.leftCards.filter(c => c.matched).length;
  }

  resetGame() {
    this.leftCards.forEach(c => {
      c.matched = false;
      c.x = c.initialX!;
      c.y = c.initialY!;
    });
    this.rightCards.forEach(c => (c.matched = false));
    this.tips = [];
  }

  finishDrag(wrong = false) {
    const draggingEl = document.querySelector('.dragging') as HTMLElement;
    if (!draggingEl) {
      this.draggingCard = null;
      return;
    }

    if (wrong) {
      draggingEl.classList.add('wrong');
      setTimeout(() => draggingEl?.classList.remove('wrong'), 300);
    } else if (this.draggingCard?.matched) {
      draggingEl.classList.add('matched');
    }

    draggingEl.classList.remove('dragging');
    this.draggingCard = null;

  }

  claimPoints(card: MergedCard) {
  if (!card.claimed) {
    card.claimed = true;
    alert('finish');
  }
}
}
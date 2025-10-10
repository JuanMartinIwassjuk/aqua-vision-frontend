import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css']
})
export class DragDropComponent implements OnInit {

leftCards: Card[] = [
  { 
    id: 4, 
    text: 'Duchas largas de más de 10 minutos', 
    matched: false, 
    tip: 'Reduciendo la ducha a 5 minutos se pueden ahorrar hasta 75 litros por día por persona.' 
  },
  { 
    id: 1, 
    text: 'Lavar el auto usando manguera abierta', 
    matched: false, 
    tip: 'Usando un balde y una esponja podés ahorrar hasta 200 litros de agua por lavado. ¡Pequeños cambios suman mucho!' 
  },
  { 
    id: 3, 
    text: 'Dejar la canilla abierta mientras te cepillás los dientes', 
    matched: false, 
    tip: 'Cerrando la canilla mientras te cepillás podés ahorrar alrededor de 6 litros por minuto. ¡Multiplicá por los días!' 
  },
  { 
    id: 5, 
    text: 'Dejar goteando el inodoro o canillas', 
    matched: false, 
    tip: 'Una canilla que gotea puede desperdiciar 20 litros de agua al día. Revisá y arreglá fugas a tiempo.' 
  },
  { 
    id: 2, 
    text: 'Regar el jardín al mediodía con manguera', 
    matched: false, 
    tip: 'Regar temprano por la mañana o al atardecer puede reducir hasta un 50% de pérdida por evaporación.' 
  },
];

rightCards: Card[] = [
  { id: 3, text: 'Desperdicio innecesario en el hogar', matched: false },
  { id: 1, text: 'Consumo excesivo de agua', matched: false },
  { id: 5, text: 'Goteos y fugas desapercibidas', matched: false },
  { id: 2, text: 'Pérdida por evaporación', matched: false },
  { id: 4, text: 'Alta huella hídrica', matched: false },
];

  draggingCard: Card | null = null;
  offsetX = 0;
  offsetY = 0;

  @ViewChild('container', { static: true }) container!: ElementRef;

ngOnInit() {
  const verticalSpacing = 150; 

  this.leftCards.forEach((c, i) => {
    c.x = 50;
    c.y = 50 + i * verticalSpacing;
    c.initialX = c.x;
    c.initialY = c.y;
  });

  this.rightCards.forEach((c, i) => {
    c.x = 450;                 
    c.y = 50 + i * verticalSpacing;
  });
}

  startDrag(event: MouseEvent, card: Card) {
    if (card.matched) return;
    this.draggingCard = card;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
    (event.target as HTMLElement).classList.add('dragging');
  }

  onMouseMove(event: MouseEvent) {
    if (!this.draggingCard) return;
    this.draggingCard.x = event.clientX - this.offsetX - this.container.nativeElement.getBoundingClientRect().left;
    this.draggingCard.y = event.clientY - this.offsetY - this.container.nativeElement.getBoundingClientRect().top;
  }

onMouseUp() {
  if (!this.draggingCard) return;

  const draggingEl = document.querySelector('.dragging') as HTMLElement;
  const match = this.rightCards.find(rc => !rc.matched && rc.id === this.draggingCard!.id);

  let collided = false;
  if (match && draggingEl) {
    const matchEl = document.querySelectorAll('.right-card')[this.rightCards.indexOf(match)] as HTMLElement;
    const rectDrag = draggingEl.getBoundingClientRect();
    const rectMatch = matchEl.getBoundingClientRect();

    collided =
      rectDrag.left < rectMatch.right &&
      rectDrag.right > rectMatch.left &&
      rectDrag.top < rectMatch.bottom &&
      rectDrag.bottom > rectMatch.top;
  }

if (collided && match) {
  
  this.draggingCard.x = match.x!;
  this.draggingCard.y = match.y!;
  this.draggingCard.matched = true;
  this.draggingCard.text = this.draggingCard.tip!;

  const draggingEl = document.querySelector('.dragging') as HTMLElement;
  if (draggingEl) draggingEl.style.zIndex = '10';

  match.matched = true;
} else {
    this.draggingCard.x = this.draggingCard.initialX!;
    this.draggingCard.y = this.draggingCard.initialY!;
  }

  if (draggingEl) draggingEl.classList.remove('dragging');
  this.draggingCard = null;
}
}

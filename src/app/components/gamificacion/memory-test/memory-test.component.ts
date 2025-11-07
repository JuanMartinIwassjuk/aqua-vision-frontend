import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GamificacionService } from '../../../services/gamificacion.service';

interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './memory-test.component.html',
  styleUrls: ['./memory-test.component.css']
})
export class MemoryGameComponent {
  icons = ['🚿', '🚽', '🚰', '💧', '🧺', '🌊'];
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchedCards: string[] = [];
  scoreCards = 0;

  timeLeft = 60;
  timerInterval: any;
  gameStarted = false;

  infoTexts: { [key: string]: { title: string, detail: string, claimed: boolean, matched: boolean } } = {
    '🚿': {
      title: 'Ducha eficiente',
      detail: 'Una ducha de 10 minutos consume unos 200 litros de agua. Si la reducís a 5 minutos, podés ahorrar lo suficiente para llenar 2 baldes de agua limpia. ¡Cada minuto cuenta!',
      claimed: false,
      matched: false
    },
    '🚽': {
      title: 'Uso del inodoro',
      detail: 'Cada descarga usa entre 6 y 12 litros. Un inodoro eficiente podría ahorrar más de 40 litros al día por persona.',
      claimed: false,
      matched: false
    },
    '🚰': {
      title: 'Grifo abierto',
      detail: 'Dejar el grifo abierto mientras te cepillás los dientes desperdicia hasta 20 litros por minuto. Cerrarlo mientras tanto ahorra agua para lavar los platos de todo un almuerzo.',
      claimed: false,
      matched: false
    },
    '💧': {
      title: 'Gota a gota',
      detail: 'Un grifo que gotea pierde 30 litros diarios. En un mes, eso equivale a más de 900 litros: suficiente para llenar una bañera grande.',
      claimed: false,
      matched: false
    },
    '🧺': {
      title: 'Lavado inteligente',
      detail: 'Lavar la ropa con carga completa puede ahorrar hasta 50 litros por lavado, además de energía. Usá programas cortos si la ropa no está muy sucia.',
      claimed: false,
      matched: false
    },
    '🌊': {
      title: 'Conciencia del recurso',
      detail: 'El agua dulce disponible representa menos del 1% del total del agua del planeta. Cada gota ahorrada ayuda a preservar un recurso limitado.',
      claimed: false,
      matched: false
    }
  };
  hogarId: any;

    constructor(
      private gamificacionService: GamificacionService
    ){  }
    
  ngOnInit() {
    this.resetMemory();
    this.hogarId = Number(sessionStorage.getItem('homeId'));
  }

  startGame() {
    this.gameStarted = true;
    this.startTimer();
  }

  resetMemory() {
    this.cards = [...this.icons, ...this.icons]
      .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);

    this.flippedCards = [];
    this.matchedCards = [];
    this.scoreCards = 0;
    this.timeLeft = 60;
    Object.values(this.infoTexts).forEach(info => {
      info.claimed = false;
      info.matched = false;
    });

    clearInterval(this.timerInterval);
    this.gameStarted = false;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  flipCard(card: Card) {
    if (!this.gameStarted || this.flippedCards.length >= 2 || card.flipped || card.matched) return;

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      setTimeout(() => {
        if (this.flippedCards[0].icon === this.flippedCards[1].icon) {
          this.flippedCards.forEach(c => c.matched = true);
          this.matchedCards.push(card.icon);
          this.infoTexts[card.icon].matched = true;
        } else {
          this.flippedCards.forEach(c => c.flipped = false);
        }
        this.flippedCards = [];
      }, 800);
    }
  }

  markAsRead(icon: string) {
    const info = this.infoTexts[icon];
    if (!info.claimed) {
      info.claimed = true;
      this.scoreCards += 10;
    }
  }

  allRead(): boolean {
    return Object.values(this.infoTexts).every(info => info.claimed);
  }

  claimAllPoints() {
    const puntosTotales = this.scoreCards;
    this.gamificacionService.addPuntosReclamados(this.hogarId, puntosTotales, 'AQUA_MATCH').subscribe({
      error: (err: any) => {
        console.error('Error al registrar puntos:', err);
      }
    });
}
}
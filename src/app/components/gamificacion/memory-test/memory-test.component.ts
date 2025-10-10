import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memory-test.component.html',
  styleUrls: ['./memory-test.component.css']
})
export class MemoryGameComponent {
  icons = ['🚿','🚰','💧','🏞️','🌊','🚽','🧺','🌧️','♻️','🌱'];
  cards: any[] = [];
  flippedCards: any[] = [];
  scoreCards = 0;

  ngOnInit() {
    this.resetMemory();
  }

  resetMemory() {
    this.cards = [...this.icons, ...this.icons]
      .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    this.flippedCards = [];
    this.scoreCards = 0;
  }

  flipCard(card: any) {
    if (this.flippedCards.length < 2 && !card.flipped && !card.matched) {
      card.flipped = true;
      this.flippedCards.push(card);

      if (this.flippedCards.length === 2) {
        setTimeout(() => {
          if (this.flippedCards[0].icon === this.flippedCards[1].icon) {
            this.flippedCards.forEach(c => c.matched = true);
            this.scoreCards += 10;
          } else {
            this.flippedCards.forEach(c => c.flipped = false);
          }
          this.flippedCards = [];
        }, 800);
      }
    }
  }
}
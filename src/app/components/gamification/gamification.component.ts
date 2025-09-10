import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Question } from '../../models/question';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gamification',
  imports: [CommonModule],
  templateUrl: './gamification.component.html',
  styleUrls: ['./gamification.component.css'] 
})
export class GamificationComponent implements OnDestroy {

  mode: 'menu' | 'trivia' | 'game' | 'memory' | 'history' = 'menu';
  currentIndex = 0;
  score = 0;
  answered = false;
  triviaFinished = false;
  gameStarted = false;

  questions: Question[] = [
    { question: '¿Cuántos litros de agua gasta una ducha promedio de 10 minutos?', options: ['20 litros', '50 litros', '100 litros', '150 litros'], correctAnswer: 2 },
    { question: '¿Qué porcentaje de la superficie terrestre está cubierta por agua?', options: ['50%', '71%', '85%', '60%'], correctAnswer: 1 },
    { question: '¿Cuál es la principal fuente de agua dulce?', options: ['Océanos', 'Glaciares', 'Ríos', 'Lagos'], correctAnswer: 1 },
    { question: '¿Cuánto tiempo puede sobrevivir una persona sin agua?', options: ['1 día', '3 días', '7 días', '10 días'], correctAnswer: 1 },
    { question: '¿Qué aparato consume más agua en el hogar?', options: ['Lavadora', 'Ducha', 'Inodoro', 'Lavavajillas'], correctAnswer: 2 },
    { question: '¿Cuál es el proceso de convertir agua salada en agua potable?', options: ['Filtración', 'Evaporación', 'Desalinización', 'Condensación'], correctAnswer: 2 },
    { question: '¿Qué acción ayuda a ahorrar agua en el jardín?', options: ['Regar al mediodía', 'Usar riego por goteo', 'Regar con manguera', 'No regar nunca'], correctAnswer: 1 }
  ];

  checkAnswer(selectedIndex: number) {
    this.answered = true;
    if (selectedIndex === this.questions[this.currentIndex].correctAnswer) {
      this.score += 10;
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.answered = false;
    }
  }

  finishTrivia() {
    this.triviaFinished = true;
  }

  @ViewChild('gameContainer') gameContainer!: ElementRef;
  bucketX = 150;
  bucketWidth = 60;
  drops: { x: number; y: number }[] = [];
  animationFrameId: number | null = null;
  intervalId: number | null = null;
  scoreGame = 0;

  startGame() {
  this.gameStarted = true;
  this.stopGame();
  this.drops = [];
  this.bucketX = 150;
  this.scoreGame = 0;

  this.intervalId = window.setInterval(() => {
    if (this.mode === 'game' && this.gameStarted) {
      const arenaWidth = this.gameContainer?.nativeElement?.clientWidth ?? 350;
      const x = Math.random() * (arenaWidth - 30);
      this.drops.push({ x, y: 0 });
    }
  }, 1200);

    this.gameLoop();
  }

  gameLoop() {
    const fallSpeed = 2.5; //Ver que onda la velocidad

    this.drops.forEach(drop => drop.y += fallSpeed);
    this.drops = this.drops.filter(drop => {
      const bucketTop = (this.gameContainer?.nativeElement?.clientHeight ?? 300) - 40;
      const bucketHeight = 30;
      const dropSize = 20;

      const bucketRect = { x: this.bucketX, y: bucketTop, width: this.bucketWidth, height: bucketHeight };
      const dropRect = { x: drop.x, y: drop.y, width: dropSize, height: dropSize };

      const isColliding =
        dropRect.x < bucketRect.x + bucketRect.width &&
        dropRect.x + dropRect.width > bucketRect.x &&
        dropRect.y < bucketRect.y + bucketRect.height &&
        dropRect.y + dropRect.height > bucketRect.y;

      if (isColliding) {
        this.scoreGame += 5;
        return false;
      }

      return drop.y < (this.gameContainer?.nativeElement?.clientHeight ?? 300);
    });
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  stopGame() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.mode === 'game' && this.gameContainer) {
      const rect = this.gameContainer.nativeElement.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      this.bucketX = Math.max(0, Math.min(relativeX - this.bucketWidth / 2, rect.width - this.bucketWidth));
    }
  }

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

setMode(m: 'menu' | 'trivia' | 'game' | 'memory' | 'history') {
  if (this.mode === 'game' && m !== 'game') {
    this.stopGame();
    this.gameStarted = false; 
  }
  this.mode = m;

  if (m === 'trivia') {
    this.triviaFinished = false;
    this.currentIndex = 0;
    this.answered = false;
  }
  if (m === 'memory') this.resetMemory();
}

  ngOnDestroy(): void {
    this.stopGame();
  }
}

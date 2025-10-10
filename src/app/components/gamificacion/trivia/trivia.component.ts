import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/question';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-trivia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trivia.component.html',
  styleUrls: ['./trivia.component.css']
})
export class TriviaComponent {
  currentIndex = 0;
  score = 0;
  answered = false;
  triviaFinished = false;

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
}
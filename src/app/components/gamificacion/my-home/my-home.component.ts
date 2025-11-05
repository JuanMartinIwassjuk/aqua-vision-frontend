import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface LeakPoint {
  x: number;
  y: number;
  closed: boolean;
  dropSound?: HTMLAudioElement;
}

interface Scene {
  name: string;
  title: string;
  image: string;
  leaks: LeakPoint[];
  expense: number;
  lastRevision: Date;
}

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-home.component.html',
  styleUrls: ['./my-home.component.css']
})
export class MyHomeComponent implements OnInit, OnDestroy {
  gameStarted = false;
  showNextScenePopup = false;

  currentIndex = 0;
  backgroundMusic!: HTMLAudioElement;
  fixSound!: HTMLAudioElement;

  scenes: Scene[] = [
    {
      name: 'Baño',
      title: 'Baño',
      image: 'images/bathroomv2.png',
      leaks: [
        { x: 20, y: 50, closed: false },
        { x: 45, y: 42, closed: false },
        { x: 85, y: 57, closed: false },
        { x: 58, y: 16, closed: false }
      ],
      expense: 5454,
      lastRevision: new Date(2025, 9, 24)
    },
    {
      name: 'Lavadero',
      title: 'Lavadero',
      image: 'images/laundryv2.png',
      leaks: [
        { x: 65, y: 40, closed: false },
        { x: 46, y: 53, closed: false }
      ],
      expense: 15524,
      lastRevision: new Date(2025, 9, 24)
    },
    {
      name: 'Patio',
      title: 'Patio',
      image: 'images/yardv2.png',
      leaks: [
        { x: 48, y: 78, closed: false },
        { x: 31, y: 85, closed: false }
      ],
      expense: 12115,
      lastRevision: new Date(2025, 9, 24)
    },
    {
      name: 'Cocina',
      title: 'Cocina',
      image: 'images/kitchenv2.png',
      leaks: [
        { x: 50, y: 52, closed: false },
        { x: 69, y: 45, closed: false }
      ],
      expense: 87845,
      lastRevision: new Date(2025, 9, 24)
    }
  ];

  get currentScene() {
    return this.scenes[this.currentIndex];
  }

  get closedLeaksCount() {
    return this.currentScene.leaks.filter(l => l.closed).length;
  }

  ngOnInit() {
    this.backgroundMusic = new Audio('sounds/background-music.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.03;

    this.fixSound = new Audio('sounds/fix-gota-sound.mp3');

    this.startGame();
  }

  ngOnDestroy() {
    this.stopAllSounds();
  }

  startGame() {
    this.gameStarted = true;
    this.backgroundMusic.play();
    this.startSceneDrops();
  }

  startSceneDrops() {
    this.stopAllDropSounds();

    this.currentScene.leaks.forEach((leak, i) => {
      if (leak.closed) return;

      const drop = new Audio('sounds/gota-sound.mp3');
      drop.loop = true;
      drop.volume = 0.09;
      leak.dropSound = drop;

      setTimeout(() => {
        if (!leak.closed) {
          drop.play().catch(() => {});
        }
      }, i * 1000);
    });
  }

  stopAllDropSounds() {
    this.scenes.forEach(scene => {
      scene.leaks.forEach(leak => {
        if (leak.dropSound) {
          leak.dropSound.pause();
          leak.dropSound.currentTime = 0;
          leak.dropSound.loop = false;
          leak.dropSound = undefined;
        }
      });
    });
  }

  stopAllSounds() {
    this.backgroundMusic.pause();
    this.stopAllDropSounds();
  }

  closeLeak(leak: LeakPoint) {
    if (leak.closed) return;

    leak.closed = true;


    if (leak.dropSound) {
      leak.dropSound.pause();
      leak.dropSound.currentTime = 0;
      leak.dropSound.loop = false;
      leak.dropSound = undefined;
    }


    const clickSound = new Audio('sounds/fix-gota-sound.mp3');
    clickSound.play();
    clickSound.volume = 0.09


    const allClosed = this.currentScene.leaks.every(l => l.closed);
    if (allClosed) {
      setTimeout(() => {
        this.showNextScenePopup = true;
        this.stopAllDropSounds();
      }, 500);
    }
  }

  nextScene() {
    this.showNextScenePopup = false;
    if (this.currentIndex < this.scenes.length - 1) {
      this.currentIndex++;
      this.startSceneDrops();
    } else {
      this.restartGame();
    }
  }

  restartGame() {
    this.scenes.forEach(scene =>
      scene.leaks.forEach(leak => (leak.closed = false))
    );
    this.currentIndex = 0;
    this.startSceneDrops();
  }

  goToScene(index: number) {
    if (index < 0 || index >= this.scenes.length) return;

    this.currentIndex = index;
    this.startSceneDrops();
    this.showNextScenePopup = false;
  }

  getClosedLeaks(scene: Scene): number {
    return scene.leaks.filter(l => l.closed).length;
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

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
}

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [CommonModule],
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
      ]
    },
    {
      name: 'Lavadero',
      title: 'Lavadero',
      image: 'images/laundryv2.png',
      leaks: [
        { x: 65, y: 40, closed: false },
        { x: 46, y: 53, closed: false }
      ]
    },
    {
      name: 'Patio',
      title: 'Patio',
      image: 'images/yardv2.png',
      leaks: [
        { x: 48, y: 78, closed: false },
        { x: 31, y: 85, closed: false }
      ]
    },
    {
      name: 'Cocina',
      title: 'Cocina',
      image: 'images/kitchenv2.png',
      leaks: [
        { x: 50, y: 52, closed: false },
        { x: 69, y: 45, closed: false }
      ]
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
    this.backgroundMusic.volume = 0.3;

    this.fixSound = new Audio('sounds/fix-gota-sound.mp3');

    document.addEventListener('click', this.enableMusicOnce, { once: true });
  }

  ngOnDestroy() {
    this.stopAllSounds();
  }

  enableMusicOnce = () => {
    if (this.gameStarted) {
      this.backgroundMusic.play().catch(() => {});
    }
  };

  startGame() {
    this.gameStarted = true;
    this.backgroundMusic.play();
    this.startSceneDrops();
  }

  startSceneDrops() {
    this.stopAllDropSounds();

    this.currentScene.leaks.forEach((leak, i) => {
      const drop = new Audio('sounds/gota-sound.mp3');
      drop.loop = true;
      drop.volume = 0.6;
      leak.dropSound = drop;

      setTimeout(() => {
        if (!leak.closed) drop.play().catch(() => {});
      }, i * 1000);
    });
  }

  stopAllDropSounds() {
    this.scenes.forEach(scene => {
      scene.leaks.forEach(leak => {
        leak.dropSound?.pause();
        leak.dropSound = undefined;
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

    leak.dropSound?.pause(); 

    const clickSound = new Audio('sounds/fix-gota-sound.mp3');
    clickSound.play();

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
}
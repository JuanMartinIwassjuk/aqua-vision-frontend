import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/serviceAuth/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CustomCrudFront';
  isMenuActive = false;
  isDesktop: boolean = window.innerWidth > 768;

  constructor(private authService: AuthService) {}

 
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.isMenuActive = false;
    }
  }

  expandedIndex: number | null = null;

  toggleService(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}

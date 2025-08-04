import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/serviceAuth/auth.service'; 
import { FooterComponent } from './components/layout/footer/footer.component';
import { NavComponent } from './components/layout/nav/nav.component';
import { filter } from 'rxjs';
import { GamificationComponent } from './components/gamification/gamification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FooterComponent, NavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AquaVision';
  isMenuActive = false;
  isDesktop: boolean = window.innerWidth > 768;
  showHeaderFooter = false;


  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = ['/login'];
        this.showHeaderFooter = !hiddenRoutes.includes(event.urlAfterRedirects);
      });
    }
 
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

closeMenu() {
  if (!this.isDesktop) {
    this.isMenuActive = false;
  }
  this.expandedIndex = null;
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
if (!target.closest('.submenu')) {
  this.expandedIndex = null;
}

}



}

import { Component, ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef, OnInit} from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RouterModule } from '@angular/router';

import { HomeService } from '../../services/home.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-gamificacion',
  imports: [CommonModule, RouterModule],
  templateUrl: './gamificacion.component.html',
  styleUrl: './gamificacion.component.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('modalAnimation', [
      state('open', style({ opacity: 1, transform: 'scale(1)' })),
      state('closed', style({ opacity: 0, transform: 'scale(0.8)' })),
      transition('closed => open', [animate('300ms ease-out')]),
      transition('open => closed', [animate('300ms ease-in')])
    ])]
})

export class GamificacionComponent implements OnInit{

  activeModal: string | null = null;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private homeService: HomeService,
    private userService: UserService
  ){  }
  
  @ViewChild('medallasModal') medallasModal!: TemplateRef<any>;
  
  modalTemplates: { [key: string]: TemplateRef<any> } = {};
  
  ngAfterViewInit(): void {
    // prevenir navegación en los anchors
    const anchors = document.querySelectorAll('a[href="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (event) => event.preventDefault());
    });
  
    this.modalTemplates = {
      medallas: this.medallasModal,
    };
  }
  
  openModal(id: string) {
    this.activeModal = id;
  }
  
  closeModal() {
    this.activeModal = null;
  }

  nombreUser!: string;

  user: User | null = null;

  ngOnInit(): void {
    this.userService.getAuthenticatedUser().subscribe({
      next: (u) => this.user = u,
      error: (err) => console.error('Error al obtener usuario', err)
    });
  }

}

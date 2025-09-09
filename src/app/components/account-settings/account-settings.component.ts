import { Component, ViewEncapsulation, AfterViewInit, ViewChild, TemplateRef} from '@angular/core';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-account-settings',
  imports: [CommonModule],
  templateUrl: './account-settings.component.html',
  styleUrls: [
    './account-settings.component.css',
    './normalize.css',
    './webflow.css',
    './aquavision-portal-usuarios.webflow.css'
  ],
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
export class AccountSettingsComponent {

  activeModal: string | null = null;

  constructor(private authService: AuthService, private router: Router){  }

  @ViewChild('personalModal') personalModal!: TemplateRef<any>;
  @ViewChild('homeModal') homeModal!: TemplateRef<any>;
  @ViewChild('billingModal') billingModal!: TemplateRef<any>;
  @ViewChild('sensor1Modal') sensor1Modal!: TemplateRef<any>;
  @ViewChild('sensor2Modal') sensor2Modal!: TemplateRef<any>;
  @ViewChild('plusModal') plusModal!: TemplateRef<any>;

  modalTemplates: { [key: string]: TemplateRef<any> } = {};

  ngAfterViewInit(): void {
    // prevenir navegación en los anchors
    const anchors = document.querySelectorAll('a[href="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (event) => event.preventDefault());
    });

    this.modalTemplates = {
      personal: this.personalModal,
      home: this.homeModal,
      billing: this.billingModal,
      sensor1: this.sensor1Modal,
      sensor2: this.sensor2Modal,
      plus: this.plusModal
    };
  }

   logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(id: string) {
    console.log('Abriendo modal: ', id)
    this.activeModal = id;
  }

  closeModal() {
    this.activeModal = null;
  }

}

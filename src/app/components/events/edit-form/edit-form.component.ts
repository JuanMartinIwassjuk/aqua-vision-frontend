import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../services/event.service';
import { AquaEvent } from '../../../models/aquaEvent';
import { EventTag } from '../../../models/eventTag';
import { Sector } from '../../../models/sector';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css']
})
export class EditFormComponent implements OnInit {
  eventId!: number;
  eventData: AquaEvent = {
    id: 0,
    titulo: '',
    description: '',
    estado: 'Pendiente',
    startDate: new Date(),
    endDate: null,
    litersConsumed: 0,
    cost: 0,
    sector: { id: 0, nombre: '' },
    tags: []
  };

  availableStatuses: string[] = ['Pendiente', 'En proceso', 'Finalizado', 'Cancelado'];
  availableTags: EventTag[] = [];

  availableSectors: Sector[] = [
    { id: 1, nombre: 'Cocina' },
    { id: 2, nombre: 'Baño' },
    { id: 3, nombre: 'Jardín' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.eventId) {
      this.eventService.getEventById(this.eventId).subscribe(event => {
        if (event) {
          this.eventData = { ...event };
        }
      });
      this.tagService.getTags().subscribe(tags => {
        this.availableTags = tags;
    });
    }
  }

  toggleTag(tag: EventTag) {
    const exists = this.eventData.tags.some(t => t.nombre === tag.nombre);
    if (exists) {
      this.eventData.tags = this.eventData.tags.filter(t => t.nombre !== tag.nombre);
    } else {
      this.eventData.tags.push(tag);
    }
  }

  saveChanges() {
    this.eventService.updateEvent(this.eventData).subscribe(() => {
      alert('Evento actualizado correctamente ✅');
      this.router.navigate(['/events']); 
    });
  }

  cancel() {
    this.router.navigate(['/events']);
  }

  isTagSelected(tag: EventTag): boolean {
  return this.eventData?.tags?.some(t => t.nombre === tag.nombre) ?? false;
}

}

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AquaEvent } from '../../../models/aquaEvent';
import { EventTag } from '../../../models/eventTag';
import { Sector } from '../../../models/sector';
import { EventService } from '../../../services/event.service';
import { HomeService } from '../../../services/home.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  @Output() eventCreated = new EventEmitter<AquaEvent>();

  newEvent: Partial<AquaEvent> = {
    title: '',
    description: '',
    status: 'Pendiente',
    tags: [],
    sector: undefined
  };

  availableTags: EventTag[] = [];
  tagToAdd: EventTag | null = null;

  sectors: Sector[] = [];

  constructor(
    private eventService: EventService,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
   
    const homeId = this.homeService.getHomeId();
    if (homeId !== null) {
   
      this.sectors = [
        { id: 1, name: 'Cocina' },
        { id: 2, name: 'Baño' },
        { id: 3, name: 'Jardín' },
        { id: 4, name: 'Terraza' },
        { id: 5, name: 'Lavadero' }
      ];
    }


    this.eventService.getEvents().subscribe(events => {
      const tagMap = new Map<string, EventTag>();
      events.forEach(e => e.tags.forEach(t => tagMap.set(t.name, t)));
      this.availableTags = Array.from(tagMap.values());
    });
  }

  addTagToEvent() {
    if (this.tagToAdd && !this.newEvent.tags?.find(t => t.name === this.tagToAdd!.name)) {
      this.newEvent.tags?.push(this.tagToAdd);
    }
    this.tagToAdd = null;
  }

  removeTag(tag: EventTag) {
    if (this.newEvent.tags) {
      this.newEvent.tags = this.newEvent.tags.filter(t => t.name !== tag.name);
    }
  }

  createEvent() {
    if (!this.newEvent.title || !this.newEvent.description || !this.newEvent.sector) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const eventToSave: AquaEvent = {
      id: Math.floor(Math.random() * 100000), // ID temporal
      title: this.newEvent.title!,
      description: this.newEvent.description!,
      startDate: this.newEvent.startDate || new Date(),
      status: this.newEvent.status as 'Pendiente' | 'En proceso' | 'Cancelado',
      tags: this.newEvent.tags || [],
      sector: this.newEvent.sector!,
    };

    this.eventService.updateEvent(eventToSave).subscribe(() => {
      this.eventCreated.emit(eventToSave);
      this.resetForm();
    });
  }

  resetForm() {
    this.newEvent = {
      title: '',
      description: '',
      status: 'Pendiente',
      tags: [],
      sector: undefined
    };
  }

}

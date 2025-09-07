import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AquaEvent } from '../../../models/aquaEvent';
import { EventTag } from '../../../models/eventTag';
import { EventService } from '../../../services/event.service';


@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: AquaEvent[] = [];

  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<number>();

  selectedTags: EventTag[] = [];
  tagToAdd: EventTag | null = null;
  selectedStatus: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  get availableTags(): EventTag[] {
    const tagMap = new Map<string, EventTag>();
    this.events.forEach(event => {
      event.tags.forEach(tag => tagMap.set(tag.name, tag));
    });
    return Array.from(tagMap.values());
  }

  get availableStatuses(): string[] {
    return Array.from(new Set(this.events.map(e => e.status)));
  }

  get filteredEvents(): AquaEvent[] {
    let filtered = [...this.events];

    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(event =>
        this.selectedTags.every(selectedTag =>
          event.tags.some(tag => tag.name === selectedTag.name)
        )
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(event => event.status === this.selectedStatus);
    }

    filtered.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }

  addTagToSelection() {
    if (this.tagToAdd && !this.selectedTags.find(t => t.name === this.tagToAdd!.name)) {
      this.selectedTags.push(this.tagToAdd);
    }
    this.tagToAdd = null;
  }

  removeTag(tag: EventTag) {
    this.selectedTags = this.selectedTags.filter(t => t.name !== tag.name);
  }

  clearFilter() {
    this.selectedTags = [];
    this.selectedStatus = '';
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  editEvent(id: number) {
    this.onEdit.emit(id);
  }

  deleteEvent(id: number) {
    this.eventService.deleteEvent(id).subscribe(() => {
      this.loadEvents();
    });
    this.onDelete.emit(id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'En proceso': return '#f39c12'; 
      case 'Finalizado': return '#27ae60'; 
      case 'Pendiente':  return '#2980b9';
      case 'Cancelado':  return '#c0392b'; 
      default: return '#7f8c8d'; 
    }
  }

  startEvent(event: AquaEvent) {
  const confirmStart = confirm('¿Seguro que deseas comenzar este evento?');
  if (confirmStart) {
    event.status = 'En proceso';
    event.startDate = new Date();

    this.eventService.updateEvent(event).subscribe(() => {
      this.loadEvents();
    });
  }
}


  finalizeEvent(event: AquaEvent) {
    const confirmFinish = confirm('¿Seguro que deseas finalizar este proceso?');
    if (confirmFinish) {
      event.status = 'Finalizado';
      event.endDate = new Date();

      this.eventService.updateEvent(event).subscribe(() => {
        this.loadEvents();
      });
    }
  }
}
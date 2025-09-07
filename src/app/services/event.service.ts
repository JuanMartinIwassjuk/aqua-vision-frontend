import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AquaEvent } from '../models/aquaEvent'; 

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: AquaEvent[] = [
    {
      id: 1,
      startDate: new Date('2025-09-01T08:00:00'),
      status: 'En proceso',
      tags: [
        { id: 1, name: 'Limpieza', color: '#27ae60' }
      ]
    },
    {
      id: 2,
      startDate: new Date('2025-08-28T10:30:00'),
      endDate: new Date('2025-08-28T12:00:00'),
      status: 'Finalizado',
      tags: [
        { id: 2, name: 'Pileta', color: '#2980b9' }
      ]
    },
    {
      id: 3,
      startDate: new Date('2025-09-03T15:00:00'),
      status: 'En proceso',
      tags: [
        { id: 3, name: 'Riego', color: '#8e44ad' },
        { id: 4, name: 'Jardín', color: '#16a085' }
      ]
    },
    {
      id: 4,
      startDate: new Date('2025-09-10T09:00:00'),
      status: 'Pendiente',
      tags: [
        { id: 5, name: 'Mantenimiento', color: '#e67e22' }
      ]
    },
    {
      id: 5,
      startDate: new Date('2025-09-02T14:00:00'),
      status: 'Cancelado',
      tags: [
        { id: 6, name: 'Baño', color: '#c0392b' }
      ]
    },
    {
      id: 6,
      startDate: new Date('2025-08-20T07:00:00'),
      endDate: new Date('2025-08-20T09:30:00'),
      status: 'Finalizado',
      tags: [
        { id: 7, name: 'Cocina', color: '#d35400' }
      ]
    },
    {
      id: 7,
      startDate: new Date('2025-09-05T18:00:00'),
      status: 'En proceso',
      tags: [
        { id: 8, name: 'Lavado', color: '#3498db' },
        { id: 9, name: 'Autos', color: '#2ecc71' }
      ]
    },
    {
      id: 8,
      startDate: new Date('2025-09-12T11:00:00'),
      status: 'Pendiente',
      tags: [
        { id: 10, name: 'Terraza', color: '#9b59b6' }
      ]
    },
    {
      id: 9,
      startDate: new Date('2025-09-15T16:30:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      status: 'Finalizado',
      tags: [
        { id: 11, name: 'Huerta', color: '#27ae60' },
        { id: 12, name: 'Riego', color: '#8e44ad' }
      ]
    },
    {
      id: 10,
      startDate: new Date('2025-09-20T20:00:00'),
      status: 'Cancelado',
      tags: [
        { id: 13, name: 'Eventos Sociales', color: '#e84393' }
      ]
    }
  ];

  constructor() {}

  getEvents(): Observable<AquaEvent[]> {
    return of(this.events);
  }

  deleteEvent(id: number): Observable<void> {
    this.events = this.events.filter(e => e.id !== id);
    return of();
  }

  editEvent(id: number, updatedEvent: Partial<AquaEvent>): Observable<AquaEvent | undefined> {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updatedEvent };
      return of(this.events[index]);
    }
    return of(undefined);
  }

    updateEvent(updatedEvent: AquaEvent): Observable<AquaEvent | undefined> {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = { ...updatedEvent };
      return of(this.events[index]);
    }
    return of(undefined);
  }
}

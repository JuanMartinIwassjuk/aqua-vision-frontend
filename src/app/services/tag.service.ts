import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventTag } from '../models/eventTag';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly STORAGE_KEY = 'eventTags';

  constructor() {}

  getTags(): Observable<EventTag[]> {

    const storedTags = localStorage.getItem(this.STORAGE_KEY);
    if (storedTags) {
      return of(JSON.parse(storedTags));
    }


    const hardcodedTags: EventTag[] = [
      { id: 1, name: 'Limpieza', color: '#27ae60' },
      { id: 2, name: 'Pileta', color: '#2980b9' },
      { id: 3, name: 'Riego', color: '#8e44ad' },
      { id: 4, name: 'Jardín', color: '#16a085' },
      { id: 5, name: 'Mantenimiento', color: '#e67e22' },
      { id: 6, name: 'Baño', color: '#c0392b' },
      { id: 7, name: 'Cocina', color: '#d35400' },
      { id: 8, name: 'Lavado', color: '#3498db' },
      { id: 9, name: 'Autos', color: '#2ecc71' },
      { id: 10, name: 'Terraza', color: '#9b59b6' },
      { id: 11, name: 'Huerta', color: '#27ae60' },
      { id: 12, name: 'Eventos Sociales', color: '#e84393' },
      { id: 13, name: 'Control de Cloro', color: '#1abc9c' },
      { id: 14, name: 'Bomba de Agua', color: '#34495e' }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(hardcodedTags));

    return of(hardcodedTags);
  }

  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

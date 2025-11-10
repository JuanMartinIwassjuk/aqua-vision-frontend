
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface EventTag {
  id: number;
  nombre: string;
  color: string;
}

export interface AquaEvent {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaInicio?: string; 
  fechaFin?: string | null;
  estado: string;
  tags: EventTag[];
  sector?: any;
  litrosConsumidos?: number;
  costo?: number;
  hogarId?: number;
  localidad?: string;
}

export interface Hogar {
  id: number;
  miembros: number;
  localidad: string;
  email: string;
  nombre: string;
  tipoHogar?: string;
  direccion?: string;
  ambientes?: number;
  tienePatio?: boolean;
  tienePileta?: boolean;
  facturacion?: any;
}

@Injectable({ providedIn: 'root' })
export class ReporteAdminService {

  private tags: EventTag[] = [
    { id: 1, nombre: 'Limpieza', color: '#2F80ED' },
    { id: 2, nombre: 'Pileta', color: '#27AE60' },
    { id: 3, nombre: 'Riego', color: '#F2C94C' },
    { id: 4, nombre: 'Jardín', color: '#EB5757' },
    { id: 5, nombre: 'Mantenimiento', color: '#9B51E0' },
    { id: 6, nombre: 'Baño', color: '#56CCF2' },
    { id: 7, nombre: 'Cocina', color: '#F2994A' },
    { id: 8, nombre: 'Lavado', color: '#27AE60' },
    { id: 9, nombre: 'Autos', color: '#8E44AD' },
    { id: 10, nombre: 'Terraza', color: '#FF7F50' }
  ];

  private hogares: Hogar[] = [
    { id: 1, miembros: 3, localidad: 'Palermo', email: 'a@h.com', nombre: 'Hogar A', ambientes: 3, tienePileta: false, tienePatio: true },
    { id: 2, miembros: 4, localidad: 'Belgrano', email: 'b@h.com', nombre: 'Hogar B', ambientes: 4, tienePileta: true, tienePatio: true },
    { id: 3, miembros: 2, localidad: 'Caballito', email: 'c@h.com', nombre: 'Hogar C', ambientes: 2, tienePileta: false, tienePatio: false },
    { id: 4, miembros: 5, localidad: 'Palermo', email: 'd@h.com', nombre: 'Hogar D', ambientes: 5, tienePileta: true, tienePatio: true },
    { id: 5, miembros: 1, localidad: 'Recoleta', email: 'e@h.com', nombre: 'Hogar E', ambientes: 1, tienePileta: false, tienePatio: false }
  ];

  // Mock eventos distribuidos en últimos 60 días
  private eventos: AquaEvent[] = (() => {
    const events: AquaEvent[] = [];
    const now = new Date();
    for (let i = 0; i < 120; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const d = new Date(now);
      d.setDate(now.getDate() - daysAgo);
      d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      const tag = this.tags[Math.floor(Math.random() * this.tags.length)];
      const litros = Math.round((Math.random() * 300 + 10) * 100) / 100;
      const costo = Math.round(litros * (0.15 + Math.random() * 0.25) * 100) / 100;

      const hogar = this.hogares[Math.floor(Math.random() * this.hogares.length)];

      events.push({
        id: i + 1,
        titulo: `${tag.nombre} evento ${i + 1}`,
        descripcion: `Evento ${i + 1} tipo ${tag.nombre}`,
        fechaInicio: d.toISOString(),
        estado: 'FINALIZADO',
        tags: [tag],
        litrosConsumidos: litros,
        costo,
        hogarId: hogar.id,
        localidad: hogar.localidad
      });
    }
    return events;
  })();

  constructor() { }

  // Consumo agregado por día para todos los hogares -> mock lineal por fecha
  getConsumoGlobalPorPeriodo(desdeIso: string, hastaIso: string): Observable<{ fecha: string, totalLitros: number, costo: number }[]> {
    const desde = new Date(desdeIso);
    const hasta = new Date(hastaIso);
    const dias = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const result: { fecha: string, totalLitros: number, costo: number }[] = [];
    for (let i = 0; i < dias; i++) {
      const day = new Date(desde);
      day.setDate(desde.getDate() + i);
      const dayIso = day.toISOString().split('T')[0];
      // sumar eventos del día
      const eventosDelDia = this.eventos.filter(ev => ev.fechaInicio?.startsWith(dayIso));
      const totalLitros = eventosDelDia.reduce((s, e) => s + (e.litrosConsumidos || 0), 0) + Math.round(Math.random() * 200);
      const costo = eventosDelDia.reduce((s, e) => s + (e.costo || 0), 0) + Math.round( (totalLitros * 0.18) * 100) / 100;
      result.push({ fecha: dayIso, totalLitros: Math.round(totalLitros * 100) / 100, costo: Math.round(costo * 100) / 100 });
    }
    return of(result);
  }

  // Resumen agregado (media, total y costo) para periodo
  getResumenConsumoGlobal(desdeIso: string, hastaIso: string): Observable<{ total: number, media: number, pico: number, costo: number }> {
    return this.getConsumoGlobalPorPeriodo(desdeIso, hastaIso).pipe(
      // map in subscribe; but keep simple: use of(...) recalculated
      (obs) => {
        return new Observable(sub => {
          obs.subscribe(arr => {
            const total = arr.reduce((s, a) => s + a.totalLitros, 0);
            const media = arr.length ? total / arr.length : 0;
            const pico = arr.reduce((p, a) => Math.max(p, a.totalLitros), 0);
            const costo = arr.reduce((s, a) => s + a.costo, 0);
            sub.next({ total: Math.round(total * 100) / 100, media: Math.round(media * 100) / 100, pico: Math.round(pico * 100) / 100, costo: Math.round(costo * 100) / 100 });
            sub.complete();
          });
        });
      }
    );
  }

  // Eventos (filtrados)
  getEventosFiltro(desdeIso?: string, hastaIso?: string, tagIds?: number[]): Observable<AquaEvent[]> {
    let list = [...this.eventos];
    if (desdeIso) {
      const desde = new Date(desdeIso);
      list = list.filter(e => new Date(e.fechaInicio || '') >= desde);
    }
    if (hastaIso) {
      const hasta = new Date(hastaIso);
      hasta.setHours(23,59,59,999);
      list = list.filter(e => new Date(e.fechaInicio || '') <= hasta);
    }
    if (tagIds && tagIds.length) {
      list = list.filter(e => e.tags.some(t => tagIds.includes(t.id)));
    }
    // ordenar asc por fecha
    list.sort((a,b) => (new Date(a.fechaInicio||'')).getTime() - (new Date(b.fechaInicio||'')).getTime());
    return of(list);
  }

  // Lista de tags
  getTags(): Observable<EventTag[]> {
    return of(this.tags);
  }

  // Consumo agrupado por localidad
  getConsumoPorLocalidad(desdeIso: string, hastaIso: string): Observable<{ localidad: string, total: number, media: number, costo: number, hogares: number }[]> {
    const desde = new Date(desdeIso);
    const hasta = new Date(hastaIso);
    const filtered = this.eventos.filter(e => {
      const d = new Date(e.fechaInicio || '');
      return d >= desde && d <= (new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23,59,59,999));
    });
    const agrup: Record<string, { total: number, count: number, costo: number, hogaresSet: Set<number> }> = {};
    filtered.forEach(ev => {
      const loc = ev.localidad || 'Sin Localidad';
      if (!agrup[loc]) agrup[loc] = { total: 0, count: 0, costo: 0, hogaresSet: new Set() };
      agrup[loc].total += ev.litrosConsumidos || 0;
      agrup[loc].count++;
      agrup[loc].costo += ev.costo || 0;
      if (ev.hogarId) agrup[loc].hogaresSet.add(ev.hogarId);
    });
    const result = Object.keys(agrup).map(k => ({
      localidad: k,
      total: Math.round(agrup[k].total * 100) / 100,
      media: agrup[k].count ? Math.round((agrup[k].total / agrup[k].count) * 100) / 100 : 0,
      costo: Math.round(agrup[k].costo * 100) / 100,
      hogares: agrup[k].hogaresSet.size
    }));

    return of(result);
  }


getConsumoPromedioPorHogar(fechaIso: string): Observable<number> {
  const fechaOnly = (fechaIso || '').split('T')[0];
  const hoy = new Date().toISOString().split('T')[0];
  const ayerDt = new Date();
  ayerDt.setDate(new Date().getDate() - 1);
  const ayer = ayerDt.toISOString().split('T')[0];

  if (fechaOnly === hoy) return of(2.48);      // m³ promedio por hogar hoy
  if (fechaOnly === ayer) return of(2.70);     // m³ promedio por hogar ayer
  return of(2.50);                             // valor por defecto
}

/** Devuelve consumo total de todos los hogares (m³) para la fecha dada.
 *  Valores fijos coherentes con promedio * hogares (hogares = this.hogares.length).
 *  Ej.: con 5 hogares, 2.48 * 5 = 12.4 m³
 */
getConsumoTotalPorDia(fechaIso: string): Observable<number> {
  const hogaresCount = this.hogares.length || 1;
  const fechaOnly = (fechaIso || '').split('T')[0];
  const hoy = new Date().toISOString().split('T')[0];
  const ayerDt = new Date();
  ayerDt.setDate(new Date().getDate() - 1);
  const ayer = ayerDt.toISOString().split('T')[0];

  if (fechaOnly === hoy) return of(Math.round((2.48 * hogaresCount) * 1000) / 1000); // ejemplo 12.4
  if (fechaOnly === ayer) return of(Math.round((2.70 * hogaresCount) * 1000) / 1000); // ejemplo 13.5
  return of(Math.round((2.50 * hogaresCount) * 1000) / 1000);
}

/** Total de trivias completadas (valor fijo) */
getTotalTriviasCompletadas(): Observable<number> {
  return of(18); // valor fijo mock
}

/** Total de eventos (valor fijo) */
getTotalEventos(): Observable<number> {
  return of(this.eventos.length); // can use eventos existentes (determinístico si no los generas random)
}

/** Notificaciones globales (valor fijo) */
getNotificacionesCount(): Observable<number> {
  return of(4); // valor fijo mock
}

/** Consumo por hora total (m³) para la fecha: devuelve 24 valores fijos coherentes */
// Asegúrate de tener `import { of } from 'rxjs';` arriba del archivo.

/**
 * Devuelve 24 puntos por hora (hora: "HH:00", caudal_m3) determinísticos.
 * - Si fechaIso es hoy => curva "base"
 * - Si fechaIso es ayer => curva "base" modificada (menor en promedio y con ligera variación por hora)
 * - Si es cualquier otra fecha => variante "neutral"
 */
getConsumoPorHoraTotal(fechaIso: string): Observable<{ hora: string; caudal_m3: number }[]> {
  const basePerHour = [
    0.12,0.09,0.07,0.06,0.05,0.06,0.18,0.45,0.78,0.95,1.05,1.12,
    1.20,1.10,1.00,0.92,0.86,0.80,0.72,0.65,0.58,0.45,0.32,0.20
  ];

  const onlyDate = (fechaIso || '').split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  const ayerDt = new Date();
  ayerDt.setDate(ayerDt.getDate() - 1);
  const ayer = ayerDt.toISOString().split('T')[0];

  let values: number[];

  if (onlyDate === today) {
    // Hoy: la curva base (sin cambios)
    values = basePerHour.slice();
  } else if (onlyDate === ayer) {
    // Ayer: ligeramente menor en promedio y con variación horaria fija para que se vea diferente
    values = basePerHour.map((v, i) => {
      // factor determinístico por índice para crear una forma ligeramente distinta
      const factor = 0.88 + ( (i % 6) * 0.02 ); // entre 0.88 y 0.98
      // "ruido" determinístico, negativo o positivo pequeño
      const noise = (((i * 37) % 11) - 5) / 100; // entre -0.05 y +0.05
      const val = v * factor + noise;
      return Math.round(val * 100) / 100;
    });
  } else {
    // Otra fecha: versión neutral (ligeramente suavizada)
    values = basePerHour.map((v, i) => {
      const val = v * 0.96 + ((i % 3) - 1) * 0.01; // pequeña variación
      return Math.round(val * 100) / 100;
    });
  }

  const result = values.map((v, i) => ({ hora: String(i).padStart(2, '0') + ':00', caudal_m3: v }));
  return of(result);
}


}

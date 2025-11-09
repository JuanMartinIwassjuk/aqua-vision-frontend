// eventos-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule} from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { AquaEvent, } from '../../../models/aquaEvent';
import { EventTag } from '../../../models/eventTag';
import { ReporteAdminService } from '../../../services/reporteAdmin.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-eventos-admin',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './eventos-admin.component.html',
  styleUrls: ['./eventos-admin.component.css']
})
export class EventosAdminComponent implements OnInit {

  fechaDesde?: string;
  fechaHasta?: string;

  tags: EventTag[] = [];
  selectedTags: { [id: number]: boolean } = {};

  // stats
  totalEventos = 0;
  totalLitros = 0;
  totalCosto = 0;

  // charts
  tagPieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  eventsByDayData: ChartData<'bar'> = { labels: [], datasets: [] };

  // template-safe chart options
  chartResponsiveOptions: ChartOptions = { responsive: true };

  // lista de eventos en el tipo del modelo
  eventosList: AquaEvent[] = [];
  eventosListSorted: AquaEvent[] = [];

  constructor(private reporteService: ReporteAdminService) {}

  ngOnInit(): void {
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(hoy.getMonth() - 1);
    this.fechaDesde = haceMes.toISOString().split('T')[0];
    this.fechaHasta = hoy.toISOString().split('T')[0];

    this.reporteService.getTags().subscribe(t => {
      // casteo seguro; si tu service ya devuelve el mismo tipo, esto es directo
      this.tags = (t as any) as EventTag[];
      this.tags.forEach(tag => this.selectedTags[tag.id] = true);
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const tagIds = Object.keys(this.selectedTags)
      .filter(k => this.selectedTags[+k])
      .map(k => +k);

    this.reporteService.getEventosFiltro(this.fechaDesde, this.fechaHasta, tagIds)
      .subscribe(evts => {
        // mapear fechas string -> Date para que coincida con el modelo (si es necesario)
        const mapped: AquaEvent[] = (evts || []).map((e: any) => {
          const fechaInicio = e.fechaInicio ? new Date(e.fechaInicio) : undefined;
          const fechaFin = e.fechaFin ? new Date(e.fechaFin) : undefined;
          const base = { ...(e as any) } as any;
          base.fechaInicio = fechaInicio;
          base.fechaFin = fechaFin;
          return base as AquaEvent;
        });

        this.eventosList = mapped;

        // ordenar por litros consumidos (desc) para ranking
        this.eventosListSorted = [...this.eventosList].sort((a, b) => {
          const la = Number(a.litrosConsumidos ?? 0);
          const lb = Number(b.litrosConsumidos ?? 0);
          return lb - la;
        }).slice(0, 25);

        this.calcularResumenes();
        this.generarCharts();
      }, err => {
        console.error('Error cargando eventos (admin):', err);
        this.eventosList = [];
        this.eventosListSorted = [];
        this.calcularResumenes();
        this.generarCharts();
      });
  }

  calcularResumenes(): void {
    this.totalEventos = this.eventosList.length;
    this.totalLitros = Math.round(this.eventosList.reduce((s, e) => s + (e.litrosConsumidos || 0), 0) * 100) / 100;
    this.totalCosto = Math.round(this.eventosList.reduce((s, e) => s + (e.costo || 0), 0) * 100) / 100;
  }

  generarCharts(): void {
    // Pie: proporción por tag (cantidad de eventos)
    const counts: Record<string, number> = {};
    const colorMap: Record<string, string> = {};
    this.tags.forEach(t => { counts[t.nombre] = 0; colorMap[t.nombre] = (t as any).color || '#888'; });

    this.eventosList.forEach(e => {
      (e.tags || []).forEach((t: any) => {
        counts[t.nombre] = (counts[t.nombre] || 0) + 1;
        if (t.color && !colorMap[t.nombre]) colorMap[t.nombre] = t.color;
      });
    });

    const labels = Object.keys(counts).filter(k => counts[k] > 0);
    const values = labels.map(l => counts[l]);
    const background = labels.map(l => colorMap[l] || '#ccc');

    this.tagPieData = { labels, datasets: [{ label: 'Eventos por Tag', data: values, backgroundColor: background }] };

    // Bar: eventos por día
    const byDay: Record<string, number> = {};
    this.eventosList.forEach(e => {
      const dayDate = (e.fechaInicio instanceof Date) ? e.fechaInicio : new Date(e.fechaInicio || '');
      const day = isNaN(dayDate.getTime()) ? 'unknown' : dayDate.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    const days = Object.keys(byDay).filter(d => d !== 'unknown').sort();
    const dayValues = days.map(d => byDay[d]);
    const labelsDay = days.map(d => {
      const dt = new Date(d);
      return dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    });

    this.eventsByDayData = {
      labels: labelsDay,
      datasets: [{ data: dayValues, label: 'Eventos por día' }]
    };
  }

  get activeTagsCount(): number {
    return this.tags.filter(t => !!this.selectedTags[t.id]).length;
  }

  /**
   * Devuelve un string legible con la fecha y hora.
   * Acepta string | Date | undefined.
   */
  formatDateTime(value?: string | Date | undefined): string {
    if (!value) return '';
    let d: Date;
    if (value instanceof Date) {
      d = value;
    } else {
      d = new Date(value);
    }
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString('es-AR');
  }

  /** Helpers para template (evita optional chaining complejo en el HTML) */
  badgeColor(e: AquaEvent): string {
    try {
      const t0 = (e as any).tags && (e as any).tags[0];
      return t0 && t0.color ? t0.color : '#999';
    } catch {
      return '#999';
    }
  }

  badgeName(e: AquaEvent): string {
    try {
      const t0 = (e as any).tags && (e as any).tags[0];
      return t0 && t0.nombre ? t0.nombre : 'Tag';
    } catch {
      return 'Tag';
    }
  }

  /**
   * Devuelve el identificador del hogar de forma segura:
   * - si existe e.hogarId lo retorna
   * - si existe e.hogar?.id lo retorna
   * - si no, devuelve '—'
   */
  getHogarLabel(e: AquaEvent): string {
    const anyE = e as any;
    if (anyE.hogarId !== undefined && anyE.hogarId !== null) return String(anyE.hogarId);
    if (anyE.hogar && (anyE.hogar.id !== undefined && anyE.hogar.id !== null)) return String(anyE.hogar.id);
    return '—';
  }

  exportarExcel(): void {
    // TODO: implementar export con backend
    console.warn('Exportar Excel eventos: TODO backend');
  }

  exportarPDF(): void {
    // TODO
    console.warn('Exportar PDF eventos: TODO backend');
  }

  toggleTag(id: number): void {
    this.selectedTags[id] = !this.selectedTags[id];
    this.aplicarFiltro();
  }
}
// gamificacion-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ReporteAdminService } from '../../../services/reporteAdmin.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


interface PuntosDia { fecha: string; puntos: number; }
interface HogarRanking { id?: number; nombre: string; puntos: number; puntaje_ranking: number; racha: number; }

@Component({
  selector: 'app-gamificacion-admin',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './gamification-admin.component.html',
  styleUrls: ['./gamification-admin.component.css']
})
export class GamificacionAdminComponent implements OnInit {

  fechaDesde?: string;
  fechaHasta?: string;

  // resumen
  totalHogares = 0;
  totalPuntos = 0;
  mediaDiaria = 0;
  mejorRacha = 0;

  // charts
  pointsByDayData: ChartData<'bar'> = { labels: [], datasets: [] };
  pointsByMonthData: ChartData<'line'> = { labels: [], datasets: [] };

  // chart options (separados para personalizar estilo)
  pointsByDayOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 14 } },
      y: { beginAtZero: true, title: { display: true, text: 'Puntos' } }
    }
  };

  pointsByMonthOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { ticks: { autoSkip: true } },
      y: { beginAtZero: true, title: { display: true, text: 'Puntos' } }
    }
  };

  // listas / rankings
  hogaresList: HogarRanking[] = [];
  rankingFullPoints: HogarRanking[] = [];
  rankingFullRachas: HogarRanking[] = [];

  // modales
  showRankingPoints = false;
  showRankingRachas = false;
  showMedalModal = false;
  selectedHogarMedals: string[] = [];
  selectedHogarName = '';

  constructor(private reporteAdminService: ReporteAdminService) {}

  ngOnInit(): void {
    const hoy = new Date();
    const haceMes = new Date(hoy);
    haceMes.setMonth(hoy.getMonth() - 1);

    this.fechaDesde = haceMes.toISOString().split('T')[0];
    this.fechaHasta = hoy.toISOString().split('T')[0];

    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;

    forkJoin({
      puntosPeriodo: this.reporteAdminService.getPuntosPorPeriodo(this.fechaDesde, this.fechaHasta).pipe(catchError(() => of([] as PuntosDia[]))),
      resumen: this.reporteAdminService.getResumenGamificacion(this.fechaDesde, this.fechaHasta).pipe(catchError(() => of({ total:0, media:0, mejorRacha:0 }))),
      rankingPoints: this.reporteAdminService.getRankingPuntos(this.fechaDesde, this.fechaHasta).pipe(catchError(() => of([]))),
      rankingRachas: this.reporteAdminService.getRankingRachas(this.fechaDesde, this.fechaHasta).pipe(catchError(() => of([]))),
      hogares: this.reporteAdminService.getHogares().pipe(catchError(() => of([])))
    }).subscribe(({ puntosPeriodo, resumen, rankingPoints, rankingRachas, hogares }) => {
      // resumen
      this.totalHogares = (hogares || []).length;
      this.totalPuntos = resumen.total || 0;
      this.mediaDiaria = resumen.media || 0;
      this.mejorRacha = resumen.mejorRacha || 0;

      // charts
      this.buildPointsByDayChart(puntosPeriodo || []);
      this.buildPointsByMonthChart(puntosPeriodo || []);

      // rankings (aseguro tipado)
      this.rankingFullPoints = (rankingPoints || []).map((r: any, idx: number) => ({
        id: r.id ?? idx,
        nombre: r.nombre ?? `Hogar ${idx+1}`,
        puntos: Number(r.puntos || 0),
        puntaje_ranking: Number(r.puntaje_ranking || 0),
        racha: Number((r as any).racha || 0)
      })).sort((a,b) => b.puntos - a.puntos);

      this.rankingFullRachas = (rankingRachas || []).map((r: any, idx: number) => ({
        id: r.id ?? idx,
        nombre: r.nombre ?? `Hogar ${idx+1}`,
        puntos: Number(r.puntos || 0),
        puntaje_ranking: Number(r.puntaje_ranking || 0),
        racha: Number(r.racha || 0)
      })).sort((a,b) => b.racha - a.racha);

      // hogaresList opcional (puede usarse si necesitás listado quick)
      this.hogaresList = (hogares || []).map((h: any, i: number) => ({
        id: h.id ?? i,
        nombre: h.nombre ?? `Hogar ${i+1}`,
        puntos: Number(h.puntos || 0),
        puntaje_ranking: Number(h.puntaje_ranking || 0),
        racha: Number(h.rachaDiaria || h.racha || 0)
      })).sort((a,b) => b.puntos - a.puntos);

    }, err => {
      console.error('Error cargando gamificación', err);
    });
  }

  buildPointsByDayChart(data: PuntosDia[]): void {
    const byDay: Record<string, number> = {};
    (data || []).forEach(d => {
      const dayKey = (d.fecha || '').substring(0,10);
      if (!byDay[dayKey]) byDay[dayKey] = 0;
      byDay[dayKey] += Number(d.puntos || 0);
    });

    const days = Object.keys(byDay).sort();
    const values = days.map(d => byDay[d]);

    // paleta profesional (azul -> teal)
    const bg = days.map(() => 'rgba(37,99,235,0.85)'); // barra principal
    const border = days.map(() => 'rgba(8,29,74,0.95)');

    this.pointsByDayData = {
      labels: days.map(d => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })),
      datasets: [{
        label: 'Puntos por día',
        data: values,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        maxBarThickness: 44,
        barThickness: 'flex'
      }]
    };
  }

  buildPointsByMonthChart(data: PuntosDia[]): void {
    const byMonth: Record<string, number> = {};
    (data || []).forEach(d => {
      const dt = new Date(d.fecha);
      if (isNaN(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      byMonth[key] = (byMonth[key] || 0) + Number(d.puntos || 0);
    });

    const months = Object.keys(byMonth).sort();
    const values = months.map(m => byMonth[m]);

    this.pointsByMonthData = {
      labels: months.map(m => {
        const [y, mm] = m.split('-');
        const monthIdx = Number(mm) - 1;
        return new Date(Number(y), monthIdx, 1).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Puntos por mes',
        data: values,
        fill: true,
        tension: 0.32,
        borderColor: 'rgba(6,182,212,0.95)',
        backgroundColor: 'rgba(6,182,212,0.12)',
        pointBackgroundColor: 'rgba(6,182,212,1)',
        pointRadius: 4,
        borderWidth: 2
      }]
    };
  }

  // atajos
  setAtajo(rango: '7d' | '1m' | '3m' | '6m'): void {
    const hoy = new Date();
    const desde = new Date(hoy);
    switch (rango) {
      case '7d': desde.setDate(hoy.getDate() - 6); break;
      case '1m': desde.setMonth(hoy.getMonth() - 1); break;
      case '3m': desde.setMonth(hoy.getMonth() - 3); break;
      case '6m': desde.setMonth(hoy.getMonth() - 6); break;
    }
    this.fechaDesde = desde.toISOString().split('T')[0];
    this.fechaHasta = new Date().toISOString().split('T')[0];
    this.aplicarFiltro();
  }

  exportarExcel(): void { console.warn('Exportar Excel gamificacion: TODO backend'); }
  exportarPDF(): void { console.warn('Exportar PDF gamificacion: TODO backend'); }

  toggleRankingPoints(): void { this.showRankingPoints = !this.showRankingPoints; }
  toggleRankingRachas(): void { this.showRankingRachas = !this.showRankingRachas; }

  // --- Medallas: abre modal y solicita medallas al service ---
  openMedallas(hogarId?: number, hogarNombre?: string): void {
    if (!hogarId && hogarId !== 0) {
      // si no hay id, sólo mostrar nombre
      this.selectedHogarName = hogarNombre ?? 'Hogar';
      this.selectedHogarMedals = [];
      this.showMedalModal = true;
      return;
    }

    this.selectedHogarName = hogarNombre ?? 'Hogar';
    // llama al service (necesitas agregar getMedallasPorHogar en ReporteAdminService)
    (this.reporteAdminService.getMedallasPorHogar ? this.reporteAdminService.getMedallasPorHogar(hogarId) : of([]))
      .pipe(catchError(() => of([])))
      .subscribe((meds: string[]) => {
        this.selectedHogarMedals = meds || [];
        this.showMedalModal = true;
      }, err => {
        console.error('Error al obtener medallas', err);
        this.selectedHogarMedals = [];
        this.showMedalModal = true;
      });
  }

  closeMedalModal(): void {
    this.showMedalModal = false;
    this.selectedHogarMedals = [];
    this.selectedHogarName = '';
  }
  
}
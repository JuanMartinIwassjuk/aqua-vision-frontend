// consumo-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ReporteAdminService } from '../../../services/reporteAdmin.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-consumo-admin',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './consumo-admin.component.html',
  styleUrls: ['./consumo-admin.component.css']
})
export class ConsumoAdminComponent implements OnInit {

  fechaDesde?: string;
  fechaHasta?: string;

  resumen: { total: number, media: number, pico: number, costo: number } = { total: 0, media: 0, pico: 0, costo: 0 };

  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  loading = false;
  sinDatos = false;

  constructor(private reporteService: ReporteAdminService) { }

  ngOnInit(): void {
    const hoy = new Date();
    const haceMes = new Date();
    haceMes.setMonth(hoy.getMonth() - 1);

    this.fechaDesde = this.formatFechaLocal(haceMes);
    this.fechaHasta = this.formatFechaLocal(hoy);

    this.aplicarFiltro();
  }

  private formatFechaLocal(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  aplicarFiltro(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.loading = true;
    forkJoin({
      periodo: this.reporteService.getConsumoGlobalPorPeriodo(this.fechaDesde, this.fechaHasta),
      resumen: this.reporteService.getResumenConsumoGlobal(this.fechaDesde, this.fechaHasta)
    }).subscribe(({ periodo, resumen }) => {
      this.loading = false;
      this.resumen = resumen;
      this.sinDatos = !periodo || periodo.length === 0 || periodo.every(p => p.totalLitros === 0);
      this.generarGrafico(periodo);
    }, err => {
      console.error('Error al obtener consumo global', err);
      this.loading = false;
      this.sinDatos = true;
    });
  }

  generarGrafico(data: { fecha: string, totalLitros: number, costo: number }[]): void {
    const labels = data.map(d => {
      const dt = new Date(d.fecha);
      return dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    });
    const valores = data.map(d => d.totalLitros);
    const costos = data.map(d => d.costo);

    this.lineChartData = {
      labels,
      datasets: [
        { data: valores, label: 'Litros totales', fill: true, tension: 0.3 },
        { data: costos, label: 'Costo ($)', yAxisID: 'y1', fill: false, tension: 0.3 }
      ]
    };

    // attach dual axis via options
    this.lineChartOptions = {
      ...this.lineChartOptions,
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { beginAtZero: true, title: { display: true, text: 'Litros' } },
        y1: { position: 'right', beginAtZero: true, grid: { display: false }, title: { display: true, text: 'Costo ($)' } }
      }
    };
  }

  exportarExcel(): void {
    // TODO: implementar con datos reales del backend más completos
    console.warn('Exportar Excel - pendiente implementar backend.');
  }

  exportarPDF(): void {
    // TODO: descargar PDF desde backend
    console.warn('Exportar PDF - pendiente implementar backend.');
  }

  setAtajo(r: '7d' | '1m' | '3m'): void {
    const hoy = new Date();
    const desde = new Date();
    if (r === '7d') desde.setDate(hoy.getDate() - 6);
    if (r === '1m') desde.setMonth(hoy.getMonth() - 1);
    if (r === '3m') desde.setMonth(hoy.getMonth() - 3);
    this.fechaDesde = this.formatFechaLocal(desde);
    this.fechaHasta = this.formatFechaLocal(hoy);
    this.aplicarFiltro();
  }
}

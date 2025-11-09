import { Component,OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ReporteAdminService } from '../../../services/reporteAdmin.service';

@Component({
  selector: 'app-localidad-admin',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './localidad-admin.component.html',
  styleUrls: ['./localidad-admin.component.css']
})
export class LocalidadAdminComponent implements OnInit {

  fechaDesde?: string;
  fechaHasta?: string;

  resumenPorLocalidad: { localidad: string, total: number, media: number, costo: number, hogares: number }[] = [];

  totalGlobal = 0; // precalculado para usar desde el template

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } };

  constructor(private reporteService: ReporteAdminService) { }

  ngOnInit(): void {
    const hoy = new Date();
    const haceTresMes = new Date();
    haceTresMes.setMonth(hoy.getMonth() - 3);
    this.fechaDesde = haceTresMes.toISOString().split('T')[0];
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (!this.fechaDesde || !this.fechaHasta) return;
    this.reporteService.getConsumoPorLocalidad(this.fechaDesde, this.fechaHasta).subscribe(data => {
      this.resumenPorLocalidad = data.sort((a,b) => b.total - a.total);
      this.totalGlobal = this.resumenPorLocalidad.reduce((s, r) => s + (r.total || 0), 0);
      this.generarGrafico();
    }, err => console.error('Error localidad', err));
  }

  generarGrafico(): void {
    const labels = this.resumenPorLocalidad.map(r => r.localidad);
    const totals = this.resumenPorLocalidad.map(r => r.total);
    this.barChartData = { labels, datasets: [{ data: totals, label: 'Litros totales por localidad' }] };
  }

  exportarExcel(): void {
    // TODO: descargar XLSX desde backend
    console.warn('Exportar Excel localidad: TODO backend');
  }

  exportarPDF(): void {
    // TODO
    console.warn('Exportar PDF localidad: TODO backend');
  }

}
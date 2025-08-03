import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions,ChartDataset } from 'chart.js';
import { ReporteService } from '../../../services/reports.service';
import { ReporteMensual } from '../../../models/reporteMensual';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-reporte-historico',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './reporte-historico.component.html',
  styleUrls: ['./reporte-historico.component.css']
})
export class ReporteHistoricoComponent implements OnInit {
  sectoresOriginales: ReporteMensual[] = [];
  sectoresFiltrados: ReporteMensual[] = [];
  sectoresDisponibles: string[] = [];
  sectoresSeleccionados: { [nombre: string]: boolean } = {};

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.sectoresOriginales = this.reporteService.getConsumoMensualPorSector();
    this.sectoresDisponibles = [...new Set(this.sectoresOriginales.map(s => s.nombre_sector))];
    this.sectoresDisponibles.forEach(nombre => this.sectoresSeleccionados[nombre] = true);
    this.actualizarDatos();
  }

  actualizarDatos(): void {
    const filtrados = this.sectoresOriginales.filter(s => this.sectoresSeleccionados[s.nombre_sector]);
    this.sectoresFiltrados = filtrados;

    const mesesUnicos = [...new Set(filtrados.map(s => s.mes))];
    const sectoresUnicos = [...new Set(filtrados.map(s => s.nombre_sector))];

    const datasets: ChartDataset<'bar'>[] = [
      {
        label: 'Consumo total',
        data: [],
        backgroundColor: '#00D4FF'
      },
      {
        label: 'Media de consumo',
        data: [],
        backgroundColor: '#e5be01'
      },
      {
        label: 'Pico máximo',
        data: [],
        backgroundColor: 'red'
      }
    ];

    mesesUnicos.forEach(mes => {
      const registrosDelMes = filtrados.filter(s => s.mes === mes);

      const total = registrosDelMes.reduce((sum, r) => sum + r.consumo_total, 0);
      const media = registrosDelMes.reduce((sum, r) => sum + r.media_consumo, 0) / registrosDelMes.length;
      const pico = Math.max(...registrosDelMes.map(r => r.pico_maximo));

      (datasets[0].data as number[]).push(total);
      (datasets[1].data as number[]).push(media);
      (datasets[2].data as number[]).push(pico);
    });

    this.barChartData = {
      labels: mesesUnicos,
      datasets
    };
  }
}

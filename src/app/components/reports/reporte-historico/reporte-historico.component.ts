import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartDataset } from 'chart.js';
import { ReporteService } from '../../../services/reports.service';
import { ReporteMensual } from '../../../models/reporteMensual';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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
  resumenPorSector: { [sector: string]: { total: number, pico: number, media: number, costo: number } } = {};

  fechaDesde?: string;
  fechaHasta?: string;

  totalGlobal: number = 0;
  mediaGlobal: number = 0;
  picoGlobal: number = 0;
  costoGlobal: number = 0; // 🔹 Nuevo

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    const hoy = new Date();
    const haceSeisMeses = new Date();
    haceSeisMeses.setMonth(hoy.getMonth() - 5); 

    this.fechaDesde = haceSeisMeses.toISOString().split('T')[0];
    this.fechaHasta = hoy.toISOString().split('T')[0];

    this.sectoresOriginales = this.reporteService.getConsumoMensualPorSector();
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

    this.sectoresFiltrados = this.sectoresOriginales.filter(registro => {
      const fechaRegistro = new Date(registro.mes + '-01');

      if (desde && fechaRegistro < desde) return false;
      if (hasta && fechaRegistro > hasta) return false;

      return true;
    });

    this.calcularResumenes();
    this.generarGrafico();
  }

  calcularResumenes(): void {
    this.totalGlobal = 0;
    this.mediaGlobal = 0;
    this.picoGlobal = 0;
    this.costoGlobal = 0; // 🔹 Nuevo
    this.resumenPorSector = {};

    if (this.sectoresFiltrados.length === 0) return;

    for (const registro of this.sectoresFiltrados) {
      this.totalGlobal += registro.consumo_total;
      this.mediaGlobal += registro.media_consumo;
      this.picoGlobal = Math.max(this.picoGlobal, registro.pico_maximo);
      this.costoGlobal += registro.costo || 0; // 🔹 Nuevo

      if (!this.resumenPorSector[registro.nombre_sector]) {
        this.resumenPorSector[registro.nombre_sector] = {
          total: 0,
          pico: 0,
          media: 0,
          costo: 0
        };
      }

      const sectorResumen = this.resumenPorSector[registro.nombre_sector];
      sectorResumen.total += registro.consumo_total;
      sectorResumen.media += registro.media_consumo;
      sectorResumen.pico = Math.max(sectorResumen.pico, registro.pico_maximo);
      sectorResumen.costo += registro.costo || 0; 
    }

    this.mediaGlobal = this.mediaGlobal / this.sectoresFiltrados.length;
  }

  generarGrafico(): void {
    const agrupadoPorMes: { [mesAnio: string]: ReporteMensual[] } = {};

    this.sectoresFiltrados.forEach(r => {
      const key = r.mes;
      if (!agrupadoPorMes[key]) agrupadoPorMes[key] = [];
      agrupadoPorMes[key].push(r);
    });

    const labels: string[] = [];
    const consumosTotales: number[] = [];
    const medias: number[] = [];
    const picosMaximos: number[] = [];

    Object.entries(agrupadoPorMes).forEach(([key, reportes]) => {
      const total = reportes.reduce((acc, r) => acc + r.consumo_total, 0);
      const media = reportes.reduce((acc, r) => acc + r.media_consumo, 0) / reportes.length;
      const pico = Math.max(...reportes.map(r => r.pico_maximo));

      const [anio, mes] = key.split('-');
      const nombreMes = this.obtenerNombreMes(+mes);
      labels.push(`${nombreMes} ${anio}`);
      consumosTotales.push(total);
      medias.push(+media.toFixed(2));
      picosMaximos.push(pico);
    });

    this.barChartData = {
      labels,
      datasets: [
        { data: consumosTotales, label: 'Consumo Total',  backgroundColor: '#00D4FF' },
        { data: medias, label: 'Media Consumo', backgroundColor: '#e5be01' },
        { data: picosMaximos, label: 'Pico Máximo', backgroundColor: 'red' }
      ]
    };
  }

  obtenerNombreMes(numeroMes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1] ?? '';
  }

  exportarExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.sectoresFiltrados);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Histórico');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(data, `reporte_historico_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

exportarPDF(): void {
  if (this.fechaDesde && this.fechaHasta) {
    this.reporteService.descargarReportePDF(2, this.fechaDesde, this.fechaHasta);
  } else {
    console.warn('Faltan fechas para exportar el PDF');
  }
}



}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

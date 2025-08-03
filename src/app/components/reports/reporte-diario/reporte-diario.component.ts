import { Component,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ReporteService } from '../../../services/reports.service'
import { ReporteDiario } from '../../../models/reporteDiario';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-diario',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './reporte-diario.component.html',
  styleUrl: './reporte-diario.component.css'
})
export class ReporteDiarioComponent {
  public sectoresOriginales: ReporteDiario[] = [];
  public sectoresFiltrados: ReporteDiario[] = [];
  public cantidadSectores : number=0;
  public esHogar: boolean = false;

  public sectoresDisponibles: string[] = [];
  public sectoresSeleccionados: { [nombre: string]: boolean } = {};

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  public pieChartType: ChartType = 'doughnut';

  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    this.sectoresOriginales = this.reporteService.getConsumoDiarioPorSector();
    this.sectoresDisponibles = this.sectoresOriginales.map(s => s.nombre_sector);
    this.sectoresDisponibles.forEach(nombre => this.sectoresSeleccionados[nombre] = true);
    this.cantidadSectores=this.sectoresOriginales.length;
    this.esHogar = this.cantidadSectores === 1;
    this.actualizarDatos();
  }


  actualizarDatos() {
    const filtrados = this.sectoresOriginales.filter(
      s => this.sectoresSeleccionados[s.nombre_sector]
    );
    this.sectoresFiltrados = filtrados;


    const sectoresAgrupados: { [sector: string]: { consumo_total: number, media_consumo: number, pico_maximo: number, count: number } } = {};

    filtrados.forEach(s => {
      if (!sectoresAgrupados[s.nombre_sector]) {
        sectoresAgrupados[s.nombre_sector] = {
          consumo_total: 0,
          media_consumo: 0,
          pico_maximo: 0,
          count: 0
        };
      }
      sectoresAgrupados[s.nombre_sector].consumo_total += s.consumo_total;
      sectoresAgrupados[s.nombre_sector].media_consumo += s.media_consumo;
      sectoresAgrupados[s.nombre_sector].pico_maximo = Math.max(
        sectoresAgrupados[s.nombre_sector].pico_maximo,
        s.pico_maximo
      );
      sectoresAgrupados[s.nombre_sector].count += 1;
    });

    const labels = Object.keys(sectoresAgrupados);
    const consumoTotales = labels.map(sector => sectoresAgrupados[sector].consumo_total);
    const medias = labels.map(sector =>
      sectoresAgrupados[sector].media_consumo / sectoresAgrupados[sector].count
    );
    const picos = labels.map(sector => sectoresAgrupados[sector].pico_maximo);


    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Consumo total',
          data: consumoTotales,
          backgroundColor: '#00D4FF'
        },
        {
          label: 'Media de consumo',
          data: medias,
          backgroundColor: '#e5be01'
        },
        {
          label: 'Pico máximo',
          data: picos,
          backgroundColor: 'red'
        }
      ]
    };


    const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    const backgroundColor = labels.map((_, i) => colorPalette[i % colorPalette.length]);

    this.pieChartData = {
      labels,
      datasets: [
        {
          label: 'Proporción de consumo por sector',
          data: consumoTotales,
          backgroundColor
        }
      ]
    };
  }
}
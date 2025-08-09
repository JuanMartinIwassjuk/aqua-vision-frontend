import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  imports: [NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Caudal (m³)'
        }
      },
      x: {
        title: {
          display: true,
        }
      }
    }
  };

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    const datos = this.reporteService.getConsumoPorHora();
    const horas = datos.map(d => d.hora);
    const caudales = datos.map(d => d.caudal_m3 ?? null);

    this.lineChartData = {
      labels: horas,
      datasets: [
        {
          label: 'Caudal por hora',
          data: caudales,
          fill: false,
          borderColor: '#36A2EB',
          backgroundColor: '#36A2EB',
          tension: 0.3, 
          pointRadius: 3,
          pointBackgroundColor: '#008C9E'
        }
      ]
    };
  }
}

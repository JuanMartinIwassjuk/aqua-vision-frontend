import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/serviceAuth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [NgChartsModule, CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  consumoDia!: number;
  consumoColor!: string;
  medidoresConectados!: number;
  medidoresDesconectados!: number;
  estadoMedidores: {conectados: number, desconectados: number} | undefined

  medidoresConectadosAdmin!: number;
  medidoresDesconectadosAdmin!: number;
  totalHogaresAdmin!: number;
  totalTriviasAdmin!: number;
  consumoPromedio!: number;
  

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public lineChartDataAdmin: ChartData<'line'> = {
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

  constructor(private reporteService: ReporteService, private authService: AuthService) {}

  ngOnInit(): void {
    const datos = this.reporteService.getConsumoPorHora();
    const horas = datos.map(d => d.hora);
    const caudales = datos.map(d => d.caudal_m3 ?? null);

    const datosAdmin = this.reporteService.getConsumoTotalHogaresPorHora();
    const horasTotales = datosAdmin.map(d => d.hora);
    const caudalesTotales = datosAdmin.map(d => d.caudal_m3 ?? null);

    if (!this.isAdmin) {
    this.consumoDia = this.reporteService.getConsumoUltimoDia();
    this.estadoMedidores = this.reporteService.getEstadoMedidores();
    this.medidoresConectados = this.estadoMedidores.conectados;
    this.medidoresDesconectados = this.estadoMedidores.desconectados;
    this.setConsumoStatus();
    }

    if (this.isAdmin) {
      this.medidoresConectadosAdmin = this.reporteService.getTotalMedidoresConectados();
      this.medidoresDesconectadosAdmin = this.reporteService.getTotalMedidoresDesconectados();
      this.totalHogaresAdmin = this.reporteService.getTotalHogares();
      this.totalTriviasAdmin = this.reporteService.getTotalTriviasCompletadas();
      this.consumoPromedio = this.reporteService.getConsumoPromedio();
    }

    this.lineChartData = {
      labels: horas,
      datasets: [
        {
          label: 'Caudal medido',
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

    this.lineChartDataAdmin = {
      labels: horasTotales,
      datasets: [
        {
          label: 'Caudal medido',
          data: caudalesTotales,
          fill: false,
          borderColor: '#f25932ff',
          backgroundColor: '#f25932ff',
          tension: 0.3, 
          pointRadius: 3,
          pointBackgroundColor: '#f04318ff'
        }
      ]
    };

  }

  setConsumoStatus() {
    if (this.consumoDia <= 60) {
      this.consumoColor = '#4eb867ff';
    } else if (this.consumoDia <= 70) {
      this.consumoColor = '#ffb700ff'; 
    } else {
      this.consumoColor = '#e53935'; 
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isUser(): boolean {
    return this.authService.isUser();
  }
}

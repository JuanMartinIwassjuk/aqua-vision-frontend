import { Component, OnInit } from '@angular/core';
import { ChartData, ChartEvent, ChartOptions } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


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

  constructor(private reporteService: ReporteService, private authService: AuthService,  private snackBar: MatSnackBar) {}

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

onChartClick(event: { event?: ChartEvent, active?: any[] }) {
  if (event.active && event.active.length > 0) {
    const element = event.active[0];
    const datasetIndex = element.datasetIndex;
    const dataIndex = element.index;

    const labels = this.isAdmin ? this.lineChartDataAdmin.labels : this.lineChartData.labels;
    const datasets = this.isAdmin ? this.lineChartDataAdmin.datasets : this.lineChartData.datasets;

    const hora = labels?.[dataIndex];
    const valor = datasets[datasetIndex].data[dataIndex] as number;

    console.log(`Click detectado → Hora: ${hora}, Consumo: ${valor}`);

    if (hora !== undefined && valor !== undefined && valor !== null) {
      this.snackBar.open(
        `Hora ${hora} → Consumo: ${valor} m³`,
        'Cerrar',
        { duration: 3000 }
      );
    }
  } else {
    console.log('Click detectado en el gráfico, pero no en un punto de datos.');
  }
}


}

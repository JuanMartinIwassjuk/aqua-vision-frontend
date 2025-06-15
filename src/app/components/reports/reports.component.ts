import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ReporteService } from '../../services/reports.service';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  public pieChartType: ChartType = 'pie';

  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#00BCEB', '#00D4FF', '#008C9E', '#F76C5E']
      }
    ]
  };

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  public barChartData = [
    {
      data: [] as number[],
      label: 'Consumo (litros)',
      backgroundColor: '#00D4FF'
    }
  ];

  public barChartFullData: ChartData<'bar'> = {
    labels: [],
    datasets: this.barChartData
  };

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    const consumoPorArea = this.reporteService.getConsumoPorTipo();
    this.pieChartData.labels = consumoPorArea.labels;
    this.pieChartData.datasets[0].data = consumoPorArea.data;

    const consumoMensual = this.reporteService.getConsumoMensual();
    this.barChartFullData.labels = consumoMensual.labels;
    this.barChartData[0].data = consumoMensual.data;
  }
}
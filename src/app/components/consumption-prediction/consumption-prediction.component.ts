import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType  } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-consumption-prediction',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './consumption-prediction.component.html',
  styleUrl: './consumption-prediction.component.css'
})
export class ConsumptionPredictionComponent implements OnInit {

  public sectoresPrediccion: any[] = [];
  public homeId!: number;


  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };


  public costChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  public costChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private reporteService: ReporteService,private homeService: HomeService) {}

ngOnInit(): void {
  const umbralMensual = 120.5; 
    this.homeService.homeId$.subscribe(id => {
      if (id !== null) {
        this.homeId= id;
      }
    });

    this.reporteService.getPrediccionConsumo(this.homeId, umbralMensual).subscribe({
    next: (data) => {
      this.sectoresPrediccion = data;
      this.cargarGraficos();
    },
    error: (err) => console.error('Error cargando predicción', err)
  });
}

  private cargarGraficos(): void {
    const labels = this.sectoresPrediccion.map(s => s.nombre_sector);
    const consumoActual = this.sectoresPrediccion.map(s => s.consumo_actual);
    const consumoProyectado = this.sectoresPrediccion.map(s => s.consumo_proyectado);
    const costoActual = this.sectoresPrediccion.map(s => s.costo_actual);
    const costoProyectado = this.sectoresPrediccion.map(s => s.costo_proyectado);


    this.lineChartData = {
      labels,
      datasets: [
        { label: 'Consumo Actual (L)', data: consumoActual, borderColor: '#00D4FF', backgroundColor: '#00D4FF', fill: false, tension: 0.3 },
        { label: 'Consumo Proyectado (L)', data: consumoProyectado, borderColor: '#FF6384', backgroundColor: '#FF6384', fill: false, tension: 0.3 }
      ]
    };

    this.costChartData = {
      labels,
      datasets: [
        { label: 'Costo Actual ($)', data: costoActual, backgroundColor: '#36A2EB' },
        { label: 'Costo Proyectado ($)', data: costoProyectado, backgroundColor: '#FF9F40' }
      ]
    };
  }
}

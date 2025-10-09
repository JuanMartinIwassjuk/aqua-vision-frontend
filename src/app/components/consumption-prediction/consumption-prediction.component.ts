import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType  } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { HomeService } from '../../services/home.service';
import { PuntoConsumo } from '../../models/prediction/puntoConsumo';

import { ChartConfiguration } from 'chart.js';
import { ConsumoService } from '../../services/consumo.service';
import { SectorProyeccion } from '../../models/prediction/sectorProyeccion';
import { PrediccionPorDia } from '../../models/prediction/prediccionPorDia';


@Component({
  selector: 'app-consumption-prediction',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './consumption-prediction.component.html',
  styleUrls: ['./consumption-prediction.component.css']
})
export class ConsumptionPredictionComponent implements OnInit {

  sectores: any[] = [];

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Día del mes' },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
      },
      y: {
        title: { display: true, text: 'Consumo (Litros)' },
        beginAtZero: true
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    }
  };

  constructor(private consumoService: ConsumoService) {}

  ngOnInit(): void {
    this.cargarPrediccion();
  }

  cargarPrediccion(): void {
    const hogarId = 1;


this.consumoService.getPrediccionConsumoPorDia(hogarId).subscribe({
  next: (response) => {
    this.sectores = Object.entries(response).map(
      ([nombreSector, datosSector]) => {
        const labels = datosSector.dias.map(d => d.toString());
        const consumoHistorico = datosSector.consumoHistorico ?? [];
        const consumoActual = datosSector.consumoActual ?? [];
        const consumoProyectado = datosSector.consumoProyectado ?? [];
        const tendenciaMin = datosSector.tendenciaMin ?? [];
        const tendenciaMax = datosSector.tendenciaMax ?? [];

        const costoPorLitro = 3;
        const costoActual = (consumoActual.reduce((a, b) => a + b, 0) * costoPorLitro).toFixed(2);
        const costoProyectado = (consumoProyectado.reduce((a, b) => a + b, 0) * costoPorLitro).toFixed(2);

        return {
          nombre: nombreSector,
          lineChartData: {
            labels,
            datasets: [
              { data: consumoHistorico, label: 'Histórico', borderColor: '#888', backgroundColor: 'rgba(136,136,136,0.2)', fill: false, tension: 0.3 },
              { data: consumoActual, label: 'Actual', borderColor: '#007bff', backgroundColor: 'rgba(0,123,255,0.3)', fill: false, tension: 0.3 },
              { data: consumoProyectado, label: 'Proyectado', borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.3)', fill: false, tension: 0.3 },
              { data: tendenciaMin, label: 'Tendencia Mín', borderColor: '#ffc107', borderDash: [5, 5], fill: false, tension: 0.3 },
              { data: tendenciaMax, label: 'Tendencia Máx', borderColor: '#dc3545', borderDash: [5, 5], fill: false, tension: 0.3 }
            ]
          },
          costoActual,
          costoProyectado,
          hallazgosClave: datosSector.hallazgosClave ?? []
        };
      }
    );
  },
  error: (err) => console.error('Error al obtener predicción:', err)
});


  }
}
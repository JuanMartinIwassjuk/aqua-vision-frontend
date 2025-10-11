import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { HomeService } from '../../services/home.service';
import { ChartConfiguration } from 'chart.js';
import { ConsumoService } from '../../services/consumo.service';



@Component({
  selector: 'app-consumption-prediction',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './consumption-prediction.component.html',
  styleUrls: ['./consumption-prediction.component.css']
})
export class ConsumptionPredictionComponent implements OnInit {
  mostrarFiltros: boolean = false;

  sectores: any[] = [];
  nombresSectores: string[] = [];
  sectoresFiltrados: string[] = [];
  sectoresFiltradosData: any[] = [];
  hogarId: number | null = null;

  // ✅ Nuevo: filtros de parámetros (grupos de datasets)
  filtrosParametros: { [key: string]: boolean } = {
    Historico: true,
    Actual: true,
    Proyectado: true,
    'Tendencia Mín': true,
    'Tendencia Máx': true
  };

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

  constructor(
    private consumoService: ConsumoService,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    this.hogarId = this.homeService.getHomeId();
    if (this.hogarId && this.hogarId > 0) {
      this.cargarPrediccion();
    } else {
      console.warn('⚠️ No valid home found, prediction will not load.');
    }
  }

  cargarPrediccion(): void {
    if (this.hogarId === null) return;

    this.consumoService.getPrediccionConsumoPorDia(this.hogarId).subscribe({
      next: (sectores) => {
        this.sectores = sectores.map((datosSector) => {
          const labels = datosSector.dias.map((d) => d.toString());
          const consumoHistorico = datosSector.consumoHistorico ?? [];
          const consumoActual = datosSector.consumoActual ?? [];
          const consumoProyectado = datosSector.consumoProyectado ?? [];
          const tendenciaMin = datosSector.tendenciaMin ?? [];
          const tendenciaMax = datosSector.tendenciaMax ?? [];

          const costoPorLitro = 3;
          const costoActual = (
            consumoActual.reduce((a, b) => a + b, 0) * costoPorLitro
          ).toFixed(2);
          const costoProyectado = (
            consumoProyectado.reduce((a, b) => a + b, 0) * costoPorLitro
          ).toFixed(2);

          return {
            nombre: datosSector.nombre_sector,
            lineChartData: {
              labels,
              datasets: [
                { data: consumoHistorico, label: 'Historico', borderColor: '#888', backgroundColor: 'rgba(136,136,136,0.2)', fill: false, tension: 0.3 },
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
        });

        this.nombresSectores = this.sectores.map((s) => s.nombre);
        this.sectoresFiltrados = [...this.nombresSectores];
        this.actualizarFiltro();
      },
      error: (err) => console.error('Error al obtener predicción:', err),
    });
  }

  toggleFiltroSector(nombre: string): void {
    if (this.sectoresFiltrados.includes(nombre)) {
      this.sectoresFiltrados = this.sectoresFiltrados.filter((s) => s !== nombre);
    } else {
      this.sectoresFiltrados.push(nombre);
    }
    this.actualizarFiltro();
  }

  toggleFiltroParametro(nombre: string): void {
    this.filtrosParametros[nombre] = !this.filtrosParametros[nombre];
    this.actualizarFiltro();
  }

  actualizarFiltro(): void {
    this.sectoresFiltradosData = this.sectores.map((s) => {
      return {
        ...s,
        lineChartData: {
          ...s.lineChartData,
          datasets: s.lineChartData.datasets.filter((d: any) => this.filtrosParametros[d.label])
        }
      };
    }).filter((s) => this.sectoresFiltrados.includes(s.nombre));
  }
}
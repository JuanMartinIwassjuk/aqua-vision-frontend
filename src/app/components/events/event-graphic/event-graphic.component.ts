import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartEvent } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ConsumoService, ConsumoSector } from '../../../services/consumo.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from './dialog/event-dialog.component';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { HomeService } from '../../../services/home.service';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-event-graphic',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './event-graphic.component.html',
  styleUrl: './event-graphic.component.css'
})
export class EventGraphicComponent implements OnInit {

  sectores: {
    sector: ConsumoSector;
    chartData: ChartData<'line'>;
    chartOptions: ChartOptions<'line'>;
    eventos: { hora: string; descripcion: string }[];
  }[] = [];

  private colores = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

  constructor(private consumoService: ConsumoService, private dialog: MatDialog,private homeService: HomeService) {

  }

ngOnInit(): void {
  const hogarId = this.homeService.getHomeId() ?? 0;
  const dia = new Date().toISOString().split('T')[0]; 

  this.consumoService.getConsumosPorHoraYSector(hogarId, dia).subscribe(response => {
    console.log('📊 Datos procesados del backend:', response);


  this.sectores = response.consumosPorHora.map((sectorData: any, index: number) => {
    const horas: string[] = sectorData.consumosPorHora.map((c: any) =>
      `${c.hora.toString().padStart(2, '0')}:00`
    );
    const caudales: number[] = sectorData.consumosPorHora.map((c: any) => c.consumo);

    const numericCaudales = caudales.filter((v: number) => v !== null) as number[];
    const maxY = numericCaudales.length > 0 ? Math.max(...numericCaudales) : 10;

    const annotations: Record<string, any> = {};

    const chartData: ChartData<'line'> = {
      labels: horas,
      datasets: [
        {
          label: `Consumo ${sectorData.nombreSector}`,
          data: caudales,
          borderColor: this.colores[index % this.colores.length],
          backgroundColor: this.colores[index % this.colores.length],
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2
        }
      ]
    };

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        annotation: { annotations: annotations as any } as any
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Caudal (m³)' } },
        x: { title: { display: true, text: 'Hora' } }
      }
    };

    return {
      sector: {
        id: sectorData.sectorId,
        nombre: sectorData.nombreSector,
        consumos: horas.map((h: string, i: number) => ({
          hora: h,
          caudal_m3: caudales[i]
        }))
      },
      chartData,
      chartOptions,
      eventos: []
    };
  });
  });
}


onChartClick(event: { event?: ChartEvent; active?: any[] }, item: { chartData: ChartData<'line'>; sector: ConsumoSector }) {
  if (event.active && event.active.length > 0) {
    const dataIndex = event.active[0].index;
    const labels = item.chartData.labels as string[];
    const dataValues = item.chartData.datasets[0].data as number[];
    const hora = labels[dataIndex];
    const litros = dataValues[dataIndex]; 

    if (!hora || litros == null) return;

    const [h, m] = hora.split(':').map(Number);
    const base = new Date();
    base.setHours(h, m, 0, 0);

    const start = new Date(base.getTime() - 5 * 60000);
    const end = new Date(base.getTime() + 5 * 60000);

    const costoPorLitro = 0.24;
    const costo = litros * costoPorLitro;

    this.dialog.open(EventDialogComponent, {
      data: {
        start: start.toTimeString().slice(0, 5),
        end: end.toTimeString().slice(0, 5),
        litros,
        costo,
        sector: item.sector
      }
    });
  }
}

}
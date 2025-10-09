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
  const sectoresData = this.consumoService.getConsumosPorHoraPorSector();

  this.consumoService.getEventosDeLosSectores(this.homeService.getHomeId()).subscribe(eventosPorSectores => {
  console.log('📦 Eventos por sectores (raw):', JSON.stringify(eventosPorSectores, null, 2));
});

  this.consumoService.getEventosDeLosSectores(this.homeService.getHomeId()).subscribe(eventosPorSectores => {

    this.sectores = sectoresData.map((sector, index) => {
      const horas = sector.consumos.map(c => c.hora);
      const caudales = sector.consumos.map(c => c.caudal_m3 ?? null);
      console.log('Eventos del backend:', eventosPorSectores);
      console.log('Sectores del consumo:', sectoresData);

      const eventosEntry = eventosPorSectores.find(e => Number(e.id) === Number(sector.id));
      console.log(`Buscando eventos para sector ${sector.nombre} (id=${sector.id}) →`, eventosEntry);

      const eventos = eventosEntry?.eventos ?? [];

      const numericCaudales = caudales.filter(v => v !== null) as number[];
      const maxY = (numericCaudales.length > 0) ? Math.max(...numericCaudales) : 10;

      const annotations: Record<string, any> = {};
      eventos.forEach((ev, i) => {
        const matching = sector.consumos.find(c => c.hora === ev.hora);
        let yValue: number;
        if (matching && (matching.caudal_m3 !== undefined)) {
          if (matching.caudal_m3 > maxY * 0.8) {
            yValue = matching.caudal_m3 - Math.round(maxY * 0.1);
          } else {
            yValue = matching.caudal_m3 + Math.round(maxY * 0.05);
          }
        } else {
          yValue = Math.round(maxY * 0.75);
        }
        console.log(`Evento para ${sector.nombre}:`, ev.hora, 'Horas en labels:', horas);
        annotations[`evento_${sector.id}_${i}`] = {
          type: 'label',
          xValue: ev.hora,
          yValue: yValue,
          backgroundColor: 'rgba(255, 205, 0, 0.95)',
          borderColor: '#333',
          borderWidth: 1,
          content: [ev.descripcion, ev.hora],
          font: { size: 11, weight: '600' },
          color: '#000',
          padding: 6,
          position: 'center'
        } as any;
      });

      const chartData: ChartData<'line'> = {
        labels: horas,
        datasets: [
          {
            label: `Consumo ${sector.nombre}`,
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

      return { sector, chartData, chartOptions, eventos };
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
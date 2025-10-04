import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartEvent } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ConsumoService, ConsumoSector } from '../../../services/consumo.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from './dialog/event-dialog.component';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

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

  constructor(private consumoService: ConsumoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const sectoresData = this.consumoService.getConsumosPorHoraPorSector();
    const eventosPorSectores = this.consumoService.getEventosDeLosSectores();

    this.sectores = sectoresData.map((sector, index) => {
      const horas = sector.consumos.map(c => c.hora);
      const caudales = sector.consumos.map(c => c.caudal_m3 ?? null);


      const eventosEntry = eventosPorSectores.find(e => e.id === sector.id);
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
  }

  onChartClick(event: { event?: ChartEvent; active?: any[] }, chartData: ChartData<'line'>) {
    if (event.active && event.active.length > 0) {
      const dataIndex = event.active[0].index;
      const labels = chartData.labels as string[];
      const hora = labels[dataIndex];
      if (!hora) return;

      const [h, m] = hora.split(':').map(Number);
      const base = new Date();
      base.setHours(h, m, 0, 0);

      const start = new Date(base.getTime() - 5 * 60000);
      const end = new Date(base.getTime() + 5 * 60000);

      this.dialog.open(EventDialogComponent, {
        data: {
          start: start.toTimeString().slice(0, 5),
          end: end.toTimeString().slice(0, 5)
        }
      });
    }
  }
}
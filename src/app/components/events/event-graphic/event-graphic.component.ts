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
import { forkJoin } from 'rxjs';

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

  forkJoin({
    consumos: this.consumoService.getConsumosPorHoraYSector(hogarId, dia),
    eventos: this.consumoService.getEventos()
  }).subscribe(({ consumos, eventos }) => {
    console.log('📊 Consumos por hora y sector:', consumos);
    console.log('📆 Eventos obtenidos:', eventos);

    this.sectores = consumos.consumosPorHora.map((sectorData: any, index: number) => {
      const horas: string[] = sectorData.consumosPorHora.map((c: any) =>
        `${c.hora.toString().padStart(2, '0')}:00`
      );
      const caudales: number[] = sectorData.consumosPorHora.map((c: any) => c.consumo);

  
      const maxY = Math.max(...caudales, 10);


      const eventosSector = eventos
        .filter(ev => ev.sector?.id === sectorData.sectorId)
        .filter(ev => ev.fechaInicio.startsWith(dia))
        .map(ev => ({
          hora: new Date(ev.fechaInicio).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          titulo: ev.titulo  || 'Evento'
        }));


      const annotations: Record<string, any> = {};
      eventosSector.forEach((ev, i) => {
        const horaCercana = this.getHoraMasCercana(ev.hora, horas);
        const indexHora = horas.indexOf(horaCercana);
        let consumoY = indexHora !== -1 ? caudales[indexHora] : 0;



        annotations[`evento_${sectorData.sectorId}_${i}`] = {
          type: 'label',
          xValue: horaCercana,
          yValue: consumoY > 0 ? consumoY : 0.2,
          backgroundColor: 'rgba(255, 205, 0, 0.95)', 
          borderColor: '#333',
          borderWidth: 1,
          content: [`${ev.titulo}`, `${ev.hora}`],
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
          y: {
            beginAtZero: true,
            suggestedMax: maxY,
            title: { display: true, text: 'Caudal (m³)' }
          },
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
        eventos: eventosSector
      };
    });
  });
}


onChartClick(
  event: { event?: ChartEvent; active?: any[] },
  item: { chartData: ChartData<'line'>; sector: ConsumoSector }
) {
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


    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        start: start.toTimeString().slice(0, 5),
        end: end.toTimeString().slice(0, 5),
        litros,
        costo,
        sector: item.sector
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🔁 Re-renderizando gráfico tras nuevo evento...');
        this.ngOnInit();
      }
    });
  }
}


private getHoraMasCercana(horaEvento: string, horas: string[]): string {
  const [hEv, mEv] = horaEvento.split(':').map(Number);
  let minDiff = Infinity;
  let closest = horas[0];

  for (const h of horas) {
    const [hLabel, mLabel] = h.split(':').map(Number);
    const diff = Math.abs(hEv * 60 + mEv - (hLabel * 60 + mLabel));
    if (diff < minDiff) {
      minDiff = diff;
      closest = h;
    }
  }

  return closest;
}


}
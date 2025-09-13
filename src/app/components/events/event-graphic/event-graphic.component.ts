import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartEvent } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ConsumoService, ConsumoSector } from '../../../services/consumo.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from './dialog/event-dialog.component';

@Component({
  selector: 'app-event-graphic',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './event-graphic.component.html',
  styleUrl: './event-graphic.component.css'
})
export class EventGraphicComponent implements OnInit {
  sectores: { sector: ConsumoSector; chartData: ChartData<'line'> }[] = [];

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Caudal (m³)' } },
      x: { title: { display: true, text: 'Hora' } }
    }
  };

  private colores = ['#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF', '#C9CBCF'];

  constructor(private consumoService: ConsumoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const sectores = this.consumoService.getConsumosPorHoraPorSector();
    this.sectores = sectores.map((sector, index) => {
      const horas = sector.consumos.map(c => c.hora);
      const caudales = sector.consumos.map(c => c.caudal_m3 ?? null);
      return {
        sector,
        chartData: {
          labels: horas,
          datasets: [
            {
              label: `Consumo ${sector.nombre}`,
              data: caudales,
              borderColor: this.colores[index % this.colores.length],
              backgroundColor: this.colores[index % this.colores.length],
              fill: false,
              tension: 0.3,
              pointRadius: 3
            }
          ]
        }
      };
    });
  }

onChartClick(event: { event?: ChartEvent; active?: any[] }, chartData: ChartData<'line'>) {
  if (event.active && event.active.length > 0) {
    const dataIndex = event.active[0].index;

    // 🔧 casteamos labels a string[]
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

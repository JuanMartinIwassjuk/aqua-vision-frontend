import { Component, OnInit } from '@angular/core';
import { ChartData, ChartEvent, ChartOptions } from 'chart.js';
import { ReporteService } from '../../services/reports.service';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/serviceAuth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { HomeService } from '../../services/home.service';
import { NotificationService } from '../../services/notification.service';
import { switchMap, catchError } from 'rxjs/operators';




@Component({
  selector: 'app-dashboard',
  imports: [NgChartsModule, CommonModule, RouterModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  isLoading: boolean = true;

  consumoDia!: number;
  consumoColor!: string;
  medidoresConectados!: number;
  medidoresDesconectados!: number;
  estadoMedidores: { conectados: number, desconectados: number } | undefined;

  cantidadNotificaciones = 0;

  medidoresConectadosAdmin!: number;
  medidoresDesconectadosAdmin!: number;
  totalHogaresAdmin!: number;
  totalTriviasAdmin!: number;
  consumoPromedio!: number;

  consumoPromedioAnterior!: number;
  consumoDiff!: number;
  consumoDiffAbs!: number;

  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartDataAdmin: ChartData<'line'> = { labels: [], datasets: [] };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },

    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Caudal (m³)' }
      },
      x: { title: { display: true } }
    }
  };

  constructor(
    private reporteService: ReporteService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private homeService: HomeService,
    private notificationService: NotificationService
  ) {}

 ngOnInit(): void {
  this.isLoading = true;

  this.homeService.waitForHomeId()
    .pipe(
      switchMap(hogarId => {

        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);

        const diaHoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
        const diaAyer = new Date(ayer).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });


        this.notificationService.getUnreadCount(hogarId).subscribe({
          next: count => this.cantidadNotificaciones = count,
          error: err => console.error('Error al obtener notificaciones:', err)
        });


        return forkJoin({
          hoy: this.reporteService.getConsumoPorHoraBackend(hogarId, diaHoy).pipe(
            catchError(err => { console.error('hoy error', err); return of([]); })
          ),
          ayer: this.reporteService.getConsumoPorHoraBackend(hogarId, diaAyer).pipe(
            catchError(err => { console.error('ayer error', err); return of([]); })
          ),
          consumoHoy: this.reporteService.getConsumoUltimoDia(hogarId).pipe(
            catchError(err => { console.error('consumoHoy error', err); return of(0); })
          ),
          consumoAyer: this.reporteService.getConsumoPromedio(hogarId).pipe(
            catchError(err => { console.error('consumoAyer error', err); return of(0); })
          )
        });
      })
    )
    .subscribe({
      next: ({ hoy, ayer, consumoHoy, consumoAyer }) => {
        const horas = (hoy || []).map((d: any) => d.hora);
        const caudales = (hoy || []).map((d: any) => d.caudal_m3 ?? null);
        const caudalesAnterior = (ayer || []).map((d: any) => d.caudal_m3 ?? null);

        this.lineChartData = {
          labels: horas,
          datasets: [
            {
              label: 'Hoy',
              data: caudales,
              borderColor: '#2563eb',
              fill: false,
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 3.5,
              pointBackgroundColor: '#2563eb'
            },
            {
              label: 'Ayer',
              data: caudalesAnterior,
              borderColor: '#16a34a',
              fill: false,
              tension: 0.3,
              borderWidth: 2,
              borderDash: [6, 6],
              pointRadius: 3,
              pointBackgroundColor: '#16a34a'
            }
            
          ]
        };

        if (!this.isAdmin) {
          this.consumoDia = consumoHoy as number;
          const consumoDiaAnterior = consumoAyer as number;
          this.estadoMedidores = this.reporteService.getEstadoMedidores();
          this.medidoresConectados = this.estadoMedidores.conectados;
          this.medidoresDesconectados = this.estadoMedidores.desconectados;
          this.calcularDiferencia(this.consumoDia, consumoDiaAnterior);
        }
      },
      error: err => {
        console.error('Error al cargar datos del dashboard:', err);
        this.snackBar.open('Error al cargar los datos del dashboard', 'Cerrar', { duration: 4000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
}

  calcularDiferencia(actual: number, anterior: number): void {
    if (!anterior || anterior === 0) {
      this.consumoDiff = 0;
      this.consumoDiffAbs = 0;
      return;
    }
    this.consumoDiff = ((actual - anterior) / anterior) * 100;
    this.consumoDiffAbs = Math.abs(Math.round(this.consumoDiff));
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
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

      if (hora && valor !== undefined && valor !== null) {
        this.snackBar.open(`Hora ${hora} → Consumo: ${valor} m³`, 'Cerrar', { duration: 3000 });
      }
    }
  }
}
import { Injectable } from '@angular/core';
import { ReporteDiario } from '../models/reporteDiario';
import { ReporteMensual } from '../models/reporteMensual';
import { HttpClient } from '@angular/common/http';
import { DateUtilsService } from '../services/date.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ReporteService {

    private readonly baseUrl = 'http://localhost:8080/reportes';

    constructor(
    private http: HttpClient,
    private dateUtils: DateUtilsService
  ) {}

  getConsumoDiarioPorSector(): ReporteDiario[] {
    return [
      {
        nombre_sector: 'Baño',
        consumo_total: 150,
        media_consumo: 45,
        pico_maximo: 200,
        timestamp: '2025-07-26T07:30:00', 
        costo: '$35.20'
      },
      {
        nombre_sector: 'Cocina',
        consumo_total: 90,
        media_consumo: 35,
        pico_maximo: 120,
        timestamp: '2025-07-26T13:45:00', 
        costo: '$21.75'
      },
      {
        nombre_sector: 'Lavarropas',
        consumo_total: 110,
        media_consumo: 40,
        pico_maximo: 140,
        timestamp: '2025-07-26T21:10:00',
        costo: '$27.10'
      },
      {
        nombre_sector: 'Living',
        consumo_total: 80,
        media_consumo: 30,
        pico_maximo: 100,
        timestamp: '2025-07-26T16:00:00', 
        costo: '$19.90'
      },
      {
        nombre_sector: 'Dormitorio',
        consumo_total: 70,
        media_consumo: 25,
        pico_maximo: 90,
        timestamp: '2025-07-26T22:30:00', 
        costo: '$16.50'
      },
      {
        nombre_sector: 'Oficina',
        consumo_total: 95,
        media_consumo: 32,
        pico_maximo: 110,
        timestamp: '2025-07-26T09:00:00', 
        costo: '$23.40'
      }
    ];
  }

  getConsumoMensualPorSector(id: number, fechaDesde: string | Date, fechaHasta: string | Date): Observable<ReporteMensual[]> {
    const desde = this.dateUtils.formatDateToJava(fechaDesde);
    const hasta = this.dateUtils.formatDateToJava(fechaHasta);

    const url = `${this.baseUrl}/${id}/consumo-fecha?fechaInicio=${encodeURIComponent(desde)}&fechaFin=${encodeURIComponent(hasta)}`;

    return this.http.get<any>(url).pipe(
      map((response: any) => {
        return response.consumosPorSector.map((item: any) => ({
          nombre_sector: item.sector.nombre,
          mes: desde.substring(0, 7),
          consumo_total: item.consumoTotal,
          media_consumo: item.consumoPromedio,
          pico_maximo: item.consumoPico,
          costo: this.calcularCosto(item.consumoTotal)
        }));
      })

    );
  }

  private calcularCosto(consumoTotal: number): number {
    const tarifaPorUnidad = 0.24; 
    return consumoTotal * tarifaPorUnidad;
  }


  getConsumoPorHora(): { hora: string; caudal_m3?: number }[] {
  return [
    { hora: '00:00', caudal_m3: 5 },
    { hora: '01:00', caudal_m3: 4 },
    { hora: '02:00', caudal_m3: 3 },
    { hora: '03:00', caudal_m3: 3.5 },
    { hora: '04:00', caudal_m3: 4.2 },
    { hora: '05:00', caudal_m3: 5.1 },
    { hora: '06:00', caudal_m3: 6.5 },
    { hora: '07:00', caudal_m3: 8.3 },
    { hora: '08:00', caudal_m3: 10 },
    { hora: '09:00', caudal_m3: 12 },
    { hora: '10:00', caudal_m3: 15 },
    { hora: '11:00', caudal_m3: 8 },
    { hora: '12:00', caudal_m3: 2 },
    { hora: '13:00', caudal_m3: 3 },
    { hora: '14:00', caudal_m3: 8 },
    { hora: '15:00', caudal_m3: 9 },
    { hora: '16:00', caudal_m3: 13 },
    { hora: '17:00', caudal_m3: 15 },
    { hora: '18:00', caudal_m3: 18 },
    { hora: '19:00', caudal_m3: 20 },
    { hora: '20:00'},
    { hora: '21:00'},
    { hora: '22:00'},
    { hora: '23:00'}
  ];
}


  descargarReportePDF(id: number, fechaDesde: string | Date, fechaHasta: string | Date) {
    const desde = this.dateUtils.formatDateToJava(fechaDesde);
    const hasta = this.dateUtils.formatDateToJava(fechaHasta);

    const url = `${this.baseUrl}/${id}/descargar-reporte-pdf?fechaInicio=${encodeURIComponent(desde)}&fechaFin=${encodeURIComponent(hasta)}`;
    window.open(url, '_blank');
  }


}
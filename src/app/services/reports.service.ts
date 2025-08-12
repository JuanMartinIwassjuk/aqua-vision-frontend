import { Injectable } from '@angular/core';
import { ReporteDiario } from '../models/reporteDiario';
import { ReporteMensual } from '../models/reporteMensual';
import { HttpClient } from '@angular/common/http';
import { DateUtilsService } from '../services/date.service';

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

    getConsumoMensualPorSector(): ReporteMensual[] {
    return [
      { nombre_sector: 'Baño', mes: '2025-06', consumo_total: 1000, media_consumo: 33, pico_maximo: 180, costo: 240.00 },
      { nombre_sector: 'Cocina', mes: '2025-06', consumo_total: 870, media_consumo: 29, pico_maximo: 160, costo: 210.00 },
      { nombre_sector: 'Baño', mes: '2025-07', consumo_total: 1100, media_consumo: 35, pico_maximo: 200, costo: 270.00 },
      { nombre_sector: 'Cocina', mes: '2025-07', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.00 },
      { nombre_sector: 'Living', mes: '2025-07', consumo_total: 600, media_consumo: 20, pico_maximo: 90, costo: 150.00 },
       { nombre_sector: 'Cocina', mes: '2025-08', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.0 },
        { nombre_sector: 'Cocina', mes: '2025-09', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.0 },
         { nombre_sector: 'Cocina', mes: '2025-10', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.0 },
          { nombre_sector: 'Cocina', mes: '2025-11', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.0 },
           { nombre_sector: 'Cocina', mes: '2025-12', consumo_total: 950, media_consumo: 31, pico_maximo: 170, costo: 225.0 },
    ];
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


getConsumoTotalHogaresPorHora(): { hora: string; caudal_m3?: number }[] {
   return [ 
      { hora: '00:00', caudal_m3: 300 },
      { hora: '01:00', caudal_m3: 150 },
      { hora: '02:00', caudal_m3: 230 },
      { hora: '03:00', caudal_m3: 150 },
      { hora: '04:00', caudal_m3: 110 },
      { hora: '05:00', caudal_m3: 760 },
      { hora: '06:00', caudal_m3: 950 },
      { hora: '07:00', caudal_m3: 930 },
      { hora: '08:00', caudal_m3: 1000 },
      { hora: '09:00', caudal_m3: 1200 },
      { hora: '10:00', caudal_m3: 1500 },
      { hora: '11:00', caudal_m3: 950 },
      { hora: '12:00', caudal_m3: 1100 },
      { hora: '13:00', caudal_m3: 1250 },
      { hora: '14:00', caudal_m3: 920 },
      { hora: '15:00', caudal_m3: 900 },
      { hora: '16:00', caudal_m3: 700 },
      { hora: '17:00', caudal_m3: 800 },
      { hora: '18:00', caudal_m3: 1250 },
      { hora: '19:00', caudal_m3: 1500 },
      { hora: '20:00' },
      { hora: '21:00' },
      { hora: '22:00' },
      { hora: '23:00' }
    ];
  }


  getConsumoUltimoDia(): number {
    return 68;
  }

  getConsumoPromedio(): number {
    return 52;
  }
  getEstadoMedidores(): { conectados: number; desconectados: number } {
    return {conectados: 3, desconectados: 1};
  }

  getTotalMedidoresConectados(): number {
    return 1856;
  }

  getTotalMedidoresDesconectados(): number {
    return 13;
  }

  getTotalHogares(): number {
    return 1257;
  }

  getTotalTriviasCompletadas(): number {
    return 4589;
  }

  descargarReportePDF(id: number, fechaDesde: string | Date, fechaHasta: string | Date) {
    const desde = this.dateUtils.formatDateToJava(fechaDesde);
    const hasta = this.dateUtils.formatDateToJava(fechaHasta);
    
    const url = `${this.baseUrl}/${id}/descargar-reporte-pdf?fechaInicio=${encodeURIComponent(desde)}&fechaFin=${encodeURIComponent(hasta)}`;
    window.open(url, '_blank');
  }


}
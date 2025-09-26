import { Injectable } from '@angular/core';
import { ReporteDiario } from '../models/reporteDiario';
import { ReporteMensual } from '../models/reporteMensual';
import { HttpClient } from '@angular/common/http';
import { DateUtilsService } from '../services/date.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ReporteService {

    private readonly baseUrl = environment.apiUrl + '/reportes';

    constructor(
    private http: HttpClient,
    private dateUtils: DateUtilsService
  ) {}

getConsumoDiarioPorSector(id: number): Observable<ReporteDiario[]> {
  const hoy = new Date();
  const fechaDesde = this.dateUtils.formatDateToJava(hoy);
  
  const fechaHasta = new Date(hoy);
  fechaHasta.setHours(23, 59, 59, 999);
  const fechaHastaStr = this.dateUtils.formatDateToJava(fechaHasta);

  const url = `${this.baseUrl}/${id}/consumo-fecha?fechaInicio=${encodeURIComponent(fechaDesde)}&fechaFin=${encodeURIComponent(fechaHastaStr)}`;

  return this.http.get<any>(url).pipe(
    map((response: any) => {
      return response.consumosPorSector.map((item: any) => ({
        nombre_sector: item.sector.nombre,
        consumo_total: item.consumoTotal,
        media_consumo: item.consumoPromedio,
        pico_maximo: item.consumoPico,
        timestamp: hoy.toISOString(),
        costo: this.calcularCosto(item.consumoTotal).toFixed(2) 
      }));
    })
  );
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
    { hora: '10:00', caudal_m3: 0 },
    { hora: '11:00', caudal_m3: 0 },
    { hora: '12:00', caudal_m3: 0 },
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


getPrediccionConsumo(hogarId: number, umbralMensual: number): Observable<any[]> {
  const url = `${this.baseUrl}/${hogarId}/proyeccion?umbralMensual=${umbralMensual}`;
  return this.http.get<any>(url).pipe(
    map((response: any) => {
    
      return response.sectores.map((item: any) => ({
        sectorId: item.sectorId,
        nombre_sector: item.nombreSector,
        consumo_actual: item.consumoActualMes,
        consumo_proyectado: item.consumoProyectadoMes,
        tendencia: item.tendencia,
        estadoConsumo: item.estadoConsumo,
        costo_actual: this.calcularCosto(item.consumoActualMes),
        costo_proyectado: this.calcularCosto(item.consumoProyectadoMes)
      }));
    })
  );
}


getConsumoMensualAgrupado(id: number, fechaDesde: string | Date, fechaHasta: string | Date): Observable<any[]> {
  const desde = this.dateUtils.formatDateToJava(fechaDesde);
  const hasta = this.dateUtils.formatDateToJava(fechaHasta);

  const url = `${this.baseUrl}/${id}/consumo-fecha-mensual?fechaInicio=${encodeURIComponent(desde)}&fechaFin=${encodeURIComponent(hasta)}`;

  return this.http.get<any>(url).pipe(
    map((response: any) => {
      return response.consumosMensualesSector.map((item: any) => ({
        mes: item.mes,
        anio: item.anio,        
        totalMes: item.totalMes
      }));
    })
  );
}

  getConsumoPromedioAnterior(): number {
    return 10;
  }

  getConsumoDiaAnterior(): number {
    return 62;
  }


}
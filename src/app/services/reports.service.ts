import { Injectable } from '@angular/core';
import { ReporteDiario } from '../models/reporteDiario';
@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  constructor() {}

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
}
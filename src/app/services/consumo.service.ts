import { Injectable } from '@angular/core';

export interface ConsumoPorHora {
  hora: string;
  caudal_m3?: number;
}

export interface ConsumoSector {
  id: number;
  nombre: string;
  consumos: ConsumoPorHora[];
}

export interface Evento {
  nombre: string;
  hora: string;
  caudal: number;
}
export interface EventoSector {
  id: number;
  nombre: string;
  eventos: { hora: string; descripcion: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  constructor() {}

  getConsumosPorHoraPorSector(): ConsumoSector[] {
    return [
      {
        id: 1,
        nombre: 'Sector A',
        consumos: [
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
          { hora: '19:00', caudal_m3: 10 },
          { hora: '20:00', caudal_m3: 3 },
          { hora: '21:00', caudal_m3: 1 },
          { hora: '22:00', caudal_m3: 0.5 },
          { hora: '23:00', caudal_m3: 0 },
          { hora: '24:00', caudal_m3: 0 },
        ]
      },
      {
        id: 2,
        nombre: 'Sector B',
        consumos: [
          { hora: '00:00', caudal_m3: 2 },
          { hora: '01:00', caudal_m3: 3 },
          { hora: '02:00', caudal_m3: 5 },
          { hora: '03:00', caudal_m3: 4 },
          { hora: '04:00', caudal_m3: 6 },
          { hora: '05:00', caudal_m3: 7 },
          { hora: '06:00', caudal_m3: 8 },
          { hora: '07:00', caudal_m3: 12 },
          { hora: '08:00', caudal_m3: 9 },
          { hora: '09:00', caudal_m3: 15 },
          { hora: '13:00', caudal_m3: 4 },
          { hora: '14:00', caudal_m3: 7 },
          { hora: '15:00', caudal_m3: 8 },
          { hora: '16:00', caudal_m3: 11 },
          { hora: '17:00', caudal_m3: 10 },
          { hora: '18:00', caudal_m3: 12 },
          { hora: '19:00', caudal_m3: 15 },
          { hora: '20:00', caudal_m3: 12 },
          { hora: '21:00', caudal_m3: 4 },
          { hora: '22:00', caudal_m3: 3 },
          { hora: '23:00', caudal_m3: 0 },
          { hora: '24:00', caudal_m3: 0 },
        ]
      }
    ];
  }

  getEventosDeLosSectores(): EventoSector[] {
    return [
      {
        id: 1,
        nombre: 'Sector A',
        eventos: [
          { hora: '08:00', descripcion: 'Bañarse' },
          { hora: '18:00', descripcion: 'Lavado ropa' }
        ]
      },
      {
        id: 2,
        nombre: 'Sector B',
        eventos: [
          { hora: '07:00', descripcion: 'Riego' },
          { hora: '19:00', descripcion: 'Llenado tanque' }
        ]
      }
    ];
  }
}

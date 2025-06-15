import { Injectable } from '@angular/core';

export interface ReporteConsumo {
  labels: string[];
  data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor() {}


  getConsumoPorTipo(): ReporteConsumo {
    return {
      labels: ['Consumo normal', 'Consumo elevado', 'Consumo nocturno', 'Pérdidas'],
      data: [65, 20, 10, 5] 
    };
  }


  getConsumoMensual(): ReporteConsumo {
    return {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      data: [5300, 4800, 5100, 4700, 4900, 4600]
    };
  }
}

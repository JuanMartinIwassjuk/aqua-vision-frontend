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
      labels: ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
      data: [38, 7, 20, 35] 
    };
  }


  getConsumoMensual(): ReporteConsumo {
    return {
      labels: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      data: [
        5300, 4800, 5100, 4700, 4900, 4600,
        5000, 5200, 4950, 5100, 5050, 4800
      ]
    };
  }
}

export class HogarRanking {
  nombre!: string;
  puntaje_ranking!: number;
  posicion!: number;
}

export class RankingResponse {
  hogares!: HogarRanking[];
}

export class Recompensa {
  id!: number;
  descripcion!: string;
  puntosNecesarios!: number;
}

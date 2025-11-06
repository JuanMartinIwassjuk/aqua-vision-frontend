import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RankingResponse, Recompensa } from '../models/gamificacion';

@Injectable({
  providedIn: 'root'
})
export class GamificacionService {
  private baseUrl = 'http://localhost:8080/hogares';

  constructor(private http: HttpClient) {}

  getRanking(): Observable<RankingResponse> {
    return this.http.get<RankingResponse>(`${this.baseUrl}/ranking`);
  }

  getRecompensas(): Observable<Recompensa[]> {
    return this.http.get<Recompensa[]>(`${this.baseUrl}/recompensas`);
  }
}

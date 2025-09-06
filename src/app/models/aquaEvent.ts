import { EventTag } from "./eventTag";

export interface AquaEvent {
  id: number;
  startDate: Date;
  endDate?: Date;
  status: 'En proceso' | 'Finalizado' | 'Pendiente' | 'Cancelado';
  tags: EventTag[];
}
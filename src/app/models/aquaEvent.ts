import { EventTag } from "./eventTag";
import { Sector } from "./sector";

export interface AquaEvent {
  id: number;
  title: string;    
  description: string; 
  startDate: Date;
  endDate?: Date | null;
  status: 'En proceso' | 'Finalizado' | 'Pendiente' | 'Cancelado';
  tags: EventTag[];
  sector: Sector;         
  litersConsumed?: number; 
  cost?: number;           
}
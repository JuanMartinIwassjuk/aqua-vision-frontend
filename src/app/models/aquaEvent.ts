import { EventTag } from "./eventTag";
import { Sector } from "./sector";

export interface AquaEvent {
  id?: number ;
  titulo: string;    
  descripcion: string; 
  startDate: Date;
  endDate?: Date | null;
  estado: string;
  tags: EventTag[];
  sector: Sector;         
  litersConsumed?: number; 
  cost?: number;           
}
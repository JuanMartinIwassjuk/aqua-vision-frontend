export interface DesafioDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    puntos_recompensa: number;
    
    progreso_total: number; //SUMAR AL BACK
    tipo_validacion: 'manual' | 'sistema';  //SUMAR AL BACK
}

export interface DesafioHogarApi {
    id: number;
    desafio: DesafioDetalle;
    progreso: number; // Progreso actual (ej. 2 de 5)
}

export interface HogarDesafiosResponse {
    hogarId: number;
    desafisoHogar: DesafioHogarApi[];
}

export class Desafio {
    idDesafioHogar!: number; 
    idDesafioGlobal!: number;
    
    titulo!: string; 
    descripcion!: string;
    
    progresoActual!: number;
    progresoTotal!: number; 
    
    puntosRecompensa!: number;
    tipoValidacion?: 'manual' | 'sistema'; 
    completado: boolean = false; 

    constructor(data: DesafioHogarApi) {
        this.idDesafioHogar = data.id;
        this.idDesafioGlobal = data.desafio.id;
        
        this.titulo = data.desafio.titulo;
        this.descripcion = data.desafio.descripcion;
        this.puntosRecompensa = data.desafio.puntos_recompensa;
        
        this.progresoActual = data.progreso;
        //this.progresoTotal = data.desafio.progreso_total; 
        this.progresoTotal = data.desafio.progreso_total || 100;
        //this.tipoValidacion = data.desafio.tipo_validacion;
        this.tipoValidacion = data.desafio.tipo_validacion || 'manual';
        
        // Lógica de completado
        this.completado = this.progresoActual >= this.progresoTotal; 
        //this.completado = true;
    }
}
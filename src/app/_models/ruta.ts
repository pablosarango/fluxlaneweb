interface FechaHora {
    creacion: Date;
    fecha_captura: Date;
    inicio_captura: String;
    fin_captura: String;
}

interface Referencia {
    nombre: String;
    lat: String;
    lng: String;
}

interface Subpunto {
    id: String;
}

export class Ruta {
    fecha_hora: FechaHora;
    estado: String;
    descripcion: String;
    referencias: Referencia[];
    subpuntos: Subpunto[];
    _id: String;
    nombre: String;
    conductor_id: String;
    velocidad_promedio: String;
    clima: String;
    int_captura: number;

    constructor() {
        this.fecha_hora.creacion = new Date();
        this.fecha_hora.fecha_captura = new Date();
    }
}

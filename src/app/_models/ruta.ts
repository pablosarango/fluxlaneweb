/*export class Ruta {
    _id: String;
    nombre: String;
    descripcion: String;
    estado: String;
    conductor_id: String;
    velocidad_promedio: String;
    fecha_hora: {
        creacion: Date,
        fecha_captura: Date,
        inicio_captura: String,
        fin_captura: String
    };
    clima: String;
    configuracion: {
        int_captura: Number
    };
    referencias = [
        {
            nombre: String,
            lat: String,
            lng: String
        }
    ];
    subpuntos = [
        {
            id: String,
        }
    ];

    constructor() {}
}*/
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

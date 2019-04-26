interface Coordenadas {
    latitud: String;
    longitud: String;
}

export class Subpunto {
    ruta_id: String;
    velocidad: String;
    fecha_hora: Date;
    coordenadas: Coordenadas;

    constructor() {
    }
}

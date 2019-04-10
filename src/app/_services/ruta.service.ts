import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Ruta } from '../_models';
import { environment } from '../../environments/environment.prod';

interface ItemsResponse {
    message: string;
    _id: string;
}


@Injectable({ providedIn: 'root' })
export class RutaService {
    constructor(private http: HttpClient) { }

    /*getAll() {
        return this.http.get<User[]>(`${environment.API_URL}/all`);
    }

    getByRol(rol: string) {
        return this.http.get<User[]>(`${environment.API_URL}/rol?valor=${rol}`);
    }*/
    getById(id: string) {
        return this.http.get<Ruta>(`${environment.API_URL}/ruta/${id}?code=5`);
    }

    crearRuta(ruta: Ruta) {
        return this.http.post<ItemsResponse>(`${environment.API_URL}/ruta`, ruta);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Ruta } from '../_models';
import { environment } from '../../environments/environment.prod';

interface ItemsResponse {
    status: number;
    message: string;
    _id: string;
}


@Injectable({ providedIn: 'root' })
export class RutaService {
    constructor(private http: HttpClient) { }

    getById(id: string) {
        return this.http.get<Ruta>(`${environment.API_URL}/ruta/${id}?code=5`);
    }

    crearRuta(ruta: Ruta) {
        return this.http.post<ItemsResponse>(`${environment.API_URL}/ruta`, ruta);
    }

    getLastItems(skip: Number, limit: Number, valor: String) {
        // http://localhost:3000/api/v0.1/ruta/lastItems?skip=0&limit=5&valor=ruta
        return this.http.get<Ruta[]>(`${environment.API_URL}/ruta/lastItems?skip=${skip}&limit=${limit}&valor=${valor}`);
    }

    search(valor: string) {
        // http://api.fluxlane.com/ruta/search?valor=pendiente
        return this.http.get<Ruta[]>(`${environment.API_URL}/ruta/search?valor=${valor}`);
    }

    delete(id: string) {
        // http://api.fluxlane.com/ruta/5bdfc4ee49a3d450210a2e10?code=14
        return this.http.delete<ItemsResponse>(`${environment.API_URL}/ruta/${id}?code=14`);
    }

    actualizar(id: string, ruta: Ruta) {
        return this.http.put<Ruta>(`${environment.API_URL}/ruta/${id}`, ruta);
    }
}

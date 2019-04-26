import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subpunto } from '../_models';
import { environment } from '../../environments/environment.prod';

interface ItemsResponse {
    status: number;
    message: string;
    _id: string;
}


@Injectable({ providedIn: 'root' })
export class SubpuntoService {
    constructor(private http: HttpClient) { }

    getByRutaId_All(rutaId: string) {
        // http://api.fluxlane.com/subpunto/ids/?rutaId=5bf3049a3a0de251ac26c870
        return this.http.get<Subpunto[]>(`${environment.API_URL}/subpunto/idsAll/?rutaId=${rutaId}`);
    }

    getbyRutaId_Ids(rutaId: string) {
        // http://localhost:3000/api/v0.1/subpunto/idsId/?rutaId=5bf6e4bf8bbf8d040a5a6760
        return this.http.get<Subpunto[]>(`${environment.API_URL}/subpunto/idsId/?rutaId=${rutaId}`);
    }

    delete(subpuntoId: string) {
        // http://localhost:3000/api/v0.1/subpunto/5b2f0251a2df06035c0346bf
        return this.http.delete<ItemsResponse>(`${environment.API_URL}/subpunto/${subpuntoId}`);
    }
}

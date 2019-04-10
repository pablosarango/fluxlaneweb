import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`${environment.API_URL}/usuario/all`);
    }

    getByRol(rol: string) {
        return this.http.get<User[]>(`${environment.API_URL}/usuario/rol?valor=${rol}`);
    }
}

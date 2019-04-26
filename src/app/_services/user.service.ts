import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../_models';
import { environment } from '../../environments/environment.prod';

interface ItemsResponse {
    status: number;
    message: string;
    _id: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`${environment.API_URL}/usuario/all`);
    }

    getByRol(rol: string) {
        return this.http.get<User[]>(`${environment.API_URL}/usuario/rol?valor=${rol}`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.API_URL}/usuario/${id}`);
    }

    updateRutasPendientes(id: string, rutas) {
        // http://localhost:3000/api/v0.1/usuario/campo/5baa5fa3cbacfc03f8e66a99?code=8
        return this.http.patch<ItemsResponse>(`${environment.API_URL}/usuario/campo/${id}?code=10`, rutas);
    }

    delRutaPendiente(usuarioId: string, idRuta) {
        // http://localhost:3000/api/v0.1/usuario/5baa81dc90dfc6055ee0d223?code=12
        /** NO FUNCIONA
         * Angular v7 no implemente un "body" en la solicitud con el verbo "delete"
         * Esto debio a una SUGERENCIA del estándar.
         * return this.http.delete<ItemsResponse>(`${environment.API_URL}/usuario/${usuarioId}?code=12`, idRuta);
        */
        return this.http.request('delete', `${environment.API_URL}/usuario/${usuarioId}?code=12`, { body: idRuta });
    }

    search(valor: string) {
        // http://localhost:3000/api/v0.1/usuario/search?valor=pgsarangou
        return this.http.get<User[]>(`${environment.API_URL}/usuario/search?valor=${valor}`);
    }

    changePassword(idUser: string, newPassword) {
        // http://localhost:3000/api/v0.1/usuario/password/5baa5fa3cbacfc03f8e66a99
        return this.http.patch<ItemsResponse>(`${environment.API_URL}/usuario/password/${idUser}`, newPassword);
    }

    updateAvatar(idUser: string, avatar: File) {
        // http://localhost:3000/api/v0.1/usuario/avatar/5bfb946cc6e7111a1e453e09?code=6
        const formData: FormData = new FormData();
        formData.append('avatar', avatar, avatar.name);
        return this.http.patch<ItemsResponse>(`${environment.API_URL}/usuario/avatar/${idUser}?code=6`, formData);
    }

    createUser(user: User) {
        // http://api.fluxlane.com/usuario/
        return this.http.post<ItemsResponse>(`${environment.API_URL}/usuario/`, user);
    }

    updateUser(idUser: string, user: User) {
        // http://api.fluxlane.com/usuario/5c06c16035883802bf72ae76
        return this.http.put<ItemsResponse>(`${environment.API_URL}/usuario/${idUser}`, user);
    }

    updateState(idUser: string, estado) {
        // http://api.fluxlane.com/usuario/campo/5bc66e440a67e81570ab6b4b?code=8
        return this.http.patch<ItemsResponse>(`${environment.API_URL}/usuario/campo/${idUser}?code=8`, estado);
    }

    delete(idUser: string) {
        // http://api.fluxlane.com/usuario/5bfb93dec6e7111a1e453e06?code=11
        return this.http.delete<ItemsResponse>(`${environment.API_URL}/usuario/${idUser}?code=11`);
    }
}

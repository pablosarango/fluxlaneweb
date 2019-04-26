import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Formatter {
    constructor() { }

    public dateToString(date: Date): string {
        let formatedDate: string;
        formatedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        return formatedDate;
    }

    public timeToString(date: Date): string {
        let formatedHour: string;
        formatedHour = ( (date.getHours() < 10 ? '0' : '') + date.getHours())
        + ':' + ((date.getMinutes() < 10 ? '0' : '') + date.getMinutes())
        + ':' + ((date.getSeconds() < 10 ? '0' : '') + date.getSeconds());
        return formatedHour;
    }

    public toDate(date: string): Date {
        return new Date(date);
    }

    public calcDuracion(horaFin: string, horaInicio: string): string {
        const hora1 = horaFin.split(':');
        const hora2 = horaInicio.split(':');
        const t1 = new Date();
        const t2 = new Date();
        t1.setHours(parseInt(hora1[0], 10), parseInt(hora1[1], 10), parseInt(hora1[2], 10));
        t2.setHours(parseInt(hora2[0], 10), parseInt(hora2[1], 10), parseInt(hora2[2], 10));
        t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
        return (t1.getHours() ? t1.getHours() + (t1.getHours() > 1 ? ' horas' : ' hora') : '')
        + (t1.getMinutes() ? ', ' + t1.getMinutes() + (t1.getMinutes() > 1 ? ' minutos' : ' minuto') : '')
        + (t1.getSeconds() ? (t1.getHours() || t1.getMinutes() ? ' y ' : '')
        + t1.getSeconds() + (t1.getSeconds() > 1 ? ' segundos' : ' segundo') : '');
    }
}

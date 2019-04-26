import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomError {

    constructor() { }

    public customError (message: string, status: number, statusText: string) {
        return {
            message: message,
            status: status,
            statusText: statusText,
            error: new Error()
        };
    }
}

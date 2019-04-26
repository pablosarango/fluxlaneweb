import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable({ providedIn: 'root' })
export class Notification {
    private configSucces: MatSnackBarConfig = {
        duration: 3000,
        panelClass: ['style-succes']
    };

    private configError: MatSnackBarConfig = {
        duration: 3000,
        panelClass: ['style-error']
    };

    constructor(private snackBar: MatSnackBar) { }

    public snackbarSucces(message) {
        if (!message) {
            this.snackBar.open('Éxito', 'Ok', this.configSucces);
        } else {
            this.snackBar.open(message, 'Ok', this.configSucces);
        }
    }

    public snackbarError(message) {
        if (!message) {
            this.snackBar.open('Error', 'Ok', this.configError);
        } else {
            this.snackBar.open(message, 'Ok', this.configError);
        }
    }

    public snackbar(message: string, action: string, className: string) {
        if (!message) {
            message = 'Rock it!!!';
        }
        this.snackBar.open(message, action, {
            duration: 2500,
            panelClass: [className]
        });
    }
}

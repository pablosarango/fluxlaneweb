import { Injectable, Directive, Input, OnChanges , SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class CustomValidators {

    constructor() { }

    public confirmPasswordValidator(confirmPassword: String): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
            const password: string = control.value;
            const isInValid = (password !== confirmPassword) ? true : false;
            return isInValid ? {'cnfPassword': {value: 'Invalid'}} : null;
        };
    }

    public pwdMatchUsernameValidator(username: String): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const password: string = control.value;
            const isInValid = (password === username) ? true : false;
            return isInValid ? { 'matchForUsername': { value: 'Invalid' } } : null;
        };
    }
}

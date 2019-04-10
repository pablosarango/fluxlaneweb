import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../_services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.nullValidator]);
  hide = true;
  returnUrl: string;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {

    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = 'home'; // this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  getErrorMessage() {
    return this.email.hasError('required')
      ? 'Debes introducir un correo'
      : this.email.hasError('email')
        ? 'Correo no válido'
        : '';
  }

  getErrorMessagePassword() {
    return this.password.hasError('required')
      ? 'Contraseña incorrecta'
      : this.password.hasError('nullValidator')
        ? 'Valor incorrecto'
        : '';
  }

  onSubmit() {

    if (!this.isEmpty(this.email.value) && !this.isEmpty(this.password.value)) {

      this.authenticationService.login(this.email.value, this.password.value)
        .pipe(first())
        .subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
            },
            error => {
                this.error = error;
                console.log(error);
            });
    }
  }

  isEmpty(obj: any): boolean {
    if (obj === null
        || obj === undefined
        || (obj.length !== undefined && obj.length === 0)
        || Object.keys(obj).length === 0) {
        return true;
    }

    return false;
  }
}

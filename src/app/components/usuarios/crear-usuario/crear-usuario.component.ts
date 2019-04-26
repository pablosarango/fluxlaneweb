import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormErrorStateMatcher, CustomValidators } from '../../../_helpers';
import { User } from '../../../_models';
import { UserService } from '../../../_services';
import { first } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';



// Diálogo Ver Ruta
export interface DialogCreateUser {
  user: User;
  image: File;
  update: boolean;
  updateAvatar: boolean;
}

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {
  hide = true;
  formNewUser: FormGroup;
  errorMatcher = new FormErrorStateMatcher();
  baseAvatarUrl = environment.AVATAR_URL;
  urlAvatar = this.baseAvatarUrl + '/' + 'user.png';
  selectedRol: string;
  rols = [
    {value: 'administrador', viewValue: 'Administrador'},
    {value: 'conductor', viewValue: 'Conductor'}
  ];
  userId;
  updateUser = false;
  lastEmail;
  changeEmail = false;
  haveImage = false;
  image: File;
  user: User = new User();
  invalidForm = true;
  oldAvatar;

  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomValidators,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private dialog: MatDialog) {
  }

  ngOnInit() {

    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      this.updateUser = true;
      this.buildForm();
      this.userService
        .getById(this.userId)
        .pipe(first())
        .subscribe(user => {
            this.formNewUser.patchValue({
              nombre: user.displayName,
              correo: user.email,
              password: '',
              confirmPassword: '',
              avatar: '',
              rol: user.rol,
              vehiculo: user.vehicle
            });
            this.oldAvatar = user.avatar;
            // Estas dos líneas aún no se por qué las escribí XD.
            this.urlAvatar = this.baseAvatarUrl + '/' + user.avatar;
            this.lastEmail = user.email;
          }, err => {
            console.log(err);
            this.cerrar();
          });
    } else {
      this.buildForm();
    }
  }


  buildUser() {
  }

  buildForm() {
    this.formNewUser = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      correo: [{value: '', disabled: this.updateUser}, [Validators.required, Validators.email]],
      password: [{value: '', disabled: this.updateUser}, [Validators.required]],
      confirmPassword: [{value: '', disabled: this.updateUser}, [Validators.required]],
      avatar: ['', [Validators.required]],
      rol: ['', [Validators.required]],
      vehiculo: ['', [Validators.required, Validators.minLength(4)]]
    });
    this.handleFormChanges();
  }

  handleFormChanges() {
    this.formNewUser.valueChanges.subscribe(
      changes => {
        if (this.formNewUser.valid) {
          this.invalidForm = false;
        } else {
          if (this.updateUser) {
            this.invalidForm = false;
          } else {
            this.invalidForm = true;
          }
        }
      }
    );
    this.username.valueChanges.subscribe(
      uname => {
        this.password.setValidators([Validators.required, this.customValidator.pwdMatchUsernameValidator(uname)]);
        this.password.updateValueAndValidity();
      }
    );
    this.password.valueChanges.subscribe(
      pwd => {
        const uname = this.username.value;
        this.password.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(15),
          this.customValidator.pwdMatchUsernameValidator(uname)]);

        this.confirmPassword.setValidators([Validators.required, this.customValidator.confirmPasswordValidator(pwd)]);
        this.confirmPassword.updateValueAndValidity();
      }
    );
    this.confirmPassword.valueChanges.subscribe(
      () => {
        const pwd = this.password.value;
        this.confirmPassword.setValidators([Validators.required, this.customValidator.confirmPasswordValidator(pwd)]);
      }
    );
    this.avatar.valueChanges.subscribe(
      image => {
        if (image === '' || image === null || image === undefined) {
          this.urlAvatar = '../../../../assets/img/recursos/user.png';
        }
      }
    );
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const reader = new FileReader();
      this.haveImage = true;
      this.image = <File>fileList[0];

      reader.onload = (e) => {
        this.urlAvatar = reader.result.toString();
      };

      reader.readAsDataURL(fileList[0]);
    } else {
      this.haveImage = false;
    }
  }

  cerrar() {
    this.router.navigate(['home/usuarios']);
  }

  onFormSubmit() {
    const formValues = this.formNewUser.value;
    this.user.email = formValues.correo;
    this.user.displayName = formValues.nombre;
    this.user.password = formValues.password;
    this.user.avatar = 'user.png';
    this.user.rol = formValues.rol;
    this.user.vehicle = formValues.vehiculo;
    if (this.updateUser) {
      this.user._id = this.userId;
      if (!this.haveImage) {
        this.user.avatar = this.oldAvatar;
      }
      this.openDialogCreateUser(this.user, this.image, true, this.haveImage);
    } else {
      this.openDialogCreateUser(this.user, this.image, false, this.haveImage);
    }
  }

  openDialogCreateUser(user: User, image: File, update: boolean, updateAvatar: boolean): void {
    const dialogRef = this.dialog.open(DialogCreateUserComponent, {
      width: '500px',
      data: {
        user: user,
        image: image,
        update: update,
        updateAvatar: updateAvatar
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo CREATE-USER cerrado');
      if (result) {
        this.formNewUser.reset();
        this.cerrar();
      }
    });
  }

  get username() {
    return this.formNewUser.get('nombre');
  }
  get email() {
    return this.formNewUser.get('correo');
  }
  get password() {
    return this.formNewUser.get('password');
  }
  get confirmPassword() {
    return this.formNewUser.get('confirmPassword');
  }
  get avatar() {
    return this.formNewUser.get('avatar');
  }
  get rol() {
    return this.formNewUser.get('rol');
  }
  get vehicle() {
    return this.formNewUser.get('vehiculo');
  }

  getErrorNameMessage() {
    return this.username.hasError('required')
      ? 'Debes introducir un nombre de usuario'
      : this.username.invalid
        ? 'Nombre de usuario no válido'
        : '';
  }

  getErrorEmailMessage() {
    return this.email.hasError('required')
      ? 'Debes introducir un correo'
      : this.email.hasError('email')
        ? 'Correo no válido'
        : '';
  }

  getErrorPasswordMessage() {
    return this.password.hasError('required')
      ? 'Debes introducir una contraseña'
      : this.password.errors.matchForUsername
        ? 'La contraseña no debe ser igual al nombre de usuario'
        : this.password.invalid
          ? 'Contraseña no válida'
          : '';
  }

  getErrorConfirmPasswordMessages() {
    return this.confirmPassword.hasError('required')
      ? 'Repita la contraseña'
      : this.confirmPassword.errors.cnfPassword
        ? 'Las contraseñas no coindicen'
        : '';
  }

  getErrorAvatarMessages() {
    return this.avatar.hasError('required')
      ? 'Foto de usuario necesaria'
      : this.avatar.invalid
        ? 'Imagen no válida'
        : '';
  }

  getErrorRolMessages() {
    return this.rol.hasError('required')
      ? 'Rol necesario'
      : this.rol.invalid
        ? 'Rol no válido'
        : '';
  }

  getErrorVehicleMessages() {
    return this.vehicle.hasError('required')
      ? 'Tipo de vehículo necesario'
      : this.vehicle.invalid
        ? 'Tipo de vehículo no válido'
        : '';
  }

}

@Component({
  selector: 'app-dialog-crear-usuario',
  templateUrl: './dialog-crear-usuario/dialog-crear-usuario.html',
  styleUrls: ['./dialog-crear-usuario/dialog-crear-usuario.component.css']
})
export class DialogCreateUserComponent implements OnInit {
  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  labelMessage = 'Usuario Id: ';
  message: String = '';
  action = 'Guardar';
  userId: string;

  constructor(
    public dialogRef: MatDialogRef<DialogCreateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogCreateUser,
    private userService: UserService) {
    }

  ngOnInit(): void {
    if (this.data.update) {
      this.labelMessage = 'Respuesta: ';
      this.action = 'Actualizar ';
    }
    this.userId = this.data.user._id.toString();
  }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  async submit() {
    delete this.data.user._id;
    delete this.data.user.signupDate;
    delete this.data.user.lastLogin;
    delete this.data.user.token;
    delete this.data.user.state;

    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;

    try {
      const response = await this.crearNuevoUsuario(this.data.user);
      await this.patchAvatar(response._id, this.data.image);
      this.isVisible = false;
      this.isCorrect = true;
      this.isDisabled = false;
      this.isHidden = false;
      this.message = response._id;
    } catch (e) {
      this.isVisible = false;
      this.isIncorrect = true;
      this.message = e.message;
      this.isDisabled = false;
      console.log(e);
    }
  }

  async update() {
    delete this.data.user._id;
    delete this.data.user.email;
    delete this.data.user.password;
    delete this.data.user.signupDate;
    delete this.data.user.lastLogin;
    delete this.data.user.token;
    delete this.data.user.pending_routes;
    delete this.data.user.state;


    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;

    try {
      const response = await this.actualizarUsuario(this.userId, this.data.user);
      if (this.data.updateAvatar) {
        await this.patchAvatar(this.userId, this.data.image);
      }
      this.isVisible = false;
      this.isCorrect = true;
      this.isDisabled = false;
      this.message = response.message;
      this.isHidden = false;
    } catch (e) {
      this.isVisible = false;
      this.isIncorrect = true;
      this.message = e.message;
      this.isDisabled = false;
      console.log(e);
    }
  }

  async patchAvatar(idUser: string, image: File) {
    try {
      const response = await this.userService.updateAvatar(idUser, image).pipe(first()).toPromise();
      return response;
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  async crearNuevoUsuario(user: User) {
    try {
      const response = await this.userService.createUser(user).pipe(first()).toPromise();
      return response;
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  async actualizarUsuario(idUser: string, user: User) {
    try {
      const response = await this.userService.updateUser(idUser, user).pipe(first()).toPromise();
      return response;
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  private resetControl() {
    this.isVisible = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.isDisabled = false;
    this.isHidden = true;
  }
}

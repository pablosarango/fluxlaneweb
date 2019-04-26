import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RutaService, UserService } from '../../../_services';
import { first } from 'rxjs/operators';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Ruta, User } from 'src/app/_models';
import { Notification, Formatter, FormErrorStateMatcher } from '../../../_helpers';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.prod';



// Table
export interface UserData {
  id: string;
  displayName: string;
  state: string;
  rutasPendientes: number;
  rol: string;
  borrar: boolean;
}

// Diálogo Ver Ruta/Change Password/Change State
export interface DialogUser {
  user: User;
}

// Diálogo Delete User
export interface DialogDeleteUser {
  idUser: string;
}


@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  searchForm: FormGroup;
  displayedColumns: string[] = ['nombre', 'rol', 'estado', 'rutasPendientes', 'opciones'];
  dataSource: MatTableDataSource<UserData>;
  dataArray: UserData[] = [];
  ruta: Ruta;
  isLoading = true;
  user: User;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private rutaService: RutaService,
    private notification: Notification,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService) {
      this.searchForm = this.formBuilder.group({
        valor: ['', [Validators.required, Validators.minLength(4)]],
        limit: [20, [Validators.required, Validators.min(1)]]
      });
    }

  ngOnInit() {
    this.search('conductor');
  }

  get f() { return this.searchForm.controls; }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  search(valor: string) {
    this.isLoading = true;
    this.userService.search(valor).pipe(first()).subscribe(
      usuarios => {
        this.dataArray = [];
        let rta: UserData;
        usuarios.forEach(element => {
          rta = {
            id: element._id.toString(),
            displayName: element.displayName.toString(),
            state: element.state.toString(),
            rutasPendientes: element.pending_routes.length,
            rol: element.rol.toString(),
            borrar: (element.pending_routes.length !== 0 || element.rol === 'administrador') ? true : false
          };
          this.dataArray.push(rta);
        });
        this.dataSource = new MatTableDataSource(this.dataArray);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      err => {
        console.log(err);
        if (err.message) {
          this.notification.snackbarError(err.message);
        } else {
          this.notification.snackbarError('Imposible conectar');
        }
        this.isLoading = false;
      }
    );
  }

  async getUserById(id: string) {
    try {
      this.user = await this.userService.getById(id).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  openDialogViewUser(user: User): void {
    const dialogRef = this.dialog.open(DialogViewUserComponent, {
      width: '70%',
      data: {
        user: user
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo VIEW-USER cerrado');
    });
  }

  openDialogChangePassword(user: User): void {
    const dialogRef = this.dialog.open(DialogChangePasswordComponent, {
      width: '500px',
      data: {
        user: user
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo CHANGE-PASSWORD cerrado');
    });
  }

  openDialogChangeState(user: User): void {
    const dialogRef = this.dialog.open(DialogChangeStateComponent, {
      width: '500px',
      data: {
        user: user
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo CHANGE-STATE cerrado');
      this.search('conductor');
    });
  }

  openDialogDeleteUser(idUser: string): void {
    const dialogRef = this.dialog.open(DialogDeleteUserComponent, {
      width: '500px',
      data: {
        idUser: idUser
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo DELETE-USER cerrado');
      this.search('conductor');
    });
  }

  async dialogViewUser (id: string) {
    try {
      await this.getUserById(id);
      this.openDialogViewUser(this.user);
    } catch (e) {
      console.log(e);
    }
  }

  async dialogChangePassword (id: string) {
    try {
      await this.getUserById(id);
      this.openDialogChangePassword(this.user);
    } catch (e) {
      console.log(e);
    }
  }

  async dialogChangeState (id: string) {
    try {
      await this.getUserById(id);
      this.openDialogChangeState(this.user);
    } catch (e) {
      console.log(e);
    }
  }

  dialogEditUser (id: string) {
    this.router.navigate(['/home/usuarios/editar', id]);
  }

  dialogDelUser (id: string) {
    this.openDialogDeleteUser(id);
  }

}

/**
 * Dialogo VER USUARIO
 */
@Component({
  selector: 'app-dialog-ver-usuario',
  templateUrl: './dialog-ver-usuario/dialog-ver-usuario.html',
  styleUrls: ['./dialog-ver-usuario/dialog-ver-usuario.component.css']
})
export class DialogViewUserComponent implements OnInit {

  user: User;
  fecha_alta;
  last_login;
  avatarUrl = environment.AVATAR_URL;

  constructor(
    public dialogRef: MatDialogRef<DialogViewUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogUser,
    private formatter: Formatter) {
      this.user = this.data.user;
      this.avatarUrl = this.avatarUrl + '/' + this.user.avatar;
      const singUpDate = this.formatter.toDate(this.user.signupDate.toString());
      this.fecha_alta = this.formatter.dateToString(singUpDate);
      let lastLogin;
      if (!this.user.lastLogin) {
        this.last_login = 'Desconocido';
      } else {
        lastLogin = this.formatter.toDate(this.user.lastLogin.toString());
        this.last_login = this.formatter.dateToString(lastLogin) + ' - ' + this.formatter.timeToString(lastLogin);
      }
    }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}

/**
 * Diálogo CHANGE PASSWORD
 */
@Component({
  selector: 'app-dialog-change-password',
  templateUrl: './dialog-password/dialog-password.html',
  styleUrls: ['./dialog-password/dialog-password.component.css']
})
export class DialogChangePasswordComponent implements OnInit {

  user: User;
  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';
  formPassword: FormGroup;
  errorMatcher = new FormErrorStateMatcher();
  hide = true;
  formHide = true;

  constructor(
    public dialogRef: MatDialogRef<DialogChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogUser,
    private userService: UserService,
    private formBuilder: FormBuilder) {
      this.user = this.data.user;
      this.formPassword = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validator: this.checkPasswords });
    }

  ngOnInit(): void {
  }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true };
  }


  get f() { return this.formPassword.controls; }

  update() {
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.formHide = false;
    const newPassword = {
      'password': this.f.password.value
    };
    this.userService.changePassword(this.user._id.toString(), newPassword).pipe(first()).subscribe(
      res => {
        this.isVisible = false;
        this.isCorrect = true;
        this.isDisabled = false;
        this.message = res.message;
        this.isHidden = false;
      },
      err => {
        this.formHide = true;
        this.isVisible = false;
        this.isIncorrect = true;
        if (!err.message) {
          this.message = err.statusText;
        } else {
          this.message = err.message;
        }
        this.isDisabled = false;
        console.log(err);
      }
    );
  }

  private resetControl() {
    this.formHide = true;
    this.isVisible = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.isDisabled = false;
    this.isHidden = true;
  }
}


/**
 * Diálogo CHANGE STATE
 */
@Component({
  selector: 'app-dialog-change-state',
  templateUrl: './dialog-state/dialog-state.html',
  styleUrls: ['./dialog-state/dialog-state.component.css']
})
export class DialogChangeStateComponent implements OnInit {

  user: User;
  formState: FormGroup;
  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';
  hide = true;
  formHide = true;
  estados = [
    {value: 'Activo', viewValue: 'Activo'},
    {value: 'No activo', viewValue: 'No activo'}
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogChangeStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogUser,
    private userService: UserService,
    private formBuilder: FormBuilder) {
      this.user = this.data.user;
      this.formState = this.formBuilder.group({
        estado: ['', [Validators.required]]
      });
    }

  ngOnInit(): void {
  }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  get f() { return this.formState.controls; }

  update() {
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.formHide = false;
    const newState = {
      'elemento': this.f.estado.value
    };
    this.userService.updateState(this.user._id.toString(), newState).pipe(first()).subscribe(
      res => {
        this.isVisible = false;
        this.isCorrect = true;
        this.isDisabled = false;
        this.message = res.message;
        this.isHidden = false;
      },
      err => {
        this.formHide = true;
        this.isVisible = false;
        this.isIncorrect = true;
        if (!err.message) {
          this.message = err.statusText;
        } else {
          this.message = err.message;
        }
        this.isDisabled = false;
        console.log(err);
      }
    );
  }

  private resetControl() {
    this.formHide = true;
    this.isVisible = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.isDisabled = false;
    this.isHidden = true;
  }
}


/**
 * Diálogo DELETE USER
 */
@Component({
  selector: 'app-dialog-delete-user',
  templateUrl: './dialog-delete/dialog-delete.html',
  styleUrls: ['./dialog-delete/dialog-delete.component.css']
})
export class DialogDeleteUserComponent implements OnInit {

  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';

  constructor(
    public dialogRef: MatDialogRef<DialogChangeStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDeleteUser,
    private userService: UserService) {}

  ngOnInit(): void {
  }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  delete() {
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.userService.delete(this.data.idUser).pipe(first()).subscribe(
      res => {
        this.isVisible = false;
        this.isCorrect = true;
        this.isDisabled = false;
        this.message = res.message;
        this.isHidden = false;
      },
      err => {
        this.isVisible = false;
        this.isIncorrect = true;
        if (!err.message) {
          this.message = err.statusText;
        } else {
          this.message = err.message;
        }
        this.isDisabled = false;
        console.log(err);
      }
    );
  }

  private resetControl() {
    this.isVisible = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.isDisabled = false;
    this.isHidden = true;
  }
}

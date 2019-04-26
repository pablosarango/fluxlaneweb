import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { RutaService } from '../../../_services';
import { Notification, Formatter } from '../../../_helpers';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

// Table
export interface RutaData {
  id: String;
  nombre: String;
  estado: String;
  fecha: String;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  searchForm: FormGroup;
  displayedColumns: string[] = ['nombre', 'estado', 'fecha', 'opciones'];
  dataSource: MatTableDataSource<RutaData>;
  dataArray: RutaData[] = [];
  isLoading = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private formBuilder: FormBuilder,
    private rutaService: RutaService,
    private notification: Notification,
    private formater: Formatter,
    private router: Router) {
    this.searchForm = this.formBuilder.group({
      valor: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    this.search('pendiente');
  }


  get f() { return this.searchForm.controls; }

  search(valor: string) {
    this.isLoading = true;
    this.rutaService.search(valor).pipe(first()).subscribe(
      rutas => {
        this.dataArray = [];
        let rta: RutaData;
        let date: Date;
        rutas.forEach(element => {
          date = this.formater.toDate(element.fecha_hora.fecha_captura.toString());
          rta = {
            id: element._id,
            nombre: element.nombre,
            estado: element.estado,
            fecha: this.formater.dateToString(date) + ' - ' + this.formater.timeToString(date)
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  goToDetalles(id: string) {
    this.router.navigate(['/home/rutas/detalles', id]);
  }
}

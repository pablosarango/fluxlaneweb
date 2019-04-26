import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RutaService, UserService, SubpuntoService } from '../../../_services';
import { first } from 'rxjs/operators';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Ruta, User } from 'src/app/_models';
import { Notification, Formatter } from '../../../_helpers';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';



import * as mapboxgl from 'mapbox-gl';

// Table
export interface RutaData {
  id: String;
  nombre: String;
  descripcion: String;
}

// Diálogo Ver Ruta
export interface DialogViewRuta {
  ruta: Ruta;
  fecha: string;
  hora: string;
  conductor: User;
}

// Diálogo Eliminar Ruta
export interface DialogDelRuta {
  id: string;
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  searchForm: FormGroup;
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'opciones'];
  dataSource: MatTableDataSource<RutaData>;
  dataArray: RutaData[] = [];
  ruta: Ruta;
  isLoading = true;
  conductor;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private rutaService: RutaService,
    private notification: Notification,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private formatter: Formatter) {
      this.searchForm = this.formBuilder.group({
        valor: ['', [Validators.required, Validators.minLength(4)]],
        limit: [20, [Validators.required, Validators.min(1)]]
      });

      this.getLastItems('ruta');
    }

  ngOnInit() {

  }

  get f() { return this.searchForm.controls; }

  getLastItems(valor: string) {
    this.isLoading = true;
    let limit = this.f.limit.value;
    if (limit === null) { limit = 5; }
    this.rutaService.getLastItems(0, limit, valor).pipe(first()).subscribe(
      rutas => {
        this.dataArray = [];
        let rta: RutaData;
        rutas.forEach(element => {
          rta = {
            id: element._id,
            nombre: element.nombre,
            descripcion: element.descripcion
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

  async visualizarRuta (id: string) {
    try {
      await this.getRuta(id);
      await this.getUserById(this.ruta.conductor_id.toString());
      const date = this.formatter.toDate(this.ruta.fecha_hora.fecha_captura.toString());
      const fecha = this.formatter.dateToString(date);
      const hora = this.formatter.timeToString(date);
      this.openDialogVerRuta(this.ruta, fecha, hora, this.conductor);
    } catch (e) {
      console.log(e);
    }
  }

  async getUserById(id: string) {
    try {
      this.conductor = await this.userService.getById(id).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  editarRuta (id: string) {
    this.router.navigate(['/home/editor/crear', id]);
  }

  eliminarRuta(rutaId: string) {
    this.openDialogEliminarRuta(rutaId);
  }

  openDialogVerRuta(ruta: Ruta, fecha: string, hora: string, user: User): void {
    const dialogRef = this.dialog.open(DialogVerRutaComponent, {
      width: '70%',
      data: {
        ruta: this.ruta,
        fecha: fecha,
        hora: hora,
        conductor: user
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo VER-RUTA cerrado');
    });
  }

  openDialogEliminarRuta(rutaId: string): void {
    const dialogRef = this.dialog.open(DialogEliminarRutaComponent, {
      width: '350px',
      data: {
        id: rutaId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo ELIMINAR-RUTA cerrado');
      this.getLastItems('ruta');
    });
  }

  async getRuta (id: string) {
    try {
      this.ruta = await this.rutaService.getById(id).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

}


@Component({
  selector: 'app-dialog-ver-ruta',
  templateUrl: './ver-ruta/dialog-ver-ruta.html',
  styleUrls: ['./ver-ruta/dialog-ver-ruta.component.css']
})
export class DialogVerRutaComponent implements OnInit {

  ruta: Ruta;
  mapa: mapboxgl;
  isLoaded = false;
  conductor;

  constructor(
    public dialogRef: MatDialogRef<DialogVerRutaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogViewRuta) {
      this.ruta = this.data.ruta;
      this.conductor = this.data.conductor;
    }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  changeTab(event: MatTabChangeEvent) {
    if (event.index === 1 && !this.isLoaded) {
      this.isLoaded = true;
      this.buildMap();
    }
  }

  buildMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGFibG9zYXJhbmdvIiwiYSI6ImNqZmJ0ejZmbDE2dGMycW9idnlzdTEwYzYifQ.2biyau1-6T0nL1LFWHCF2w';
      this.mapa = new mapboxgl.Map({
        container: 'mapa-dialogo',
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 13,
        center: [ -79.198223, -3.983971] // Mapbox usa LONGITUD, LATITUD
    });

    this.mapa.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
      },
      trackUserLocation: true
    }));
    this.mapa.addControl(new mapboxgl.NavigationControl());

    this.mapa.on('load', () => {
      /**
       * FORMATO DE ENVIO DE COORDENADAS
       * LONGITUD,LATITUD;LONGITUD,LATITUD;
       * -79.19676170999823,-3.9852894003513484;-79.19930553208346,-3.9830689352842654;
       * -79.19841519435077,-3.9825613995685103;-79.19680410702766,-3.9825191049167756
       */
      const referencias = this.ruta.referencias;
      let coordenadas = '';
      referencias.forEach((element) => {
        coordenadas = coordenadas + element.lng + ',' + element.lat + ';';
      });
      coordenadas = coordenadas.substring(0, coordenadas.length - 1);
      this.getMatch(coordenadas);
    });
  }

  getMatch(e) {
    const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
    e + '?geometries=geojson&steps=true&&access_token=' + mapboxgl.accessToken;
    const req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = () => {
      const jsonResponse = req.response;
      const coords = jsonResponse.routes[0].geometry;
      // add the route to the map
      this.addRoute(coords);
    };
    req.send();
  }

  addRoute(coords) {
    // check if the route is already loaded
    if (this.mapa.getSource('route')) {
      this.mapa.removeLayer('routearrows');
      this.mapa.removeLayer('route');
      this.mapa.removeSource('route');
    } else {
      this.mapa.addLayer({
        'id': 'route',
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': coords
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': {
            base: 1,
            stops: [[12, 3], [22, 12]]
          }
        }
      }, 'waterway-label');
      this.mapa.addLayer({
        id: 'routearrows',
        type: 'symbol',
        source: 'route',
        layout: {
          'symbol-placement': 'line',
          'text-field': '▶',
          'text-size': {
            base: 1,
            stops: [[12, 24], [22, 60]]
          },
          'symbol-spacing': {
            base: 1,
            stops: [[12, 30], [22, 160]]
          },
          'text-keep-upright': false
        },
        paint: {
          'text-color': '#3887be',
          'text-halo-color': 'hsl(55, 11%, 96%)',
          'text-halo-width': 4
        }
      }, 'waterway-label');
    }
  }

}


@Component({
  selector: 'app-dialog-eliminar-ruta',
  templateUrl: './eliminar-ruta/dialog-eliminar-ruta.html',
  styleUrls: ['./eliminar-ruta/dialog-eliminar-ruta.component.css']
})
export class DialogEliminarRutaComponent implements OnInit {

  id: string;
  userId: string;
  subpuntosIds = [];
  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';

  constructor(
    public dialogRef: MatDialogRef<DialogEliminarRutaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDelRuta,
    private rutaService: RutaService,
    private userService: UserService,
    private subpuntoService: SubpuntoService) {
      this.id = this.data.id;
    }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  async delete() {
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    let borrar = false;
    try {
      await this.getRutaById(this.id);
      await this.delRutaPendiente(this.userId, this.id);
      this.subpuntoService.getbyRutaId_Ids(this.id).pipe(first()).subscribe(
        res => {
          this.subpuntosIds = res;
          this.delSubpuntos();
        },
        error => {
          console.log(error);
        }
      );
      borrar = true;
    } catch (e) {
      borrar = false;
    }

    if (borrar) {
      this.rutaService.delete(this.id).pipe(first()).subscribe(
        response => {
          this.isVisible = false;
          this.isCorrect = true;
          this.isDisabled = false;
          this.message = response.message;
          this.isHidden = false;
        },
        err => {
          this.isVisible = false;
          this.isIncorrect = true;
          this.message = err.message;
          this.isDisabled = false;
          console.log(err);
        }
      );
    }

  }

  async delRutaPendiente(usuarioId: string, rutaId: string) {
    const obj = {
      'id': rutaId
    };
    let response: any;
    try {
      response = await this.userService.delRutaPendiente(usuarioId, obj).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  async getRutaById(id: string) {
    let ruta: Ruta;
    try {
      ruta = await this.rutaService.getById(id).pipe(first()).toPromise();
      this.userId = ruta.conductor_id.toString();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  // Función no implementada. No termina el proceso cuando
  // el servidor retorna 404;
  async getSubpuntosIdsByRutaId(rutaId: string) {
    try {
      this.subpuntosIds = await this.subpuntoService.getbyRutaId_Ids(rutaId).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  async delSubpuntos() {
    let id;
    for (let index = 0; index < this.subpuntosIds.length; index++) {
      id = this.subpuntosIds[index];
      try {
        await this.deleteSubpunto(id);
      } catch (e) {
        console.log(e);
        break;
      }
    }
  }

  async deleteSubpunto(id: string) {
    let response: any;
    try {
      response = await this.subpuntoService.delete(id).pipe(first()).toPromise();
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

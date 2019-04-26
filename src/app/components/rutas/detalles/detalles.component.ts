import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RutaService, UserService, SubpuntoService} from '../../../_services';
import { Ruta, User } from '../../../_models';
import { Formatter, Notification } from '../../../_helpers';
import { first } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as mapboxgl from 'mapbox-gl';

export interface DialogData {
  ruta: Ruta;
  id: string;
  borrar: [];
}

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnInit {
  rutaId;
  ruta: Ruta;
  mapa: mapboxgl;
  isLoaded = false;
  isWaiting = true;
  fecha: string;
  hora: string;
  fechaInicioCaptura: string;
  horaInicioCaptura: string;
  fechaFinCaptura: string;
  horaFinCaptura: string;
  duracionViaje: string;
  conductor: User;
  subpuntos = [];
  borrarSubpuntos = [];
  velocidadPromedio = 0;
  toggleAprobar = false;
  toggleRevisar = false;
  toggleRechazar = false;
  isChange = true;
  coordenadasSubpuntos = [];
  maxSpeed;
  minSpeed;

  geojson = {
    'type': 'FeatureCollection',
    'features': []
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rutaService: RutaService,
    private userService: UserService,
    private subpuntoService: SubpuntoService,
    private formatter: Formatter,
    private notification: Notification,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.rutaId = this.route.snapshot.params['id'];
    this.getRuta(this.rutaId);
    this.getSubpuntos(this.rutaId);
  }

  getRuta (id: string): void {
    this.rutaService.getById(id).pipe(first()).subscribe(
      ruta => {
        this.ruta = ruta;
        const date = this.formatter.toDate(ruta.fecha_hora.fecha_captura.toString());
        const dateInicioCaptura = this.formatter.toDate(ruta.fecha_hora.inicio_captura.toString());
        const dateFinCaptura = this.formatter.toDate(ruta.fecha_hora.fin_captura.toString());
        this.fecha = this.formatter.dateToString(date);
        this.hora = this.formatter.timeToString(date);
        this.fechaInicioCaptura = this.formatter.dateToString(dateInicioCaptura);
        this.horaInicioCaptura = this.formatter.timeToString(dateInicioCaptura);
        this.fechaFinCaptura = this.formatter.dateToString(dateFinCaptura);
        this.horaFinCaptura = this.formatter.timeToString(dateFinCaptura);
        this.duracionViaje = this.formatter.calcDuracion(this.horaFinCaptura, this.horaInicioCaptura);
        this.getUserById(this.ruta.conductor_id.toString());
      },
      err => {
        this.router.navigate(['/home/rutas/dashboard']);
      }
    );
  }

  getUserById(id: string): void {
    this.userService.getById(id).pipe(first()).subscribe(
      user => {
        this.conductor = user;
        this.isWaiting = false;
      },
      err => {
        this.conductor.displayName = this.ruta.conductor_id;
        this.isWaiting = false;
        this.notification.snackbarError('Error al recuperar al conductor');
      }
    );
  }

  getSubpuntos(rutaId: string) {
    this.subpuntoService.getByRutaId_All(rutaId).pipe(first()).subscribe(
      subpoints => {
        subpoints.forEach(element => {
          this.subpuntos.push(element);
        });
        let speed;
        subpoints.forEach(element => {
          speed = element.velocidad;
          this.velocidadPromedio = this.velocidadPromedio + parseFloat(speed);
        });
        this.velocidadPromedio = this.velocidadPromedio / subpoints.length;

        subpoints.forEach(element => {
          this.coordenadasSubpuntos.push(element);
        });

        this.getMinMaxSpeed();
      },
      err => {
        this.router.navigate(['/home/rutas/dashboard']);
      }
    );
  }

  eliminarCeros () {
    for (let i = this.subpuntos.length - 1; i >= 0; i--) {
      if (this.subpuntos[i].velocidad === '0') {
        this.borrarSubpuntos.push(this.subpuntos[i]);
        this.subpuntos.splice(i, 1);
      }
    }
    this.velocidadPromedio = 0;
    this.subpuntos.forEach(element => {
      this.velocidadPromedio = this.velocidadPromedio + parseFloat(element.velocidad);
    });
    this.velocidadPromedio = this.velocidadPromedio / this.subpuntos.length;
  }


  buildMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGFibG9zYXJhbmdvIiwiYSI6ImNqZmJ0ejZmbDE2dGMycW9idnlzdTEwYzYifQ.2biyau1-6T0nL1LFWHCF2w';
      this.mapa = new mapboxgl.Map({
        container: 'mapa',
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
      const referencias = this.ruta.referencias;
      let coordenadas = '';
      referencias.forEach((element) => {
        coordenadas = coordenadas + element.lng + ',' + element.lat + ';';
      });
      coordenadas = coordenadas.substring(0, coordenadas.length - 1);
      this.getMatch(coordenadas);

      const subpuntos = [];
      this.coordenadasSubpuntos.forEach(element => {
        subpuntos.push(element);
      });

      console.log(subpuntos);

      let coorSubpoints = '';
      if (subpuntos.length > 24) {
        // console.log(subpuntos);
        const divisiones = Math.ceil(subpuntos.length / 24);
        const rutas = this.chunkify(subpuntos, divisiones, true);
        let ruta = [];
        for (let index = 0; index < rutas.length; index++) {
          ruta = rutas[index];
          let lat;
          let lng;
          ruta.forEach(e => {
            lat = e.coordenadas.latitud.replace(',', '.');
            lng = e.coordenadas.longitud.replace(',', '.');
            coorSubpoints = coorSubpoints + lng + ',' + lat + ';';
            lat = '';
            lng = '';
          });
          coorSubpoints = coorSubpoints.substring(0, coorSubpoints.length - 1);
          ruta = [];
        }
      } else {
        subpuntos.forEach(e => {
          coorSubpoints = coorSubpoints + e.coordenadas.longitud.replace(',', '.') + ',' + e.coordenadas.latitud.replace(',', '.') + ';';
        });
        coorSubpoints = coorSubpoints.substring(0, coorSubpoints.length - 1);
      }

      const temp = coorSubpoints.split(';');

      let tmp = [];
      let a = {};
      temp.forEach(element => {
        tmp = element.split(',');
        a = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [tmp[0], tmp[1]]
          }
        };
        this.geojson.features.push(a);
        a = {};
        tmp = [];
      });

      this.mapa.addSource('point', {
        'type': 'geojson',
        'data': this.geojson
      });

      this.mapa.addLayer({
        'id': 'point',
        'type': 'circle',
        'source': 'point',
        'paint': {
          'circle-radius': 3,
          'circle-color': '#E91E63'
        }
      });

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
        'line-color': '#3F51B5',
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
        'text-color': '#3F51B5',
        'text-halo-color': 'hsl(55, 11%, 96%)',
        'text-halo-width': 4
      }
    }, 'waterway-label');
  }

  getMinMaxSpeed() {
    const array = [];
    this.subpuntos.forEach(element => {
      if (parseInt(element.velocidad, 10) !== 0) {
        array.push(parseInt(element.velocidad, 10));
      }
    });

    this.minSpeed = this.arrayMin(array);
    this.maxSpeed = this.arrayMax(array);
  }

  /**
   * Función para divir un arreglo en N divisiones.
   * Si se balancea (true) las longitudes de las divisiones varían lo menos posible.
   * Si no se balancea (false) las longitudes son "par" menos las últimas que tiene la misma longitud (par o no).
   * @param a Arreglo a dividir
   * @param n Número de divisiones
   * @param balanced Booleano para determinar si el resultado se balancea.
   */
  chunkify(a, n, balanced) {
    if (n < 2) {
      return [a];
    }

    const len = a.length;
    const out = [];
    let i = 0;
    let size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    } else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    } else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0) {
          size--;
        }
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));
    }
    return out;
  }

  private arrayMin(arr) {
    return arr.reduce(function (p, v) {
      return ( p < v ? p : v );
    });
  }

  private arrayMax(arr) {
    return arr.reduce(function (p, v) {
      return ( p > v ? p : v );
    });
  }


  changeTab(event: MatTabChangeEvent) {
    if (event.index === 1 && !this.isLoaded) {
      this.isLoaded = true;
      this.buildMap();
    }
  }

  goParent() {
    this.router.navigate(['home/rutas/dashboard']);
  }

  changeState(state: string, e) {
    this.isChange = true;
    if (e) {
      this.isChange = false;
      switch (state) {
        case 'aprobada':
          this.toggleAprobar = true;
          this.toggleRevisar = false;
          this.toggleRechazar = false;
          break;
        case 'revisada':
            this.toggleAprobar = false;
            this.toggleRevisar = true;
            this.toggleRechazar = false;
            break;
        case 'rechazada':
            this.toggleAprobar = false;
            this.toggleRevisar = false;
            this.toggleRechazar = true;
            break;
        default:
          break;
      }
    }
  }

  guardar() {
    this.ruta.subpuntos = [];
    for (let index = 0; index < this.subpuntos.length; index++) {
      this.ruta.subpuntos.push(this.subpuntos[index]._id.toString());
    }

    if (this.toggleAprobar) {
      this.ruta.estado = 'aprobada';
    }

    if (this.toggleRevisar) {
      this.ruta.estado = 'revisada';
    }

    if (this.toggleRechazar) {
      this.ruta.estado = 'rechazada';
    }

    this.ruta.velocidad_promedio = this.velocidadPromedio.toString();

    this.openDialog(this.ruta._id.toString());
  }

  openDialog(id: string): void {
    const dialogRef = this.dialog.open(DialogGuardarRutaDetalleComponent, {
      width: '350px',
      data: {
        ruta: this.ruta,
        id: id,
        borrar: this.borrarSubpuntos
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialogo GUARDAR-RUTA-DETALLES cerrado');
      this.router.navigate(['home/rutas/dashboard']);
    });
  }
}



@Component({
  selector: 'app-dialog-guardar-ruta-detalle',
  templateUrl: './dialogo-guardar/dialogo-guardar-ruta.html',
  styleUrls: ['./dialogo-guardar/dialogo-guardar-ruta.component.css']
})
export class DialogGuardarRutaDetalleComponent implements OnInit {

  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';
  action = 'Guardar';
  userId: string;
  ruta: Ruta;

  constructor(
    public dialogRef: MatDialogRef<DialogGuardarRutaDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private rutaService: RutaService,
    private subpuntoService: SubpuntoService,
    private userService: UserService) {
  }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  ngOnInit(): void {
    this.ruta = this.data.ruta;
  }

  async submit() {
    delete this.ruta._id;
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    let eliminar = false;
    if (!this.isEmpty(this.data.borrar)) {
      try {
        await this.eliminarSubpuntos();
        eliminar = true;
      } catch (e) {
        console.log(e);
        eliminar = false;
        this.isVisible = false;
        this.isIncorrect = true;
        this.message = 'Datos de ruta inconsistentes. Avise al admistrador.';
        this.isDisabled = false;
      }
    } else {
      eliminar = true;
    }

    try {
      await this.delRutaPendiente(this.ruta.conductor_id.toString(), this.data.id);
      eliminar = true;
    } catch (e) {
      console.log(e);
    }

    if (eliminar) {
      this.rutaService.actualizar(this.data.id, this.ruta).pipe(first()).subscribe(
        response => {
          this.isVisible = false;
          this.isCorrect = true;
          this.isDisabled = false;
          this.message = response._id;
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

  async eliminarSubpuntos () {
    let obj;
    for (let index = 0; index < this.data.borrar.length; index++) {
      obj = this.data.borrar[index];
      try {
        await this.delete(obj._id);
      } catch (e) {
        console.log(e);
        break;
      }
    }
  }

  async delete(id: string) {
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

  async delRutaPendiente(usuarioId: string, rutaId: string) {
    const obj = {
      'id': rutaId
    };
    try {
      await this.userService.delRutaPendiente(usuarioId, obj).pipe(first()).toPromise();
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

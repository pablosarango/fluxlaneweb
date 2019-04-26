import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import { map, startWith, first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { User, Ruta } from '../../../_models/';
import { UserService, RutaService } from '../../../_services';
import { Notification } from '../../../_helpers';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as mapboxgl from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';

export interface DialogData {
  ruta: Ruta;
  update: boolean;
  id: string;
  newUserId: string;
  oldUserId: string;
}

@Component({
  selector: 'app-crear-ruta',
  templateUrl: './crear-ruta.component.html',
  styleUrls: ['./crear-ruta.component.css']
})
export class CrearRutaComponent implements OnInit {
  static t;
  lastItemID = 'asistido';
  disabledBtn = true;
  bandera = true;
  updateRuta = false;
  coords = [];
  infoForm: FormGroup;
  finalData = [];
  rutaId;
  oldUserId: string;

  minDate = new Date();
  dateObj = new Date();
  myControl = new FormControl();

  users: User[] = [];
  ruta: Ruta;
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  mapa: mapboxgl;
  Draw: MapboxDraw;
  constructor(
    private userService: UserService,
    private rutaService: RutaService,
    private notification: Notification,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute) {
    this.minDate = new Date(this.dateObj.getFullYear(), this.dateObj.getUTCMonth(), this.dateObj.getDate());

    this.ruta = {
      _id: '',
      nombre: '',
      descripcion: '',
      estado: '',
      conductor_id: '',
      velocidad_promedio: '',
      fecha_hora: {
          creacion: new Date(),
          fecha_captura: new Date(),
          inicio_captura: '',
          fin_captura: ''
      },
      clima: '',
      int_captura: 1,
      referencias: [],
      subpuntos: []
    };
  }

  ngOnInit() {
    this.getConductores();
    this.infoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.min(10)]],
      fecha: [{value: new Date(), disabled: true}, [Validators.required]],
      hora: ['08:00', [Validators.required]],
      clima: ['', [Validators.required, Validators.minLength(5)]],
      intervalo: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      conductor: ['', [Validators.required, Validators.minLength(5)]]
    });


    document.getElementById('defaultOpen').click();

    this.filteredOptions = this.infoForm.controls.conductor.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.buildMap();

    this.rutaId = this.route.snapshot.params['id'];
    if (this.rutaId) {
      this.updateRuta = true;
      this.rutaService.getById(this.rutaId).pipe(first()).subscribe(
        ruta => {
          const fecha_hora = new Date(ruta.fecha_hora.fecha_captura.toString());
          const fecha = new Date(fecha_hora.getFullYear(), fecha_hora.getMonth(), fecha_hora.getDate());
          const hora = ( (fecha_hora.getHours() < 10 ? '0' : '') + fecha_hora.getHours())
          + ':' + ((fecha_hora.getMinutes() < 10 ? '0' : '') + fecha_hora.getMinutes());

          const referencias = ruta.referencias;
          let coordenadas = '';
          const obj = [];
          let temp;
          referencias.forEach((element) => {
            coordenadas = coordenadas + element.lng + ',' + element.lat + ';';
            temp = {
              name: element.nombre,
              coordinates: [ element.lng, element.lat]
            };

            obj.push(temp);
          });
          coordenadas = coordenadas.substring(0, coordenadas.length - 1);

          this.infoForm.patchValue({
            nombre: ruta.nombre,
            descripcion: ruta.descripcion,
            fecha: fecha,
            hora: hora,
            clima: ruta.clima,
            intervalo: ruta.int_captura
          });

          this.oldUserId = ruta.conductor_id.toString();

          referencias.forEach((element) => {
            this.coords.push([element.lng, element.lat]);
          });

          this.getMatch(coordenadas);
          this.finalData = obj;
          this.ruta.subpuntos = ruta.subpuntos;
          this.ruta.velocidad_promedio = ruta.velocidad_promedio;
          this.ruta.estado = ruta.estado;
          this.ruta.fecha_hora.inicio_captura = ruta.fecha_hora.inicio_captura;
          this.ruta.fecha_hora.fin_captura = ruta.fecha_hora.fin_captura;
          console.log('Update ruta' + this.ruta.int_captura);
        },
        err => {
            console.log(err);
        }
      );
    }
  }

  getConductores () {
    this.userService.getByRol('conductor').pipe(first()).subscribe(
      users => {
        this.users = users;
        for (const a of this.users) {
          this.options.push(a.displayName.toString());
        }
      },
      err => {
          console.log(err);
      }
    );
  }
  // convenience getter for easy access to form fields
  get f() { return this.infoForm.controls; }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  goParent() {
    // this.router.navigate(['../../editor'], {relativeTo: this.route});
    this.router.navigate(['home/editor']);
  }

  openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';

    if (tabName === 'mapa') {
      this.mapa.resize();
    }
  }

  private buildMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGFibG9zYXJhbmdvIiwiYSI6ImNqZmJ0ejZmbDE2dGMycW9idnlzdTEwYzYifQ.2biyau1-6T0nL1LFWHCF2w';
      this.mapa = new mapboxgl.Map({
        container: 'map',
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

    this.mapa.on('draw.create', () => {
      this.updateRoute();

    });
    this.mapa.on('draw.update', () => {
      this.updateRoute();
    });
    this.mapa.on('draw.delete', () => {
      this.removeRoute();
      this.coords = [];
      this.finalData = [];
      if (this.lastItemID === 'manual') {
        this.updateRoute();
      }
      if (this.isEmpty(this.coords) || this.coords.length <= 1) {
        this.disabledBtn = true;
      }
    });
  }

  private updateRoute() {
    this.removeRoute();
    const data = this.Draw.getAll();
    const lastFeature = data.features.length - 1;
    let newCoords;
    let obj;
    this.coords = [];
    this.finalData = [];
    if (this.lastItemID === 'asistido') {
      this.coords = data.features[lastFeature].geometry.coordinates;
      this.coords.forEach((item, index) => {
        obj = {
          name: 'Punto ' + index,
          coordinates: item
        };
        this.finalData.push(obj);
      });
      newCoords = this.coords.join(';');
    } else {
      data.features.forEach((item, index) => {
        this.coords.push(item.geometry.coordinates);
        obj = {
          name: 'Punto ' + index,
          coordinates: item.geometry.coordinates
        };
        this.finalData.push(obj);
      });
      newCoords = this.coords.join(';');
    }
    if (this.coords.length > 1) {
      this.getMatch(newCoords);
      this.disabledBtn = false;
    }
  }

  getMatch(e) {
    // https://www.mapbox.com/api-documentation/#directions
    const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
    e + '?geometries=geojson&steps=true&&access_token=' + mapboxgl.accessToken;
    const req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = () => {
      const jsonResponse = req.response;
      const distance = jsonResponse.routes[0].distance * 0.001; // convert to km
      const duration = jsonResponse.routes[0].duration / 60; // convert to minutes
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

  public removeRoute () {
    if (this.mapa.getSource('route')) {
      this.mapa.removeLayer('routearrows');
      this.mapa.removeLayer('route');
      this.mapa.removeSource('route');
    } else  {
      return;
    }
  }

  public resizeMap() {
    this.mapa.resize();
  }

  selected(id: string) {
    document.getElementById(this.lastItemID).classList.remove('control-btn-selected');
    document.getElementById(id).classList.add('control-btn-selected');
    this.lastItemID = id;

    if (id === 'asistido') {
      this.lineControl();
      this.bandera = false;
    } else {
      this.pointControl();
      this.bandera = false;
    }
  }

  private pointControl() {
    if (this.bandera === false) {
      this.removeRoute();
      this.mapa.removeControl(this.Draw);
      this.coords = [];
      this.finalData = [];
      this.disabledBtn = true;
    }
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        trash: true
      },
      styles: [
        {
          'id': 'highlight-active-points',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'true']],
          'paint': {
            'circle-radius': 9,
            'circle-color': '#D81B60'
          }
        },
        {
          'id': 'points-are-blue',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'false']],
          'paint': {
            'circle-radius': 7,
            'circle-color': '#FFA000'
          }
        }
      ]
    });

    this.mapa.addControl(this.Draw, 'top-right');
  }

  private lineControl() {
    if (this.bandera === false) {
      this.removeRoute();
      this.mapa.removeControl(this.Draw);
      this.coords = [];
      this.finalData = [];
      this.disabledBtn = true;
    }
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      styles: [
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#D81B60',
            'line-dasharray': [0.2, 2],
            'line-width': 4,
            'line-opacity': 0.7
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-halo-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          'paint': {
            'circle-radius': 10,
            'circle-color': '#FFF'
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          'paint': {
            'circle-radius': 6,
            'circle-color': '#D81B60',
          }
        }
      ]
    });

    this.mapa.addControl(this.Draw, 'top-right');
  }

  guardar() {
    const elementos = document.getElementsByClassName('point-label');
    for (let i = 0; i < elementos.length; i++) {
      const label = elementos[i].textContent;
      this.finalData[i].name = label;
    }

    this.notification.snackbarSucces('Datos guardados');
  }

  submit() {

    if (this.infoForm.invalid || this.isEmpty(this.finalData)) {
      this.notification.snackbarError('Datos incompletos');
    } else {

      this.setRuta();

      this.openDialog();

    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogGuardarRutaComponent, {
      width: '350px',
      data: {
        ruta: this.ruta,
        update: this.updateRuta,
        id: this.rutaId,
        newUserId: this.ruta.conductor_id,
        oldUserId: this.oldUserId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        this.router.navigate(['home/editor']);
      }
    });
  }


  private setRuta() {
    const fecha = this.infoForm.get('fecha').value.toLocaleDateString().split('/');
      const hora = this.infoForm.value.hora.split(':');
      const coordenadas = [];
      for (const c of this.finalData) {
        coordenadas.push([c.coordinates[1], c.coordinates[0]]);
      }
      const conduc = this.f.conductor.value.split(' | ');
      let conduc_id: String = '';
      this.users.forEach((item, index) => {
        if (item.displayName === conduc[0]) {
          conduc_id = item._id;
        }
      });

      this.ruta.nombre = this.f.nombre.value;
      this.ruta.descripcion = this.f.descripcion.value;
      this.ruta.conductor_id = conduc_id;
      this.ruta.fecha_hora.creacion = new Date();
      this.ruta.fecha_hora.fecha_captura = new Date(fecha[2], fecha[1] - 1, fecha[0], hora[0], hora[1]);
      this.ruta.clima = this.f.clima.value;
      this.ruta.int_captura = this.f.intervalo.value;

      this.ruta.referencias = [];
      let temp;
      coordenadas.forEach((item, index) => {
        temp = {
          nombre: this.finalData[index].name,
          lat: item[0],
          lng: item[1]
        };
        this.ruta.referencias.push(temp);
      });
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


@Component({
  selector: 'app-dialog-guardar-ruta',
  templateUrl: 'dialog-guardar-ruta.html',
  styleUrls: ['./dialog-guardar-ruta.component.css']
})
export class DialogGuardarRutaComponent implements OnInit {

  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';
  action = 'Guardar';
  userId: string;

  constructor(
    public dialogRef: MatDialogRef<DialogGuardarRutaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private rutaService: RutaService,
    private userService: UserService) {
    }

  close(satisfactorio: boolean): void {
    this.dialogRef.close(satisfactorio);
  }

  ngOnInit(): void {
    if (this.data.update) {
      this.action = 'Actualizar';
    }
  }

  submit() {
    delete this.data.ruta._id;
    delete this.data.ruta.estado;
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.rutaService.crearRuta(this.data.ruta).pipe(first()).subscribe(
      res => {
        try {
          this.updatePendingRoutes(this.data.newUserId, res._id);
          this.isVisible = false;
          this.isCorrect = true;
          this.isDisabled = false;
          this.message = res._id;
          this.isHidden = false;
        } catch (e) {
          console.log(e);
        }
        this.message = res._id;
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

  update() {
    delete this.data.ruta._id;
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.rutaService.actualizar(this.data.id, this.data.ruta).pipe(first()).subscribe(
      res => {
        this.changeDriver(this.data.oldUserId, this.data.newUserId, this.data.id);
        this.isVisible = false;
        this.isCorrect = true;
        this.isDisabled = false;
        this.message = res._id;
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

  async updatePendingRoutes (userId: string, rutaId: string) {
    let response: any;
    const array = [];
    array.push(rutaId);
    const obj = {
      'elemento' : array
    };
    try {
      response = await this.userService.updateRutasPendientes(userId, obj).pipe(first()).toPromise();
    } catch (e) {
      throw {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        error: new Error()
      };
    }
  }

  async changeDriver(oldUserId: string, newUserId: string, rutaId: string) {
    try {
      const obj = {
        'id': rutaId
      };
      await this.userService.delRutaPendiente(oldUserId, obj).pipe(first()).toPromise();
      await this.updatePendingRoutes(newUserId, rutaId);
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

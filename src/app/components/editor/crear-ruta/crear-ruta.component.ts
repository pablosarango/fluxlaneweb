import { Component, OnInit, Inject } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
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
  coords = [];
  infoForm: FormGroup;
  finalData = [];

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

    // this.ruta = new Ruta();
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

    /*
    ID Ruta A: 5bd267b61115633c9643faca
    ID Ruta B: 5bd768a60fa1e3579810a280
    ID RUTA X: 5bdfc4ee49a3d450210a2e10


    this.rutaService.getById('5b3255e95e521a02b4b3ddc1').pipe(first()).subscribe(
      ruta => {
        console.log(ruta);
        this.ruta = ruta;
        console.log('holii ' + this.ruta.estado);
      },
      err => {
          console.log(err);
      }
    );
    */


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
  }
  // convenience getter for easy access to form fields
  get f() { return this.infoForm.controls; }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  goParent() {
    this.router.navigate(['../../editor'], {relativeTo: this.route});
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

    this.mapa.on('load', () => {
      // ALL YOUR APPLICATION CODE
    });

    this.mapa.on('draw.create', () => {
      // console.log('create');
      this.updateRoute();

    });
    this.mapa.on('draw.update', () => {
      // console.log('update');
      this.updateRoute();
    });
    this.mapa.on('draw.delete', () => {
      // console.log('remove');
      this.removeRoute();
      this.coords = [];
      this.finalData = [];
      if (this.lastItemID === 'manual') {
        // console.log('remove Manual');
        this.updateRoute();
      }
      if (this.isEmpty(this.coords) || this.coords.length <= 1) {
        // console.log('vacio');
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

      // -79.19576045180118,-3.9862040301437105 => LONG-LAT

    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogGuardarRutaComponent, {
      width: '350px',
      data: {ruta: this.ruta},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      document.getElementById('defaultOpen').click();
      this.infoForm = this.formBuilder.group({
        nombre: ['', [Validators.required, Validators.minLength(5)]],
        descripcion: ['', [Validators.required, Validators.min(10)]],
        fecha: [{value: new Date(), disabled: true}, [Validators.required]],
        hora: ['08:00', [Validators.required]],
        clima: ['', [Validators.required, Validators.minLength(5)]],
        intervalo: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
        conductor: ['', [Validators.required, Validators.minLength(5)]]
      });
      this.finalData = [];
      this.coords = [];
      this.removeRoute();
    });
  }

  public openNotificacion() {
    this.notification.snackbarSucces('Hola');
  }

  private setRuta() {
    const fecha = this.infoForm.get('fecha').value.toLocaleDateString().split('/');
      const hora = this.infoForm.value.hora.split(':');
      const c_inicial = this.coords[0];
      const c_final = this.coords[this.coords.length - 1];
      const coordenadas = [];
      for (const c of this.coords) {
        coordenadas.push([c[1], c[0]]);
      }
      const conduc = this.f.conductor.value.split(' | ');
      let conduc_id: String = '';
      this.users.forEach((item, index) => {
        if (item.displayName === conduc[0] && conduc[1].toString() === index.toString()) {
          conduc_id = item._id;
        }
      });

      this.ruta.nombre = this.f.nombre.value;
      this.ruta.descripcion = this.f.descripcion.value;
      this.ruta.conductor_id = conduc_id;
      this.ruta.fecha_hora.creacion = new Date();
      this.ruta.fecha_hora.fecha_captura = new Date(fecha[2], fecha[1] - 1, fecha[0], hora[0], hora[1]);
      this.ruta.clima = this.f.clima.value;
      // this.ruta.configuracion.int_captura = this.f.intervalo.value;
      /*this.ruta.coordenadas.coor_inicial.lat_inicial = c_inicial[1];
      this.ruta.coordenadas.coor_inicial.long_inicial = c_inicial[0];
      this.ruta.coordenadas.coor_final.lat_final = c_final[1];
      this.ruta.coordenadas.coor_final.long_final = c_final[0];*/

      let temp;
      coordenadas.forEach((item, index) => {
        temp = {
          nombre: this.finalData[index].name,
          lat: item[0],
          lng: item[1]
        };
        // console.log(temp);
        this.ruta.referencias.push(temp);
      });

      console.log(this.ruta);
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
export class DialogGuardarRutaComponent {

  isVisible = false;
  isCorrect = false;
  isIncorrect = false;
  isDisabled = false;
  isHidden = true;
  message: String = '';

  constructor(
    public dialogRef: MatDialogRef<DialogGuardarRutaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private rutaService: RutaService) {}

  close(): void {
    this.dialogRef.close();
  }

  submit() {
    console.log(this.data.ruta);
    delete this.data.ruta._id;
    delete this.data.ruta.estado;
    console.log(this.data.ruta);
    this.resetControl();
    this.isDisabled = true;
    this.isVisible = true;
    this.rutaService.crearRuta(this.data.ruta).pipe(first()).subscribe(
      res => {
        console.log(res);
        setTimeout(() => {
          this.isVisible = false;
          this.isCorrect = true;
          this.isDisabled = false;
          this.message = res._id;
          this.isHidden = false;
        }, 5000);
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

  private resetControl() {
    this.isVisible = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.isDisabled = false;
    this.isHidden = true;
  }
}

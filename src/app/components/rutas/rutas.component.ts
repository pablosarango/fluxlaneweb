import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.css']
})
export class RutasComponent implements OnInit {

  constructor(
    private router: Router) {
  }

  ngOnInit() {
    this.goToDashboard();
  }


  goToDashboard() {
    this.router.navigate(['/home/rutas/dashboard']);
  }

  goToDetalles(id: string) {
    this.router.navigate(['/home/rutas/detalles', id]);
  }

}

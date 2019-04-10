import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// ************ FlyCar Components ************
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponentComponent } from './components/page-not-found-component/page-not-found-component.component';
import { HomeComponent } from './components/home/home.component';
import { RutasComponent } from './components/rutas/rutas.component';
import { EditorComponent } from './components/editor/editor.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';


/**
 * Editor Components
 */
import { CrearRutaComponent } from './components/editor/crear-ruta/crear-ruta.component';
import { InicioComponent } from './components/editor/inicio/inicio.component';







// Auth
import { AuthGuard } from './_guards';



const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'rutas', pathMatch: 'full'},
      {path: 'rutas', component: RutasComponent},
      {path: 'editor', component: EditorComponent,
        children: [
          {path: 'crear', component: CrearRutaComponent},
          {path: 'inicio', component: InicioComponent}
        ]
      },
      {path: 'usuarios', component: UsuariosComponent}
    ]
  },
  {path: '**', component: PageNotFoundComponentComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

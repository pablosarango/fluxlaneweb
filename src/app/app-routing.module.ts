import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// ************ FluxLane Components ************
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponentComponent } from './components/page-not-found-component/page-not-found-component.component';
import { HomeComponent } from './components/home/home.component';
import { RutasComponent } from './components/rutas/rutas.component';
import { EditorComponent } from './components/editor/editor.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { AyudaComponent } from './components/ayuda/ayuda.component';

/**
 * Editor Components
 */
import { CrearRutaComponent } from './components/editor/crear-ruta/crear-ruta.component';
import { InicioComponent } from './components/editor/inicio/inicio.component';

/**
 * Rutas Components
 */
import { DashboardComponent } from './components/rutas/dashboard/dashboard.component';
import { DetallesComponent } from './components/rutas/detalles/detalles.component';

/**
 * Usuarios Components
 */
import { UserDashboardComponent } from './components/usuarios/user-dashboard/user-dashboard.component';
import { CrearUsuarioComponent } from './components/usuarios/crear-usuario/crear-usuario.component';

// Auth
import { AuthGuard } from './_guards';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'rutas', pathMatch: 'full'},
      {path: 'rutas', component: RutasComponent,
        children: [
          {path: 'dashboard', component: DashboardComponent},
          {path: 'detalles/:id', component: DetallesComponent}
      ]},
      {path: 'editor', component: EditorComponent,
        children: [
          {path: 'crear', component: CrearRutaComponent},
          {path: 'crear/:id', component: CrearRutaComponent},
          {path: 'inicio', component: InicioComponent}
        ]
      },
      {path: 'usuarios', component: UsuariosComponent,
        children: [
          {path: 'dashboard', component: UserDashboardComponent},
          {path: 'crear', component: CrearUsuarioComponent},
          {path: 'editar/:id', component: CrearUsuarioComponent}
        ]
      },
      {path: 'ayuda', component: AyudaComponent}
    ]
  },
  {path: '**', component: PageNotFoundComponentComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

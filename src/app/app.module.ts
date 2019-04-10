import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './/app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';


/**
 * Animaciones de Angular Animation
 */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material';
import { MAT_DATE_LOCALE } from '@angular/material/core';

// Pipes
import { SafeHtmlPipe } from './_pipe/safe-html-pipe';




// components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponentComponent } from './components/page-not-found-component/page-not-found-component.component';
import { HomeComponent } from './components/home/home.component';
import { RutasComponent } from './components/rutas/rutas.component';
import { EditorComponent } from './components/editor/editor.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { CrearRutaComponent, DialogGuardarRutaComponent } from './components/editor/crear-ruta/crear-ruta.component';
import { InicioComponent } from './components/editor/inicio/inicio.component';

// _helpers
import { ErrorInterceptor } from './_helpers';
import { JwtInterceptor } from './_helpers';

/**
 * DateTime Picker
 */
export const MY_NATIVE_FORMATS = {
  fullPickerInput: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'},
  datePickerInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
  timePickerInput: {hour: 'numeric', minute: 'numeric'},
  monthYearLabel: {year: 'numeric', month: 'short'},
  dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
  monthYearA11yLabel: {year: 'numeric', month: 'long'},
};


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponentComponent,
    HomeComponent,
    RutasComponent,
    EditorComponent,
    UsuariosComponent,
    CrearRutaComponent,
    SafeHtmlPipe,
    DialogGuardarRutaComponent,
    InicioComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  entryComponents: [CrearRutaComponent, DialogGuardarRutaComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS},
    // { provide: OWL_DATE_TIME_LOCALE, useValue: 'es-EC'},
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' }// MATERIAL DATE PICKER
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

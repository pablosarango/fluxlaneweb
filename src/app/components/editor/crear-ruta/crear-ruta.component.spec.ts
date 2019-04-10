import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRutaComponent } from './crear-ruta.component';

describe('CrearRutaComponent', () => {
  let component: CrearRutaComponent;
  let fixture: ComponentFixture<CrearRutaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearRutaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearRutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

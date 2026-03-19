import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ArgillaComponent } from './argilla.component';

describe('ArgillaComponent', () => {
  let component: ArgillaComponent;
  let fixture: ComponentFixture<ArgillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArgillaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArgillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filtro signal to "todos"', () => {
    expect(component.filtro()).toBe('todos');
  });

  it('should have a secciones array with methodology content', () => {
    expect(component.secciones).toBeDefined();
    expect(Array.isArray(component.secciones)).toBeTrue();
    expect(component.secciones.length).toBeGreaterThan(0);
  });

  it('should return all sections when filtro is "todos"', () => {
    component.filtro.set('todos');
    fixture.detectChanges();
    expect(component.seccionesFiltradas().length).toBe(component.secciones.length);
  });

  it('should filter sections by category when filtro is set', () => {
    component.filtro.set('concepto');
    fixture.detectChanges();
    const filtered = component.seccionesFiltradas();
    filtered.forEach((sec: any) => {
      expect(sec.categoria).toBe('concepto');
    });
  });

  it('should open modal when abrirModal is called and close it with cerrarModal', () => {
    expect(component.modalSeccion()).toBeNull();
    const firstSeccion = component.secciones[0];
    component.abrirModal(firstSeccion);
    expect(component.modalSeccion()).toEqual(firstSeccion);
    component.cerrarModal();
    expect(component.modalSeccion()).toBeNull();
  });
});

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { InformeComponent } from './informe.component';
import { ReportService } from '../../core/services/report.service';

describe('InformeComponent', () => {
  let component: InformeComponent;
  let fixture: ComponentFixture<InformeComponent>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;

  const mockReport = {
    metadata: {
      titulo: 'Análisis de Sentimientos en Reseñas de Películas IMDb',
      subtitulo: 'Comparación de clasificadores ML con TF-IDF',
      autor: 'Samael Hernández',
      fecha: 'Marzo 2026',
      programa: 'Master en IA',
      universidad: 'UNIR',
      asignatura: 'PLN',
      actividad: 'Actividad 2',
    },
    blocks: {
      definiciones: { titulo: 'Definiciones y Contexto', contenido: '<p>Contenido de definiciones</p>' },
      metodologia: { titulo: 'Metodología', contenido: '<p>Contenido de metodología</p>' },
    },
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReportService', ['getContent']);
    spy.getContent.and.returnValue(of(mockReport));

    await TestBed.configureTestingModule({
      imports: [InformeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ReportService, useValue: spy },
      ],
    }).compileComponents();

    reportServiceSpy = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    fixture = TestBed.createComponent(InformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load report data and set loading to false', () => {
    expect(component.loading()).toBeFalse();
    expect(component.report()).toBeTruthy();
  });

  it('should populate blockEntries from report blocks', () => {
    expect(component.blockEntries().length).toBe(2);
  });

  it('should have seccionesInfo array with section metadata', () => {
    expect(component.seccionesInfo).toBeDefined();
    expect(Array.isArray(component.seccionesInfo)).toBeTrue();
    expect(component.seccionesInfo.length).toBeGreaterThan(0);
  });

  it('should open modal when abrirModal is called', () => {
    expect(component.modalSection()).toBeNull();
    component.abrirModal(0);
    expect(component.modalSection()).toBe(0);
  });

  it('should close modal when cerrarModal is called', () => {
    component.abrirModal(0);
    component.cerrarModal();
    expect(component.modalSection()).toBeNull();
  });
});

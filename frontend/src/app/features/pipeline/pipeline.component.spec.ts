import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PipelineComponent } from './pipeline.component';

describe('PipelineComponent', () => {
  let component: PipelineComponent;
  let fixture: ComponentFixture<PipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a steps array with pipeline stages', () => {
    expect(component.steps).toBeDefined();
    expect(Array.isArray(component.steps)).toBeTrue();
    expect(component.steps.length).toBeGreaterThan(0);
  });

  it('should initialize modalStep signal as null (no modal open)', () => {
    expect(component.modalStep()).toBeNull();
  });

  it('should open modal when abrirModal is called with a valid index', () => {
    component.abrirModal(0);
    expect(component.modalStep()).toBe(0);
  });

  it('should close modal when cerrarModal is called', () => {
    component.abrirModal(0);
    component.cerrarModal();
    expect(component.modalStep()).toBeNull();
  });

  it('should render the Pipeline NLP page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Pipeline NLP');
  });
});

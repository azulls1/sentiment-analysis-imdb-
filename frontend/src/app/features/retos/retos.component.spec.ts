import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RetosComponent } from './retos.component';

describe('RetosComponent', () => {
  let component: RetosComponent;
  let fixture: ComponentFixture<RetosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RetosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a retos array with challenge cards', () => {
    expect(component.retos).toBeDefined();
    expect(Array.isArray(component.retos)).toBeTrue();
    expect(component.retos.length).toBeGreaterThan(0);
  });

  it('should initialize modalReto signal as null', () => {
    expect(component.modalReto()).toBeNull();
  });

  it('should open modal when abrirModal is called', () => {
    const firstReto = component.retos[0];
    component.abrirModal(firstReto);
    expect(component.modalReto()).toBeTruthy();
    expect(component.modalReto()).toEqual(firstReto);
  });

  it('should close modal when cerrarModal is called', () => {
    component.abrirModal(component.retos[0]);
    component.cerrarModal();
    expect(component.modalReto()).toBeNull();
  });

  it('should render the Retos page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Retos');
  });
});

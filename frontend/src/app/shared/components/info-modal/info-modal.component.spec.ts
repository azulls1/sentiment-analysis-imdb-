import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { InfoModalComponent, ModalData } from './info-modal.component';

describe('InfoModalComponent', () => {
  let component: InfoModalComponent;
  let fixture: ComponentFixture<InfoModalComponent>;

  const mockData: ModalData = {
    title: 'Test Modal',
    value: '89.68%',
    description: 'Test description for the modal.',
    details: [
      { label: 'Label 1', value: 'Value 1' },
      { label: 'Label 2', value: 'Value 2' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal overlay when visible is false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should render modal overlay when visible is true and data is provided', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should emit closed event when close() is called', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    component.close();
    expect(emitted).toBeTrue();
  });

  it('should emit closed event when Escape key is pressed via onEscape()', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    component.onEscape();
    expect(emitted).toBeTrue();
  });

  it('should display modal title and value when visible', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Modal');
    expect(compiled.textContent).toContain('89.68%');
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();
    });

    it('should have aria-modal attribute when visible', () => {
      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-labelledby pointing to modal-title', () => {
      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    });

    it('should have aria-describedby pointing to modal-description', () => {
      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog.getAttribute('aria-describedby')).toBe('modal-description');
    });

    it('should have close button with aria-label', () => {
      const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Cerrar"]');
      expect(closeBtn).toBeTruthy();
    });

    it('should have aria-hidden on decorative close SVG icon', () => {
      const svg = fixture.nativeElement.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeTruthy();
    });
  });
});

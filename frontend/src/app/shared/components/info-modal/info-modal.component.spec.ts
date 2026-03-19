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
    component.visible = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // The overlay div only renders when visible is true
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should render modal overlay when visible is true and data is provided', () => {
    component.visible = true;
    component.data = mockData;
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
    component.visible = true;
    component.data = mockData;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Modal');
    expect(compiled.textContent).toContain('89.68%');
  });
});

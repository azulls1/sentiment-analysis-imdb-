import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a menuToggle EventEmitter output', () => {
    expect(component.menuToggle).toBeDefined();
  });

  it('should emit menuToggle when the menu button is clicked', () => {
    let emitted = false;
    component.menuToggle.subscribe(() => (emitted = true));

    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('button.menu-toggle') as HTMLButtonElement;
    expect(menuButton).toBeTruthy();
    menuButton.click();
    expect(emitted).toBeTrue();
  });

  it('should render the branding text "PLN — UNIR"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PLN — UNIR');
  });

  it('should render the header element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')).toBeTruthy();
  });
});

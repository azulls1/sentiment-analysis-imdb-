import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have sidebarOpen signal initialized to false', () => {
    expect(component.sidebarOpen()).toBeFalse();
  });

  it('should toggle sidebarOpen signal', () => {
    expect(component.sidebarOpen()).toBeFalse();
    component.sidebarOpen.set(true);
    expect(component.sidebarOpen()).toBeTrue();
    component.sidebarOpen.set(false);
    expect(component.sidebarOpen()).toBeFalse();
  });

  it('should render router-outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

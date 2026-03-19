import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a navItems array with navigation links', () => {
    expect(component.navItems).toBeDefined();
    expect(Array.isArray(component.navItems)).toBeTrue();
    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('should include a Dashboard navigation item', () => {
    const dashboardItem = component.navItems.find(item => item.path === '/dashboard');
    expect(dashboardItem).toBeTruthy();
    expect(dashboardItem?.label).toBe('Dashboard');
  });

  it('should render navigation links in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a.sidebar-link');
    expect(links.length).toBe(component.navItems.length);
  });

  it('should have 9 navigation items covering all routes', () => {
    expect(component.navItems.length).toBe(9);
  });
});

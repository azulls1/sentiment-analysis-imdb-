import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EntregablesComponent } from './entregables.component';
import { ExportService } from '../../core/services/export.service';

describe('EntregablesComponent', () => {
  let component: EntregablesComponent;
  let fixture: ComponentFixture<EntregablesComponent>;
  let exportServiceSpy: jasmine.SpyObj<ExportService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ExportService', [
      'downloadPdf',
      'downloadNotebook',
      'downloadZip',
    ]);

    await TestBed.configureTestingModule({
      imports: [EntregablesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ExportService, useValue: spy },
      ],
    }).compileComponents();

    exportServiceSpy = TestBed.inject(ExportService) as jasmine.SpyObj<ExportService>;
    fixture = TestBed.createComponent(EntregablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a checklist signal with items', () => {
    expect(component.checklist).toBeDefined();
    expect(component.checklist().length).toBeGreaterThan(0);
  });

  it('should toggle a checklist item when toggleItem is called', () => {
    const firstItem = component.checklist()[0];
    const initialState = firstItem.checked;
    component.toggleItem(firstItem.id);
    expect(component.checklist()[0].checked).toBe(!initialState);
  });

  it('should call exportService.downloadZip when downloadClick is called with "zip"', () => {
    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');
    component.downloadClick(mockEvent, 'zip');
    expect(exportServiceSpy.downloadZip).toHaveBeenCalledTimes(1);
  });

  it('should call exportService.downloadPdf when downloadClick is called with "pdf"', () => {
    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');
    component.downloadClick(mockEvent, 'pdf');
    expect(exportServiceSpy.downloadPdf).toHaveBeenCalledTimes(1);
  });

  it('should render the Entregables page heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Entregables');
  });
});

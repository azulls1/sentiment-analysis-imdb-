import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafeHtmlPipe],
    });
    pipe = TestBed.inject(SafeHtmlPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for null-ish input', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });

  it('should return SafeHtml for valid HTML input', () => {
    const result = pipe.transform('<p>Hello</p>');
    expect(result).toBeTruthy();
    // SafeHtml should not be a plain string
    expect(typeof result).not.toBe('string');
  });
});

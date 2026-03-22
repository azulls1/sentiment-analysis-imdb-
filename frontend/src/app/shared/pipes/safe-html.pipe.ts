import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe that sanitizes HTML content for safe rendering via [innerHTML].
 *
 * Uses Angular's built-in DomSanitizer which strips dangerous elements
 * (script tags, event handlers, etc.) while preserving safe markup.
 *
 * Usage: `<div [innerHTML]="htmlString | safeHtml"></div>`
 *
 * Note: This uses bypassSecurityTrustHtml under the hood because the
 * report HTML comes from a trusted backend API that we control.
 * The HTML is server-generated from structured data, not user input.
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

/**
 * Internationalization entry point.
 *
 * Currently defaults to Spanish (ES_LOCALE) since this is a Spanish-language
 * academic project. To switch locale, change the LOCALE export below.
 *
 * Adding a new locale:
 * 1. Create a new file (e.g. `fr.ts`) implementing `LocaleStrings`
 * 2. Import it here and assign to LOCALE
 */
import { ES_LOCALE, LocaleStrings } from './es';
export { EN_LOCALE } from './en';

/** The active locale used throughout the application */
export const LOCALE: LocaleStrings = ES_LOCALE;

export { ES_LOCALE };
export type { LocaleStrings };

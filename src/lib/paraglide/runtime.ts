export type Locale = string;

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
        currentLocale = locale;
        if (typeof document !== 'undefined') {
                document.documentElement.lang = locale;
        }
        return locale;
}

export function getLocale(): Locale {
        return currentLocale;
}

export function trackMessageCall(_key: string, _locale?: string): void {
        // Stubbed telemetry hook for generated paraglide messages
}

export const experimentalMiddlewareLocaleSplitting = false;

export const isServer = typeof window === 'undefined';

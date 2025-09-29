import { describe, expect, it } from 'vitest';
import { formatCurrency, formatInt } from './format';

describe('format helpers', () => {
	describe('formatCurrency', () => {
		it('formats positive numbers with currency symbol', () => {
			expect(formatCurrency(1234.56)).toBe('$1,234.56');
		});

		it('guards against nullish values', () => {
			expect(formatCurrency(null)).toBe('$0.00');
			expect(formatCurrency(undefined)).toBe('$0.00');
		});

		it('falls back to zero on invalid numbers', () => {
			expect(formatCurrency(Number.NaN)).toBe('$0.00');
		});
	});

	describe('formatInt', () => {
		it('formats integers with group separators', () => {
			expect(formatInt(1234567)).toBe('1,234,567');
		});

		it('handles negative numbers', () => {
			expect(formatInt(-3200)).toBe('-3,200');
		});

		it('guards against nullish values', () => {
			expect(formatInt(null)).toBe('0');
			expect(formatInt(undefined)).toBe('0');
		});
	});
});

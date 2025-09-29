export function formatCurrency(
	value: number | null | undefined,
	currency = 'USD',
	locale = 'en-US'
): string {
	const numericValue = normalizeNumber(value);
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	});
	return formatter.format(numericValue);
}

export function formatInt(value: number | null | undefined, locale = 'en-US'): string {
	const numericValue = normalizeNumber(value);
	const formatter = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 0
	});
	return formatter.format(numericValue);
}

function normalizeNumber(value: number | null | undefined): number {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (value === null || value === undefined) {
		return 0;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

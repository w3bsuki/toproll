/**
 * Lightweight structured logger with correlation IDs.
 * Emits newline-delimited JSON (NDJSON) via console.* so logs are easy to ship/parse.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
	level: LogLevel;
	msg: string;
	timestamp: string;
	requestId?: string;
	userId?: string;
	route?: string;
	durationMs?: number;
	// Arbitrary extra metadata (will be JSON.stringified)
	meta?: Record<string, unknown> | undefined;
	// Optional error shape
	error?: {
		message: string;
		stack?: string;
		name?: string;
	};
}

export interface Logger {
	debug: (msg: string, meta?: Record<string, unknown>) => void;
	info: (msg: string, meta?: Record<string, unknown>) => void;
	warn: (msg: string, meta?: Record<string, unknown>) => void;
	error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => void;
}

export function createLogger(
	ctx: {
		requestId?: string;
		userId?: string;
		route?: string;
	} = {}
): Logger {
	const base = {
		requestId: ctx.requestId,
		userId: ctx.userId,
		route: ctx.route
	} satisfies Partial<LogEvent>;

	const emit = (event: LogEvent) => {
		// Map level to appropriate console method but always output a single JSON line
		const line = JSON.stringify(event);
		switch (event.level) {
			case 'debug':
				console.log(line);
				break;
			case 'info':
				console.info(line);
				break;
			case 'warn':
				console.warn(line);
				break;
			case 'error':
				console.error(line);
				break;
		}
	};

	const nowIso = () => new Date().toISOString();

	const build = (
		level: LogLevel,
		msg: string,
		meta?: Record<string, unknown>,
		err?: unknown
	): LogEvent => {
		const ev: LogEvent = {
			level,
			msg,
			timestamp: nowIso(),
			...base,
			meta
		};
		if (err) {
			if (err instanceof Error) {
				ev.error = { message: err.message, stack: err.stack, name: err.name };
			} else if (typeof err === 'string') {
				ev.error = { message: err };
			} else {
				ev.error = { message: 'Unknown error', stack: JSON.stringify(err) };
			}
		}
		return ev;
	};

	return {
		debug: (msg, meta) => emit(build('debug', msg, meta)),
		info: (msg, meta) => emit(build('info', msg, meta)),
		warn: (msg, meta) => emit(build('warn', msg, meta)),
		error: (msg, err, meta) => emit(build('error', msg, meta, err))
	};
}

/**
 * Utility to measure a duration and log start/finish around an async function.
 */
export async function withTiming<T>(
	logger: Logger,
	msg: string,
	fn: () => Promise<T>,
	meta?: Record<string, unknown>
): Promise<T> {
	const start = performance.now();
	logger.info(`${msg}:start`, meta);
	try {
		const result = await fn();
		const durationMs = Math.round(performance.now() - start);
		logger.info(`${msg}:finish`, { ...(meta || {}), durationMs });
		return result;
	} catch (err) {
		const durationMs = Math.round(performance.now() - start);
		logger.error(`${msg}:error`, err, { ...(meta || {}), durationMs });
		throw err;
	}
}

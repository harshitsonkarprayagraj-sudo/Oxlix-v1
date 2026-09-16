// Centralized error handling + retry logic for Supabase calls.

export interface AppError {
  message: string;
  code?: string;
  isNetworkError: boolean;
  isAuthError: boolean;
}

export function parseError(err: unknown): AppError {
  if (!err) return { message: 'Unknown error', isNetworkError: false, isAuthError: false };

  const raw = err as { message?: string; code?: string };
  const message = raw.message ?? 'Something went wrong';
  const code = raw.code;
  const lower = message.toLowerCase();

  // "Load failed" is a WebKit/Safari error that occurs when a fetch request
  // fails at the network level (DNS resolution, connection refused, CORS, etc.)
  const isNetworkError =
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('timeout') ||
    lower.includes('load failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('err_connection') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused');

  const isAuthError =
    code === 'invalid_credentials' ||
    code === 'invalid_email' ||
    code === 'invalid_password' ||
    lower.includes('session expired') ||
    lower.includes('not authenticated') ||
    lower.includes('jwt') ||
    lower.includes('invalid login credentials');

  return { message, code, isNetworkError, isAuthError };
}

export function isRetryable(err: unknown): boolean {
  const parsed = parseError(err);
  return parsed.isNetworkError;
}

export async function withRetry<T>(
  fn: () => PromiseLike<T>,
  maxAttempts = 3,
  baseDelayMs = 600
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === maxAttempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

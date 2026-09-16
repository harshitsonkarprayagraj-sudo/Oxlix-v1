// Lightweight haptic feedback wrapper. Uses the Vibration API where available
// (Android/Chromium) and is a safe no-op on iOS Safari and unsupported browsers.

type Pattern = 'light' | 'medium' | 'heavy' | 'tick' | 'success' | 'warning';

const patterns: Record<Pattern, number | number[]> = {
  light: 10,
  medium: 18,
  heavy: 28,
  tick: 8,
  success: [10, 40, 20],
  warning: [20, 60, 20],
};

export function haptic(pattern: Pattern = 'light') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(patterns[pattern]);
    }
  } catch {
    // no-op — haptics are a progressive enhancement
  }
}

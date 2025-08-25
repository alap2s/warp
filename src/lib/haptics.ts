/**
 * Triggers haptic feedback on supported devices.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 * @param pattern A number for a simple vibration duration (ms) or an array for a pattern.
 */
export const triggerHapticFeedback = (pattern: number | number[] = 50): void => {
  if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
    try {
      window.navigator.vibrate(pattern);
    } catch (e) {
      console.log("Haptic feedback not supported or failed.", e);
    }
  }
};

import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

// A short message near the bottom of the screen, like the website's toasts
// ("Posted successfully.", "You were logged out."). One at a time: a new one
// replaces whatever is showing. ToastHost (in the root layout) draws it.
export type Toast = {
  // Names the message, like the website's toast ids.
  id: string;
  title: string;
  message?: string;
  // A link under the message, e.g. "Log in". Tapping it also closes the toast.
  action?: { title: string; onPress: () => void };
  // How long it stays, in ms (the website's default is 4 seconds).
  duration?: number;
};

let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function showToast(toast: Toast) {
  clearTimeout(timer);
  current = toast;
  emit();
  AccessibilityInfo.announceForAccessibility([toast.title, toast.message].filter(Boolean).join(' '));
  timer = setTimeout(hideToast, toast.duration ?? 4000);
}

export function hideToast() {
  clearTimeout(timer);
  current = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useToast(): Toast | null {
  return useSyncExternalStore(subscribe, () => current);
}

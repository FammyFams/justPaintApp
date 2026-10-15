import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api } from '@/lib/api';
import { Notifications } from '@/lib/notifications-module';

// Push notifications for hearts and comments on your paintings (A30). The
// website sends them (W13) and decides what they say and when, in its
// lib/push-messages.ts, so changing the wording needs no app update.
//
// While notifications are on, this phone's Expo push token is saved on the
// website for the signed-in account; turning them off or logging out forgets
// it there. Expo Go on Android can't get pushes (pushAvailable is false).

// Shown while the app is open? false: no banner, Activity's count and the app
// icon catch up instead (usePush). true: the banner and sound too.
export const SHOW_WHILE_OPEN = false;

// Android: the channel pushes arrive on, listed under this name in the
// phone's settings. The website sends to this id (ANDROID_CHANNEL in its
// lib/push.ts). Android keeps a channel's importance once it's made, so
// changing that needs a new id on both sides.
const CHANNEL_ID = 'default';
const CHANNEL_NAME = 'Hearts and comments';

// The token saved on the website for this phone, and whose it is.
const REGISTRATION_KEY = 'jp_push';
// Set once the after-a-post question has been asked on this phone.
const ASKED_KEY = 'jp_push_asked';

const TOKEN_FAILED = "Couldn't turn on notifications. Try again.";

export const pushAvailable = Platform.OS !== 'web' && !!Notifications;

type Registration = { token: string; userId: string };

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: SHOW_WHILE_OPEN,
    shouldShowList: SHOW_WHILE_OPEN,
    shouldPlaySound: SHOW_WHILE_OPEN,
    shouldSetBadge: false,
  }),
});

async function readRegistration(): Promise<Registration | null> {
  try {
    const saved = await AsyncStorage.getItem(REGISTRATION_KEY);
    return saved ? (JSON.parse(saved) as Registration) : null;
  } catch {
    return null;
  }
}

export async function clearPushRegistration() {
  await AsyncStorage.removeItem(REGISTRATION_KEY).catch(() => {});
}

// Android needs the channel before it asks for permission or hands out a token.
async function ensureChannel() {
  if (Platform.OS !== 'android' || !Notifications) return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: CHANNEL_NAME,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function currentToken(): Promise<string> {
  if (!Notifications) throw new Error(TOKEN_FAILED);
  await ensureChannel();
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    throw new Error(TOKEN_FAILED);
  }
}

async function saveToken(token: string, userId: string) {
  await api('push-tokens', { method: 'POST', body: { token, platform: Platform.OS } });
  await AsyncStorage.setItem(REGISTRATION_KEY, JSON.stringify({ token, userId }));
}

/** Pushes reach this phone for this account: saved, and still allowed in the phone's settings. */
export async function isPushOn(userId: string): Promise<boolean> {
  if (!Notifications) return false;
  const saved = await readRegistration();
  if (saved?.userId !== userId) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

// 'declined': the system prompt was just answered no. 'blocked': it can't be
// shown any more, so only the phone's settings can turn notifications on.
export type TurnOnResult = 'on' | 'declined' | 'blocked';

/** Asks for permission (the system prompt, unless it was answered before), then saves this phone. */
export async function turnOnPush(userId: string): Promise<TurnOnResult> {
  if (!Notifications) return 'blocked';
  await ensureChannel();
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) return 'blocked';
    permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return 'declined';
  }
  await saveToken(await currentToken(), userId);
  return 'on';
}

/** Stops pushes to this phone. Throws when the website can't be reached, so the switch stays on. */
export async function turnOffPush() {
  const saved = await readRegistration();
  if (saved) await api('push-tokens', { method: 'DELETE', body: { token: saved.token } });
  await clearPushRegistration();
}

/** Logging out: forgets this phone on the website while the login still works. */
export async function forgetPushOnLogout() {
  await turnOffPush().catch(clearPushRegistration);
}

/**
 * At launch and sign-in. A phone's token can change now and then: the new one
 * is saved. A token left by an account that was logged out without forgetting
 * it (the login ended elsewhere) is moved here and forgotten, so that
 * account's pushes stop coming to this phone.
 */
export async function refreshPush(userId: string) {
  if (!Notifications) return;
  const saved = await readRegistration();
  if (!saved) return;
  if (saved.userId !== userId) {
    await clearPushRegistration();
    await api('push-tokens', { method: 'POST', body: { token: saved.token, platform: Platform.OS } });
    await api('push-tokens', { method: 'DELETE', body: { token: saved.token } });
    return;
  }
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  const token = await currentToken();
  if (token !== saved.token) await saveToken(token, userId);
}

/**
 * After a post, once per phone: whether to ask about notifications. Not when
 * they're on already, or when the phone's settings have them off for good.
 */
export async function shouldAskAfterPost(userId: string): Promise<boolean> {
  if (!Notifications) return false;
  try {
    if (await AsyncStorage.getItem(ASKED_KEY)) return false;
    if (await isPushOn(userId)) return false;
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && !permission.canAskAgain) return false;
    await AsyncStorage.setItem(ASKED_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

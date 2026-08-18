/**
 * NOVA VIP bot configuration.
 * Edit the links below at any time — no other file needs to change.
 */

export const BOT_NAME = "NOVA VIP";

/** Public base URL used for the bot images (must be publicly reachable by Telegram). */
export const PUBLIC_BASE_URL =
  "https://project--a7b91c12-c102-4541-904a-98c62278c3c6-dev.lovable.app";

export const IMAGES = {
  welcome: `${PUBLIC_BASE_URL}/bot/welcome.jpg`,
  language: `${PUBLIC_BASE_URL}/bot/language.jpg`,
  steps: `${PUBLIC_BASE_URL}/bot/steps.jpg`,
  verified: `${PUBLIC_BASE_URL}/bot/verified.jpg`,
};

/** Telegram channel users must join. */
export const CHANNEL_URL = "https://t.me/novavip";
/** Support contact. */
export const SUPPORT_URL = "https://t.me/novavip_support";
/** The predictions web app (current site). */
export const APP_URL = `${PUBLIC_BASE_URL}/`;

export const PROMO_CODE = "1234";

export const PLATFORMS = {
  p1: { key: "p1", name: "1xBet", download: "https://1xbet.com/" },
  p2: { key: "p2", name: "1xBet2", download: "https://1xbet.com/" },
} as const;

export type PlatformKey = keyof typeof PLATFORMS;
export type Lang = "en" | "ar";

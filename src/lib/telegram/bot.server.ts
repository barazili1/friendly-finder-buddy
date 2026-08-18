import {
  APP_URL,
  BOT_NAME,
  CHANNEL_URL,
  IMAGES,
  PLATFORMS,
  PROMO_CODE,
  SUPPORT_URL,
  type Lang,
  type PlatformKey,
} from "./config";

const API = "https://api.telegram.org";

function token(): string {
  const t = process.env["TELEGRAM_BOT_TOKEN"];
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return t;
}

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Telegram ${method} failed [${res.status}]: ${text}`);
    return null;
  }
  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) console.error(`Telegram ${method} error: ${json.description}`);
  return json;
}

type Btn = { text: string; url?: string; callback_data?: string };

const sendPhoto = (
  chat_id: number,
  photo: string,
  caption: string,
  keyboard?: Btn[][],
) =>
  call("sendPhoto", {
    chat_id,
    photo,
    caption,
    parse_mode: "HTML",
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });

const sendMessage = (chat_id: number, text: string, keyboard?: Btn[][]) =>
  call("sendMessage", {
    chat_id,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });

const answerCallback = (id: string, text?: string) =>
  call("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });

const RULE = "━━━━━━━━━━━━━━━━━━";

/* ---------------------------------- copy --------------------------------- */

function welcomeCaption(name: string, lang: Lang = "ar") {
  const safe = escape(name);
  return lang === "en"
    ? `👑 <b>WELCOME TO ${BOT_NAME}</b> 👑\n${RULE}\nHello <b>${safe}</b>!\n\n⚡ Premium AI signals\n🎯 Elite accuracy\n💎 VIP members only\n${RULE}\n<i>Your journey starts now.</i>`
    : `👑 <b>مرحبًا بك في ${BOT_NAME}</b> 👑\n${RULE}\nأهلاً <b>${safe}</b>!\n\n⚡ إشارات ذكية احترافية\n🎯 دقة نخبوية\n💎 حصري لأعضاء VIP\n${RULE}\n<i>رحلتك تبدأ الآن.</i>`;
}

const LANG_CAPTION = `🌐 <b>SELECT YOUR LANGUAGE</b>\n${RULE}\n🇬🇧 English  •  🇸🇦 العربية\n${RULE}\n🌐 <b>اختر لغتك</b>`;

const T = {
  en: {
    platform: `🎰 <b>CHOOSE YOUR PLATFORM</b>\n${RULE}\nSelect the platform you want to activate with <b>${BOT_NAME}</b>.\n${RULE}`,
    step1: (p: string) => `<b>STEP 1 / 5</b>\n${RULE}\n📲 <b>Download the ${p} app</b>\n<i>Install the official application to continue.</i>`,
    dl: (p: string) => `⬇️ Download ${p}`,
    step2: `<b>STEP 2 / 5</b>\n${RULE}\n📢 <b>Join our Telegram channel</b>\n<i>All VIP signals are published there.</i>`,
    join: "🔔 Join the channel",
    step3: `<b>STEP 3 / 5</b>\n${RULE}\n🎁 <b>Create an account with the promo code</b>\n\n<code>${PROMO_CODE}</code>\n<i>Tap the code above to copy it.</i>`,
    copy: `📋 Copy code ${PROMO_CODE}`,
    copied: `Promo code ${PROMO_CODE} copied ✅`,
    step4: `<b>STEP 4 / 5</b>\n${RULE}\n💰 <b>Make a deposit</b>\nMinimum: <b>300 EGP</b> or <b>6 USD</b>\n<i>Required to unlock the VIP signals.</i>`,
    step5: `<b>STEP 5 / 5</b>\n${RULE}\n🆔 <b>Send your platform account ID</b>\nDigits only — between <b>10</b> and <b>14</b> numbers.\n\n<i>Example: 1234567890</i>`,
    badId: `⚠️ <b>Invalid ID</b>\n${RULE}\nSend <b>digits only</b>, between <b>10</b> and <b>14</b> numbers.`,
    idOk: (id: string) => `✅ <b>ID received:</b> <code>${id}</code>\n${RULE}\nAll steps completed. Tap below to finish.`,
    verify: "🔎 VERIFY NOW",
    verified: `✅ <b>VERIFICATION SUCCESSFUL</b>\n${RULE}\nWelcome to <b>${BOT_NAME}</b> 👑\nYour access is now active.\n${RULE}\n<i>Good luck and play responsibly.</i>`,
    open: "🚀 Open the app now",
    support: "🛠 Contact support",
    channel: "📢 Join Telegram",
    hint: `Send /start to begin.`,
  },
  ar: {
    platform: `🎰 <b>اختر المنصة</b>\n${RULE}\nاختر المنصة التي تريد تفعيلها مع <b>${BOT_NAME}</b>.\n${RULE}`,
    step1: (p: string) => `<b>الخطوة 1 / 5</b>\n${RULE}\n📲 <b>تحميل منصة ${p}</b>\n<i>حمّل التطبيق الرسمي للمتابعة.</i>`,
    dl: (p: string) => `⬇️ تحميل ${p}`,
    step2: `<b>الخطوة 2 / 5</b>\n${RULE}\n📢 <b>الانضمام لقناة التلجرام</b>\n<i>كل إشارات VIP تُنشر هناك.</i>`,
    join: "🔔 انضم للقناة",
    step3: `<b>الخطوة 3 / 5</b>\n${RULE}\n🎁 <b>إنشاء حساب باستخدام البروموكود</b>\n\n<code>${PROMO_CODE}</code>\n<i>اضغط على الكود لنسخه.</i>`,
    copy: `📋 نسخ الكود ${PROMO_CODE}`,
    copied: `تم نسخ البروموكود ${PROMO_CODE} ✅`,
    step4: `<b>الخطوة 4 / 5</b>\n${RULE}\n💰 <b>إيداع مبلغ</b>\nالحد الأدنى: <b>300 جنيه مصري</b> أو <b>6 دولار أمريكي</b>\n<i>مطلوب لفتح إشارات VIP.</i>`,
    step5: `<b>الخطوة 5 / 5</b>\n${RULE}\n🆔 <b>أرسل ID حسابك في المنصة</b>\nأرقام فقط — من <b>10</b> إلى <b>14</b> رقم.\n\n<i>مثال: 1234567890</i>`,
    badId: `⚠️ <b>ID غير صحيح</b>\n${RULE}\nأرسل <b>أرقام فقط</b> من <b>10</b> إلى <b>14</b> رقم.`,
    idOk: (id: string) => `✅ <b>تم استلام الـ ID:</b> <code>${id}</code>\n${RULE}\nتم إكمال كل الشروط. اضغط بالأسفل للإنهاء.`,
    verify: "🔎 التحقق الآن",
    verified: `✅ <b>تم التحقق بنجاح</b>\n${RULE}\nمرحبًا بك في <b>${BOT_NAME}</b> 👑\nتم تفعيل وصولك الآن.\n${RULE}\n<i>حظًا موفقًا واللعب بمسؤولية.</i>`,
    open: "🚀 فتح التطبيق الآن",
    support: "🛠 التواصل مع الدعم",
    channel: "📢 الاشتراك في التلجرام",
    hint: `أرسل /start للبدء.`,
  },
} as const;

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* --------------------------------- flows --------------------------------- */

async function sendSteps(chatId: number, lang: Lang, pk: PlatformKey) {
  const t = T[lang];
  const p = PLATFORMS[pk];
  await sendPhoto(chatId, IMAGES.steps, t.step1(p.name), [
    [{ text: t.dl(p.name), url: p.download }],
  ]);
  await sendMessage(chatId, t.step2, [[{ text: t.join, url: CHANNEL_URL }]]);
  await sendMessage(chatId, t.step3, [
    [{ text: t.copy, callback_data: `copy:${lang}` }],
  ]);
  await sendMessage(chatId, t.step4);
  await sendMessage(chatId, t.step5, [
    [{ text: t.verify, callback_data: `verify:${lang}` }],
  ]);
}

async function sendVerified(chatId: number, lang: Lang) {
  const t = T[lang];
  await sendPhoto(chatId, IMAGES.verified, t.verified, [
    [{ text: t.open, url: APP_URL }],
    [{ text: t.support, url: SUPPORT_URL }],
    [{ text: t.channel, url: CHANNEL_URL }],
  ]);
}

export async function handleUpdate(update: any) {
  const cb = update?.callback_query;
  if (cb) {
    const chatId = cb.message?.chat?.id as number | undefined;
    const data = String(cb.data ?? "");
    if (!chatId) return;
    const [action, arg] = data.split(":");
    const lang: Lang = arg === "en" ? "en" : "ar";

    if (action === "lang") {
      await answerCallback(cb.id);
      await sendPhoto(chatId, IMAGES.steps, T[lang].platform, [
        [{ text: `🎯 ${PLATFORMS.p1.name}`, callback_data: `plat:${lang}:p1` }],
        [{ text: `🎯 ${PLATFORMS.p2.name}`, callback_data: `plat:${lang}:p2` }],
      ]);
      return;
    }
    if (action === "plat") {
      const pk = (data.split(":")[2] === "p2" ? "p2" : "p1") as PlatformKey;
      await answerCallback(cb.id);
      await sendSteps(chatId, lang, pk);
      return;
    }
    if (action === "copy") {
      await answerCallback(cb.id, T[lang].copied);
      await sendMessage(chatId, `<code>${PROMO_CODE}</code>`);
      return;
    }
    if (action === "verify") {
      await answerCallback(cb.id);
      await sendVerified(chatId, lang);
      return;
    }
    await answerCallback(cb.id);
    return;
  }

  const msg = update?.message ?? update?.edited_message;
  const chatId = msg?.chat?.id as number | undefined;
  if (!chatId) return;
  const text = String(msg.text ?? "").trim();

  if (text.startsWith("/start")) {
    const name = msg.from?.first_name ?? "Player";
    await sendPhoto(chatId, IMAGES.welcome, welcomeCaption(name));
    await sendPhoto(chatId, IMAGES.language, LANG_CAPTION, [
      [
        { text: "🇬🇧 English", callback_data: "lang:en" },
        { text: "🇸🇦 العربية", callback_data: "lang:ar" },
      ],
    ]);
    return;
  }

  // Account ID submission: digits only, 10-14 characters.
  if (/^\d+$/.test(text)) {
    if (text.length >= 10 && text.length <= 14) {
      await sendMessage(chatId, T.ar.idOk(text), [
        [{ text: T.ar.verify, callback_data: "verify:ar" }],
      ]);
    } else {
      await sendMessage(chatId, T.ar.badId);
    }
    return;
  }

  await sendMessage(chatId, T.ar.hint);
}

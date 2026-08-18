import {
  appUrl,
  BOT_NAME,
  CHANNEL_URL,
  images,
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
  const text = await res.text();
  if (!res.ok) {
    console.error(`Telegram ${method} failed [${res.status}]: ${text}`);
    return null;
  }
  const json = JSON.parse(text) as { ok: boolean; description?: string };
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

/* --------------------------------- design -------------------------------- */

const RULE = "━━━━━━━━━━━━━━━━━━";
const TOP = "╔══════════════╗";
const BOT_ = "╚══════════════╝";

/** Neon progress bar: ▰▰▱▱▱ */
function bar(step: number, total = 5) {
  return "▰".repeat(step) + "▱".repeat(total - step);
}

function card(step: number, label: string, body: string) {
  return (
    `${TOP}\n` +
    `   <b>${label}</b>\n` +
    `${BOT_}\n` +
    `${bar(step)}  <b>${step}/5</b>\n` +
    `${RULE}\n` +
    `${body}`
  );
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
    step1: (p: string) =>
      card(
        1,
        "DOWNLOAD",
        `📲 <b>Install the ${p} app</b>\n\n• Use the official app only\n• Keep it installed to receive signals\n\n<i>Tap the button below.</i>`,
      ),
    dl: (p: string) => `⬇️ Download ${p}`,
    step2: card(
      2,
      "JOIN CHANNEL",
      `📢 <b>Join our Telegram channel</b>\n\n• All VIP signals are posted there\n• Never miss an update\n\n<i>Membership is checked at verification.</i>`,
    ),
    join: "🔔 Join the channel",
    step3: card(
      3,
      "PROMO CODE",
      `🎁 <b>Create your account with the promo code</b>\n\n┌──────────────┐\n│  <code>${PROMO_CODE}</code>\n└──────────────┘\n\n<i>Tap the code to copy it instantly.</i>`,
    ),
    copy: `📋 Copy code ${PROMO_CODE}`,
    copied: `Promo code ${PROMO_CODE} copied ✅`,
    step4: card(
      4,
      "DEPOSIT",
      `💰 <b>Fund your account</b>\n\n• Minimum <b>300 EGP</b>\n• or <b>6 USD</b>\n\n<i>Required to unlock VIP signals.</i>`,
    ),
    step5: card(
      5,
      "YOUR ID",
      `🆔 <b>Send your platform account ID</b>\n\n• Digits only\n• Between <b>10</b> and <b>14</b> numbers\n\n<i>Example: 1234567890</i>`,
    ),
    badId: `⚠️ <b>Invalid ID</b>\n${RULE}\nSend <b>digits only</b>, between <b>10</b> and <b>14</b> numbers.`,
    idOk: (id: string) =>
      `✅ <b>ID RECEIVED</b>\n${RULE}\n🆔 <code>${id}</code>\n${RULE}\n${bar(5)}  <b>5/5</b>\nAll steps completed — tap below.`,
    needId: "Send your account ID first (10-14 digits).",
    verify: "🔎 VERIFY NOW",
    verified: `✅ <b>VERIFICATION SUCCESSFUL</b>\n${RULE}\nWelcome to <b>${BOT_NAME}</b> 👑\nYour access is now active.\n${RULE}\n<i>Good luck and play responsibly.</i>`,
    open: "🚀 Open the app now",
    support: "🛠 Contact support",
    channel: "📢 Join Telegram",
    hint: `Send /start to begin.`,
  },
  ar: {
    platform: `🎰 <b>اختر المنصة</b>\n${RULE}\nاختر المنصة التي تريد تفعيلها مع <b>${BOT_NAME}</b>.\n${RULE}`,
    step1: (p: string) =>
      card(
        1,
        "التحميل",
        `📲 <b>تحميل منصة ${p}</b>\n\n• استخدم التطبيق الرسمي فقط\n• خليه مثبّت لاستقبال الإشارات\n\n<i>اضغط الزر بالأسفل.</i>`,
      ),
    dl: (p: string) => `⬇️ تحميل ${p}`,
    step2: card(
      2,
      "قناة التلجرام",
      `📢 <b>الانضمام لقناة التلجرام</b>\n\n• كل إشارات VIP تُنشر هناك\n• متفوّتش أي تحديث\n\n<i>يتم التأكد من الانضمام عند التحقق.</i>`,
    ),
    join: "🔔 انضم للقناة",
    step3: card(
      3,
      "البروموكود",
      `🎁 <b>إنشاء حساب باستخدام البروموكود</b>\n\n┌──────────────┐\n│  <code>${PROMO_CODE}</code>\n└──────────────┘\n\n<i>اضغط على الكود لنسخه فورًا.</i>`,
    ),
    copy: `📋 نسخ الكود ${PROMO_CODE}`,
    copied: `تم نسخ البروموكود ${PROMO_CODE} ✅`,
    step4: card(
      4,
      "الإيداع",
      `💰 <b>إيداع مبلغ في حسابك</b>\n\n• الحد الأدنى <b>300 جنيه مصري</b>\n• أو <b>6 دولار أمريكي</b>\n\n<i>مطلوب لفتح إشارات VIP.</i>`,
    ),
    step5: card(
      5,
      "الـ ID",
      `🆔 <b>أرسل ID حسابك في المنصة</b>\n\n• أرقام فقط\n• من <b>10</b> إلى <b>14</b> رقم\n\n<i>مثال: 1234567890</i>`,
    ),
    badId: `⚠️ <b>ID غير صحيح</b>\n${RULE}\nأرسل <b>أرقام فقط</b> من <b>10</b> إلى <b>14</b> رقم.`,
    idOk: (id: string) =>
      `✅ <b>تم استلام الـ ID</b>\n${RULE}\n🆔 <code>${id}</code>\n${RULE}\n${bar(5)}  <b>5/5</b>\nتم إكمال كل الشروط — اضغط بالأسفل.`,
    needId: "ابعت الـ ID الأول (من 10 لـ 14 رقم).",
    verify: "🔎 التحقق الآن",
    verified: `✅ <b>تم التحقق بنجاح</b>\n${RULE}\nمرحبًا بك في <b>${BOT_NAME}</b> 👑\nتم تفعيل وصولك الآن.\n${RULE}\n<i>حظًا موفقًا واللعب بمسؤولية.</i>`,
    open: "🚀 فتح التطبيق الآن",
    support: "🛠 التواصل مع الدعم",
    channel: "📢 الاشتراك في التلجرام",
    hint: `أرسل /start للبدء.`,
  },
} as const;

/* --------------------------------- flows --------------------------------- */

async function sendSteps(chatId: number, lang: Lang, pk: PlatformKey) {
  const t = T[lang];
  const p = PLATFORMS[pk];
  const img = images();
  await sendPhoto(chatId, img.steps, t.step1(p.name), [
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

async function sendVerified(chatId: number, lang: Lang, id?: string, name?: string) {
  const t = T[lang];
  await sendPhoto(chatId, images().verified, t.verified, [
    [{ text: t.open, url: appUrl(lang, id, name) }],
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
    const parts = data.split(":");
    const action = parts[0];
    const lang: Lang = parts[1] === "en" ? "en" : "ar";
    const name = cb.from?.first_name as string | undefined;

    if (action === "lang") {
      await answerCallback(cb.id);
      await sendPhoto(chatId, images().steps, T[lang].platform, [
        [{ text: `🎯 ${PLATFORMS.p1.name}`, callback_data: `plat:${lang}:p1` }],
        [{ text: `🎯 ${PLATFORMS.p2.name}`, callback_data: `plat:${lang}:p2` }],
      ]);
      return;
    }
    if (action === "plat") {
      const pk = (parts[2] === "p2" ? "p2" : "p1") as PlatformKey;
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
      const id = parts[2];
      if (!id || !/^\d{10,14}$/.test(id)) {
        await answerCallback(cb.id, T[lang].needId);
        await sendMessage(chatId, T[lang].step5);
        return;
      }
      await answerCallback(cb.id);
      await sendVerified(chatId, lang, id, name);
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
    await sendPhoto(chatId, images().welcome, welcomeCaption(name));
    await sendPhoto(chatId, images().language, LANG_CAPTION, [
      [
        { text: "🇬🇧 English", callback_data: "lang:en" },
        { text: "🇸🇦 العربية", callback_data: "lang:ar" },
      ],
    ]);
    return;
  }

  // Account ID submission: digits only, 10-14 characters.
  const digits = text.replace(/\D/g, "");
  if (digits && digits === text.replace(/\s/g, "")) {
    if (digits.length >= 10 && digits.length <= 14) {
      await sendMessage(chatId, T.ar.idOk(digits), [
        [{ text: T.ar.verify, callback_data: `verify:ar:${digits}` }],
      ]);
    } else {
      await sendMessage(chatId, T.ar.badId);
    }
    return;
  }

  await sendMessage(chatId, T.ar.hint);
}

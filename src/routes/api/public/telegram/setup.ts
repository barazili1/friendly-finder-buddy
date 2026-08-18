import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

/**
 * One-time webhook registration helper.
 *
 * After deploying (Vercel or anywhere else), open:
 *   https://<your-domain>/api/public/telegram/setup?token=<TELEGRAM_BOT_TOKEN>
 * It registers this deployment's /api/public/telegram/webhook with Telegram
 * and returns Telegram's getWebhookInfo response.
 */
export const Route = createFileRoute("/api/public/telegram/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const botToken = process.env["TELEGRAM_BOT_TOKEN"];
        if (!botToken) return new Response("Not configured", { status: 500 });

        const url = new URL(request.url);
        if (url.searchParams.get("token") !== botToken) {
          return new Response("Unauthorized", { status: 401 });
        }

        const secret = createHash("sha256")
          .update(`telegram-webhook:${botToken}`)
          .digest("base64url");
        const webhookUrl = `${url.origin}/api/public/telegram/webhook`;

        const api = `https://api.telegram.org/bot${botToken}`;
        const set = await fetch(`${api}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            secret_token: secret,
            allowed_updates: ["message", "edited_message", "callback_query"],
            drop_pending_updates: true,
          }),
        }).then((r) => r.json());

        const appBase = (process.env["PUBLIC_BASE_URL"] || url.origin).replace(/\/+$/, "");
        const menu = await fetch(`${api}/setChatMenuButton`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menu_button: {
              type: "web_app",
              text: "NOVA VIP",
              web_app: { url: `${appBase}/site/index.html?lang=ar&us=Guest&i=1` },
            },
          }),
        }).then((r) => r.json());

        const info = await fetch(`${api}/getWebhookInfo`).then((r) => r.json());
        return Response.json({ webhookUrl, set, menu, info });
      },
    },
  },
});

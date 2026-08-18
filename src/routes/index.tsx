import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cassa Predictor — Pronostics de jeux crash" },
      {
        name: "description",
        content:
          "Cassa Predictor : pronostics et signaux en temps réel pour Aviator, JetX, Chicken Run, Lucky Jet et autres jeux crash.",
      },
      { property: "og:title", content: "Cassa Predictor — Pronostics de jeux crash" },
      {
        property: "og:description",
        content:
          "Pronostics et signaux en temps réel pour les jeux crash les plus populaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ href: "/site/index.html" });
  },
  component: () => null,
});

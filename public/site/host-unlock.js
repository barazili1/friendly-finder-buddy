/**
 * Compatibility shim for the cloned Cassa Predictor site.
 *
 * The original bundles are obfuscated and hard-locked to the domains they were
 * deployed on (gerarrd7.github.io/cassaprono/ and amazing-jelly-603fc6.netlify.app),
 * showing a fake "Erreur de réception" screen anywhere else and redirecting to
 * the Netlify copy. This shim makes those host checks pass on the current
 * domain and blocks the forced redirect, without touching the bundles.
 */
(function () {
  // --- Bot / language verification removal -------------------------------
  // The bundles require a `lang` (and optionally user) parameter that the
  // Telegram bot normally injects; without it they show
  // "configure the language in the bot" and redirect to the bot. Injecting
  // defaults into the URL before the bundles run removes that check entirely.
  // --- Player ID coming from the Telegram bot ----------------------------
  // The bot's "Open the app" button carries ?i=<platform account ID>. It is
  // stored so it survives internal navigation, and shown in the header next
  // to the menu button.
  var UID_KEY = "nova_player_id";
  function storedUid() {
    try {
      var v = window.localStorage.getItem(UID_KEY);
      return v && /^\d{10,14}$/.test(v) ? v : "";
    } catch (e) {
      return "";
    }
  }
  var PLAYER_ID = "";

  try {
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get("i") || "";
    if (/^\d{10,14}$/.test(incoming)) {
      PLAYER_ID = incoming;
      try {
        window.localStorage.setItem(UID_KEY, incoming);
      } catch (e) {
        /* storage disabled */
      }
    } else {
      PLAYER_ID = storedUid();
    }
    var defaults = { us: "Guest", i: PLAYER_ID || "1" };
    var changed = false;
    // Arabic is forced on every page/route, even if another lang is passed in.
    if (params.get("lang") !== "ar") {
      params.set("lang", "ar");
      changed = true;
    }
    Object.keys(defaults).forEach(function (key) {
      if (!params.get(key)) {
        params.set(key, defaults[key]);
        changed = true;
      }
    });
    if (changed) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + "?" + params.toString() + window.location.hash,
      );
    }
    // Keep ?lang=ar on every internal navigation (game/prediction subpages).
    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!a) return;
        var href = a.getAttribute("href") || "";
        if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
        try {
          var url = new URL(a.href, window.location.href);
          if (url.origin !== window.location.origin) return;
          url.searchParams.set("lang", "ar");
          if (!url.searchParams.get("us")) url.searchParams.set("us", "Guest");
          if (!url.searchParams.get("i")) url.searchParams.set("i", "1");
          a.href = url.toString();
        } catch (err) {
          /* ignore malformed href */
        }
      },
      true,
    );
  } catch (e) {
    /* URL API unavailable: ignored */
  }


  var LOCKED_HOSTS = [
    "gerarrd7.github.io/cassaprono/",
    "gerard7.github.io/cassaprono/",
    
    "amazing-jelly-603fc6.netlify.app",
    "5510",
  ];
  var REDIRECT_TARGETS = ["netlify.app", "github.io", "t.me/"];


  function isLock(needle) {
    return typeof needle === "string" && LOCKED_HOSTS.indexOf(needle) !== -1;
  }
  function isHref(str) {
    return typeof str === "string" && /^(https?:|file:)/.test(str);
  }

  var rawIndexOf = String.prototype.indexOf;
  var rawIncludes = String.prototype.includes;

  String.prototype.indexOf = function (needle) {
    if (isLock(needle) && isHref(String(this))) return 0;
    return rawIndexOf.apply(this, arguments);
  };
  String.prototype.includes = function (needle) {
    if (isLock(needle) && isHref(String(this))) return true;
    return rawIncludes.apply(this, arguments);
  };

  function blocked(url) {
    var u = String(url || "");
    for (var i = 0; i < REDIRECT_TARGETS.length; i++) {
      if (rawIndexOf.call(u, REDIRECT_TARGETS[i]) !== -1) return true;
    }
    return false;
  }

  ["replace", "assign"].forEach(function (name) {
    var original = window.location[name];
    try {
      window.location[name] = function (url) {
        if (blocked(url)) return;
        return original.call(window.location, url);
      };
    } catch (e) {
      /* non-writable in this browser: ignored */
    }
  });

  var openOriginal = window.open;
  window.open = function (url) {
    if (blocked(url)) return null;
    return openOriginal.apply(window, arguments);
  };

  // --- Arabic localization layer -----------------------------------------
  // Some bundles (obfuscated) rewrite the UI text in French at runtime, so the
  // translation is applied live on the DOM. Layout stays LTR.
  var DICT = {
    "Bienvenue !": "مرحبًا!",
    "Avant de commencer, veuillez cliquer sur les": "قبل أن تبدأ، يرجى الضغط على",
    "trois barres du menu": "القائمة (ثلاثة خطوط)",
    "(\u261a) en haut \u00e0 droite de la page d'accueil, puis lire les": "(\u2630) أعلى يمين الصفحة الرئيسية، ثم اقرأ",
    "(\u2630) en haut \u00e0 droite de la page d'accueil, puis lire les": "(\u2630) أعلى يمين الصفحة الرئيسية، ثم اقرأ",
    ". Merci !": ". شكرًا!",
    "Conditions d'utilisation": "شروط الاستخدام",
    "Nos Jeux": "ألعابنا",
    "Nos Jeux Premium": "ألعابنا المميزة",
    "Tout": "الكل",
    "Favoris": "المفضلة",
    "Favori": "مفضلة",
    "Autres bet": "رهانات أخرى",
    "Autres Bets": "رهانات أخرى",
    "Menu": "القائمة",
    "Ouvrir le menu": "فتح القائمة",
    "Fermer le menu": "إغلاق القائمة",
    "Changer le mode": "تغيير الوضع",
    "Mode Sombre": "الوضع الليلي",
    "Profil utilisateur": "الملف الشخصي",
    "Rechercher un jeu...": "ابحث عن لعبة...",
    "Retour en haut": "العودة للأعلى",
    "Chargement de votre jeu...": "جاري تحميل لعبتك...",
    "Chargement...": "جاري التحميل...",
    "Loading...": "جاري التحميل...",
    "Pr\u00e9diction intelligente": "توقع ذكي",
    "Prediction intelligente": "توقع ذكي",
    "Syst\u00e8me de pr\u00e9diction intelligent": "نظام توقع ذكي",
    "Systeme de prediction intelligent": "نظام توقع ذكي",
    "Interface de Pr\u00e9diction": "واجهة التوقع",
    "Interface de Pr\u00e9diction Professionnelle": "واجهة التوقع الاحترافية",
    "Pr\u00e9diction de course": "توقع السباق",
    "Pr\u00e9dictions": "التوقعات",
    "Pr\u00e9diction": "التوقع",
    "PR\u00c9DICTION": "التوقع",
    "PREDICTION": "التوقع",
    "Pr\u00e9diction en cours...": "جاري التوقع...",
    "R\u00e9initialiser": "إعادة التعيين",
    "R\u00e9initialiser le jeu": "إعادة تعيين اللعبة",
    "Lancer la pr\u00e9diction": "بدء التوقع",
    "Retour": "رجوع",
    "\u2190 Retour": "\u2190 رجوع",
    "\ud83d\udd04 Retour": "\ud83d\udd04 رجوع",
    "Retour \u00e0 la page pr\u00e9c\u00e9dente": "الرجوع إلى الصفحة السابقة",
    "Cliquez sur NEXT SIGNAL": "اضغط على NEXT SIGNAL",
    "Cliquez sur\nNEXT SIGNAL": "اضغط على\nNEXT SIGNAL",
    "Cliquez sur PR\u00c9DICTION": "اضغط على التوقع",
    "Cliquez sur\nPR\u00c9DICTION": "اضغط على\nالتوقع",
    "Limite atteinte ! Cliquez sur R\u00e9initialiser": "تم الوصول إلى الحد! اضغط على إعادة التعيين",
    "\ud83c\udfaf Prochaine manche": "\ud83c\udfaf الجولة القادمة",
    "Prochaine manche": "الجولة القادمة",
    "Patience requise": "مطلوب بعض الصبر",
    "Veuillez patienter pendant": "يرجى الانتظار لمدة",
    "avant d'obtenir le coefficient suivant": "قبل الحصول على المعامل التالي",
    "D\u00e9sol\u00e9, an error occurred": "عذرًا، حدث خطأ",
    "Erreur de r\u00e9ception": "خطأ في الاستقبال",
    "Bient\u00f4t Disponible": "متاح قريبًا",
    "Le jeu est maintenant disponible !": "اللعبة متاحة الآن!",
    "Diminuer le nombre de pi\u00e8ges": "تقليل عدد الفخاخ",
    "Augmenter le nombre de pi\u00e8ges": "زيادة عدد الفخاخ",
    "Non recommand\u00e9": "غير مُوصى به",
    "FACILE": "سهل",
    "MOYEN": "متوسط",
    "secondes": "ثانية",
    "seconde": "ثانية"
  };
  var PLAY = /^Jouer \u00e0 (.+)$/;
  function translate(str) {
    if (typeof str !== "string") return str;
    var t = str.trim();
    if (!t) return str;
    if (DICT[t]) return str.replace(t, DICT[t]);
    var m = PLAY.exec(t);
    if (m) return str.replace(t, "العب " + m[1]);
    return str;
  }
  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      var out = translate(node.nodeValue);
      if (out !== node.nodeValue) node.nodeValue = out;
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    ["placeholder", "title", "aria-label"].forEach(function (attr) {
      var v = node.getAttribute && node.getAttribute(attr);
      if (v) {
        var out = translate(v);
        if (out !== v) node.setAttribute(attr, out);
      }
    });
    for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
  }
  function localize() {
    document.documentElement.setAttribute("lang", "ar");
    document.documentElement.setAttribute("dir", "ltr");
    walk(document.body);
  }
  function startLocalizer() {
    localize();
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        if (r.type === "characterData") walk(r.target);
        else if (r.type === "attributes") walk(r.target);
        else for (var i = 0; i < r.addedNodes.length; i++) walk(r.addedNodes[i]);
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startLocalizer);
  } else {
    startLocalizer();
  }
})();

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
  var LOCKED_HOSTS = [
    "gerarrd7.github.io/cassaprono/",
    "gerard7.github.io/cassaprono/",
    "github.io/cassaprono",
    "amazing-jelly-603fc6.netlify.app",
    "5510",
  ];
  var REDIRECT_TARGETS = ["netlify.app", "github.io"];

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
})();

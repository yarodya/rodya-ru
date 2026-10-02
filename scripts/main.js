window.readyPassword = "";
window.passwordHistory = [];

function makePassword() {
  var length = 16;
  var lower = "abcdefghijklmnopqrstuvwxyz";
  var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var digits = "0123456789";
  var special = "!-_+";
  var all = lower + upper + digits + special;
  var chars = [
    lower[crypto.getRandomValues(new Uint32Array(1))[0] % lower.length],
    upper[crypto.getRandomValues(new Uint32Array(1))[0] % upper.length],
    digits[crypto.getRandomValues(new Uint32Array(1))[0] % digits.length],
    special[crypto.getRandomValues(new Uint32Array(1))[0] % special.length],
  ];
  var values = crypto.getRandomValues(new Uint32Array(length - chars.length));

  for (var i = 0; i < values.length; i++) {
    chars.push(all[values[i] % all.length]);
  }

  for (var j = chars.length - 1; j > 0; j--) {
    var k = crypto.getRandomValues(new Uint32Array(1))[0] % (j + 1);
    var tmp = chars[j];
    chars[j] = chars[k];
    chars[k] = tmp;
  }

  return chars.join("");
}

function refreshPassword() {
  window.readyPassword = makePassword();
}

function copyPassword(el) {
  var password = window.readyPassword;
  if (!password) {
    refreshPassword();
    password = window.readyPassword;
  }

  var ta = document.createElement("textarea");
  ta.value = password;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, password.length);

  var ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(ta);

  if (!ok) {
    window.prompt("Скопируй пароль:", password);
  }

  window.passwordHistory.push(password);
  console.warn("[password] copied → " + password);

  refreshPassword();

  var prev = el.textContent;
  el.textContent = "✓";
  el.title = "Скопировано";

  setTimeout(function () {
    el.textContent = prev;
    el.title = "Скопировать пароль";
  }, 900);
}

var WEATHER_CACHE_KEY = "nsu-temp";

function readWeatherCache() {
  try {
    return localStorage.getItem(WEATHER_CACHE_KEY) || "";
  } catch (err) {
    return "";
  }
}

function writeWeatherCache(value) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, value);
  } catch (err) {}
}

function loadWeather() {
  var el = document.getElementById("weather-temp");
  if (!el) {
    return;
  }

  var cached = readWeatherCache();
  if (cached) {
    el.innerHTML = cached;
  }

  // Скрытый #temp — loadata.php пишет сюда, видимый кэш не мигает
  var sink = document.createElement("span");
  sink.id = "temp";
  sink.style.display = "none";
  document.body.appendChild(sink);

  var prevTitle = document.title;
  var noop = function () {};
  document.graph = {
    clear: noop,
    setStroke: noop,
    setColor: noop,
    drawLine: noop,
    drawString: noop,
    drawPolyline: noop,
    paint: noop,
  };

  var script = document.createElement("script");
  script.src =
    "https://weather.nsu.ru/loadata.php?tick=" +
    Math.floor(Date.now() / 1000) +
    "&rand=" +
    Math.random() +
    "&std=three";

  script.onload = function () {
    document.title = prevTitle;
    var match = (sink.textContent || "").match(/-?\d+(?:\.\d+)?/);
    if (match) {
      var value = Math.round(parseFloat(match[0])) + "&deg;";
      el.innerHTML = value;
      writeWeatherCache(value);
    }
    if (sink.parentNode) {
      sink.parentNode.removeChild(sink);
    }
    try {
      delete document.graph;
    } catch (err) {
      document.graph = undefined;
    }
  };

  script.onerror = function () {
    document.title = prevTitle;
    if (sink.parentNode) {
      sink.parentNode.removeChild(sink);
    }
  };

  document.head.appendChild(script);
}

refreshPassword();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadWeather);
} else {
  loadWeather();
}
